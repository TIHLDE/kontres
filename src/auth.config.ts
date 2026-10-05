import { env } from '@/env';
import { photonAudience } from './server/services/photon/client';
import { fetchPhotonUserInfo } from './server/services/photon/get-user';
import { photonTokenFetch, stripIdToken } from './server/services/photon/oauth';
import { customFetch } from 'next-auth';
import type { NextAuthConfig } from 'next-auth';

/**
 * Delen av oppsettet som ikke snakker med Photon.
 *
 * `middleware.ts` bygger sin egen NextAuth-instans på denne. Det er ikke bare
 * for edge-kompatibilitet: mellomvaren kjører i en annen prosess enn serveren,
 * med sin egen kopi av modulene. Kjørte tokenfornyelsen der også, ville de to
 * kopiene brukt det samme refresh-tokenet hver for seg, og Photon ville lest
 * det som tyveri. Mellomvaren trenger uansett bare å vite om noen er logget inn
 * og om de er admin, og begge deler ligger allerede i JWT-en.
 */

export type UserRole = 'ADMIN' | 'MEMBER';

export type UserData = {
    /**
     * TIHLDE-brukernavnet, ikke Photons UUID.
     *
     * `Reservation.authorId`, `approvedById` og `soberWatch` er fulle av
     * brukernavn fra Lepton-tiden, og Photon tok dem med seg uendret i
     * migreringen. Å bytte til UUID her ville koblet hver eneste eksisterende
     * reservasjon fra den som står bak den.
     */
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: UserRole;
    groups: string[];
    leaderOf: string[];
};

declare module 'next-auth' {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends UserData {}
    type AdapterUser = object;

    interface Session {
        user: UserData;
        /**
         * Nøkkelen til `PhotonSession`-raden med access-tokenet.
         *
         * Selve tokenet ligger ikke her. Sesjonen sendes til nettleseren av
         * `/api/auth/session`, og en id uten tilgang til basen er ubrukelig —
         * et bearer-token ville ikke vært det.
         */
        photonSessionId?: string;
    }
}

export const authConfig: NextAuthConfig = {
    session: { strategy: 'jwt' },
    pages: { signIn: '/login' },
    providers: [
        {
            id: 'tihlde',
            name: 'TIHLDE',
            /**
             * `oauth`, ikke `oidc`: uten discovery mangler Auth.js `jwks_uri`,
             * og da klarer den ikke å verifisere id-tokenet en OIDC-leverandør
             * må levere. Profilen hentes fra userinfo i stedet, med et token vi
             * nettopp fikk over en direkte forbindelse til Photon.
             */
            type: 'oauth',
            clientId: env.PHOTON_OAUTH_CLIENT_ID,
            clientSecret: env.PHOTON_OAUTH_CLIENT_SECRET,
            issuer: photonAudience(),
            authorization: {
                url: `${photonAudience()}/oauth2/authorize`,
                /**
                 * `offline_access` er det som gjør at Photon i det hele tatt
                 * utsteder et refresh-token. Uten det varer innloggingen én
                 * time, og så står brukeren i innloggingsbildet igjen.
                 */
                params: { scope: 'openid profile email offline_access' },
            },
            token: {
                url: `${photonAudience()}/oauth2/token`,
                conform: stripIdToken,
            },
            userinfo: {
                url: `${photonAudience()}/oauth2/userinfo`,
                request: ({ tokens }: { tokens: { access_token?: string } }) =>
                    fetchPhotonUserInfo(tokens.access_token ?? ''),
            },
            checks: ['pkce', 'state'],
            profile(profile: Record<string, unknown>) {
                const str = (v: unknown) =>
                    typeof v === 'string' && v.length > 0 ? v : null;

                return {
                    // Fylles ut skikkelig i `jwt` i `auth.ts`, som også har
                    // tokenet som skal til for å hente grupper og lederroller.
                    id: str(profile.sub) ?? '',
                    firstName: '',
                    lastName: '',
                    profilePicture: str(profile.picture) ?? '',
                    role: 'MEMBER' as UserRole,
                    groups: [],
                    leaderOf: [],
                    email: str(profile.email) ?? undefined,
                    name: str(profile.name) ?? undefined,
                };
            },
            [customFetch]: photonTokenFetch,
        },
    ],
    callbacks: {
        // @ts-expect-error Session is not in the correct format
        session({ session, token }) {
            const sessionData = session as never as {
                user: UserData;
                photonSessionId?: string;
            };

            sessionData.user = token.user as UserData;
            sessionData.photonSessionId = token.photonSessionId as
                | string
                | undefined;

            return sessionData;
        },
    },
};
