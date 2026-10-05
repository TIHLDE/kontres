import { env } from '@/env';

import { photonAudience, photonFetch, photonUrl } from './client';

/**
 * The two places this app has to reach past Auth.js and talk to Photon's OAuth
 * endpoints itself: adding `resource` to the token request, and renewing an
 * expired access token.
 */

/**
 * Auth.js builds the token request body itself and offers no way to add a
 * parameter to it — `token.params` is ignored for the authorization code grant.
 * `customFetch` is the one hook it does honour, so the parameter is injected
 * here, on the way out.
 *
 * Without `resource` Photon mints an opaque token (`tihlde_oat_…`) and its own
 * `requireAuth` rejects it, because that only understands JWTs. Every call the
 * app makes afterwards answers 401, which reads like an expired session rather
 * than a malformed token request.
 */
export const photonTokenFetch = async (
    ...args: Parameters<typeof fetch>
): Promise<Response> => {
    const [input, init] = args;
    const url =
        typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.href
              : input.url;

    if (url.includes('/oauth2/token') && init?.body instanceof URLSearchParams) {
        init.body.set('resource', photonAudience());
    }

    return fetch(...args);
};

/**
 * Fjerner id-tokenet fra svaret på kodebyttet.
 *
 * Photon signerer id-tokens med EdDSA. Auth.js sender svaret videre til
 * oauth4webapi, som validerer et id-token hvis det er der — også når
 * leverandøren er satt opp som `oauth` og tokenet ikke skal brukes til noe. Den
 * valideringen har verken en forventet algoritme eller en `jwks_uri` å gå på,
 * siden vi ikke bruker discovery, og faller på «unexpected JWT "alg" header
 * parameter».
 *
 * Vi trenger det ikke: profilen hentes fra userinfo, med et token vi nettopp
 * fikk over en direkte TLS-forbindelse til Photon. Så det tas ut her, som er
 * det `conform` er til for.
 */
export const stripIdToken = async (
    response: Response,
): Promise<Response | undefined> => {
    if (!response.ok) return undefined;

    let body: Record<string, unknown>;
    try {
        body = (await response.json()) as Record<string, unknown>;
    } catch {
        return undefined;
    }

    if (!('id_token' in body)) return undefined;

    delete body.id_token;

    return new Response(JSON.stringify(body), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });
};

export type PhotonTokens = {
    accessToken: string;
    refreshToken: string | null;
    /** Unix seconds. */
    expiresAt: number;
};

/**
 * Renewals in flight, keyed by the refresh token being spent.
 *
 * Photon rotates refresh tokens and treats a second use of the same one as
 * theft: it drops the whole chain and the member is signed out. A page that
 * renders several server components at once runs the JWT callback more than
 * once with the same cookie, so without this they would race and the second
 * one would look exactly like a stolen token.
 */
const inFlight = new Map<string, Promise<PhotonTokens | null>>();

/** Trade the refresh token for a new access token. Null means "sign out". */
export async function refreshPhotonTokens(
    refreshToken: string,
): Promise<PhotonTokens | null> {
    const existing = inFlight.get(refreshToken);
    if (existing) return existing;

    const request = performRefresh(refreshToken).finally(() => {
        inFlight.delete(refreshToken);
    });

    inFlight.set(refreshToken, request);
    return request;
}

async function performRefresh(
    refreshToken: string,
): Promise<PhotonTokens | null> {
    const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: env.PHOTON_OAUTH_CLIENT_ID,
        // The audience is decided per issuance, so it has to be sent again here
        // — a renewal without it hands back an opaque token.
        resource: photonAudience(),
    });

    const response = await photonFetch(photonUrl('/api/auth/oauth2/token'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
                `${env.PHOTON_OAUTH_CLIENT_ID}:${env.PHOTON_OAUTH_CLIENT_SECRET}`,
            ).toString('base64')}`,
        },
        body,
    });

    if (!response.ok) {
        console.error(
            '[photon] refresh failed',
            response.status,
            await response.text().catch(() => ''),
        );
        return null;
    }

    const data = (await response.json()) as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
    };

    if (!data.access_token) return null;

    return {
        accessToken: data.access_token,
        // Rotation is the norm, but a provider that returns nothing here means
        // "keep using the one you have".
        refreshToken: data.refresh_token ?? refreshToken,
        expiresAt:
            Math.floor(Date.now() / 1000) +
            (typeof data.expires_in === 'number' ? data.expires_in : 3600),
    };
}
