import { type UserData, type UserRole, authConfig } from './auth.config';
import { PhotonError } from './server/services/photon/client';
import {
    type PhotonUser,
    getPhotonUser,
    groupSlugs,
    isAdmin,
    leaderOf,
    splitName,
} from './server/services/photon/get-user';
import {
    createPhotonSession,
    deletePhotonSession,
    getValidAccessToken,
} from './server/services/photon/session';
import NextAuth from 'next-auth';

/**
 * Innlogging mot Photon, TIHLDEs identitetsleverandør.
 *
 * Erstatter passord-innloggingen mot Lepton. Den tok imot brukernavn og passord
 * i klartekst, sendte dem videre til `POST /auth/login/`, og lagret API-tokenet
 * som kom tilbake — en nøkkel til hele TIHLDE-kontoen — så lenge økten levde.
 * Nå skrives passordet bare hos Photon, og det vi får er et kortlevd token med
 * avgrenset tilgang, som ligger i basen og aldri når nettleseren.
 *
 * Leverandøren og sesjonsformen står i `auth.config.ts`, som `middleware.ts`
 * deler. Her ligger bare det som må snakke med Photon.
 */

export type { UserData } from './auth.config';
export type SessionUserData = UserData;

/**
 * Hvor ofte gruppemedlemskap og adminstatus hentes på nytt.
 *
 * Lepton-versjonen hentet dette ved hvert eneste kall til `jwt`, altså flere
 * ganger per sidevisning. Rettigheter endres ikke i det tempoet, og et kvarter
 * er kort nok til at en fjernet leder mister knappene sine i praksis.
 */
const PROFILE_MAX_AGE_SECONDS = 15 * 60;

const toUserData = (profile: PhotonUser, fallbackId: string): UserData => {
    const { firstName, lastName } = splitName(profile.name);

    return {
        id: (profile.username ?? fallbackId).toLowerCase(),
        firstName,
        lastName,
        profilePicture: profile.image ?? '',
        role: (isAdmin(profile) ? 'ADMIN' : 'MEMBER') as UserRole,
        groups: groupSlugs(profile),
        leaderOf: leaderOf(profile),
    };
};

/**
 * En feil fra Photon som betyr at medlemmet ikke lenger slipper inn, i motsetning
 * til at Photon var utilgjengelig et øyeblikk. Bare den første skal logge ut —
 * ellers kaster et nettverksglipp alle ut av appen.
 */
const isRejection = (err: unknown): boolean =>
    err instanceof PhotonError && [401, 403, 404].includes(err.status);

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    callbacks: {
        ...authConfig.callbacks,

        async jwt({ token, account, profile }) {
            const now = Math.floor(Date.now() / 1000);

            // ===== Fersk innlogging =====
            if (account?.access_token) {
                const subject =
                    (typeof profile?.sub === 'string' ? profile.sub : null) ??
                    account.providerAccountId;

                try {
                    const photonUser = await getPhotonUser(
                        account.access_token,
                        subject,
                    );

                    token.user = toUserData(photonUser, subject);
                    token.photonSessionId = await createPhotonSession({
                        subject,
                        accessToken: account.access_token,
                        refreshToken: account.refresh_token ?? null,
                        expiresAt: new Date(
                            (typeof account.expires_at === 'number'
                                ? account.expires_at
                                : now + 3600) * 1000,
                        ),
                    });
                    token.profileCheckedAt = now;

                    return token;
                } catch (err) {
                    console.error(
                        '[auth] kunne ikke hente profil fra Photon',
                        err,
                    );
                    return null;
                }
            }

            const sessionId = token.photonSessionId as string | undefined;
            if (!sessionId || !token.user) return null;

            const checkedAt =
                (token.profileCheckedAt as number | undefined) ?? 0;
            if (now - checkedAt < PROFILE_MAX_AGE_SECONDS) return token;

            // ===== Hent grupper og adminstatus på nytt en gang i blant =====
            const tokens = await getValidAccessToken(sessionId);
            if (!tokens) return null;

            try {
                const photonUser = await getPhotonUser(
                    tokens.accessToken,
                    tokens.subject,
                );
                token.user = toUserData(photonUser, tokens.subject);
                token.profileCheckedAt = now;
            } catch (err) {
                if (isRejection(err)) {
                    console.log(
                        '[auth] Photon avviste medlemmet, logger ut',
                        err,
                    );
                    await deletePhotonSession(sessionId);
                    return null;
                }
                // Photon var nede. Behold det vi har og prøv igjen senere,
                // heller enn å kaste ut alle som er innlogget.
                console.error('[auth] kunne ikke oppdatere profil', err);
            }

            return token;
        },
    },
    events: {
        async signOut(message) {
            const sessionId =
                'token' in message
                    ? (message.token?.photonSessionId as string | undefined)
                    : undefined;

            if (sessionId) await deletePhotonSession(sessionId);
        },
    },
});
