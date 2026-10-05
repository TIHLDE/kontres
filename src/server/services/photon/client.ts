import { env } from '@/env';

/**
 * Low-level HTTP against Photon, TIHLDE's API and identity provider.
 *
 * Replaces the Lepton client this app used to run. Lepton authenticated with a
 * long-lived account token passed as `x-csrf-token`; Photon takes an OAuth
 * access token as a normal bearer, and that token is scoped and short-lived.
 */

/** How long we wait for Photon before giving up on a request. */
const TIMEOUT_MS = 10_000;

/** Raised when Photon answers, but not with what we asked for. */
export class PhotonError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
        this.name = 'PhotonError';
    }
}

/**
 * Raised when Photon could not be reached at all — timeout, DNS, TLS.
 *
 * Kept apart from `PhotonError` because the advice is the opposite of "check
 * what you sent", and a 500 here is not the caller's fault.
 */
export class PhotonUnavailableError extends PhotonError {
    constructor(readonly cause?: unknown) {
        super('Får ikke kontakt med TIHLDE akkurat nå. Prøv igjen.', 503);
        this.name = 'PhotonUnavailableError';
    }
}

/**
 * Zod-standarden i `env.js` gjelder ikke når `SKIP_ENV_VALIDATION` er satt —
 * som er nettopp slik Docker-bygget kjører `next build`. Da er `env` rå
 * `process.env`, og `PHOTON_API_URL` kan være `undefined`. Fallbacken er den
 * samme verdien som standarden, så bygget ikke kræsjer på en `.replace` av
 * ingenting.
 */
const PHOTON_API_URL_FALLBACK = 'https://photon.tihlde.org';

export const photonUrl = (path: string) =>
    `${(env.PHOTON_API_URL ?? PHOTON_API_URL_FALLBACK).replace(/\/$/, '')}${path}`;

/**
 * The audience Photon issues JWT access tokens for.
 *
 * Sent as `resource` on every token request. Without it the provider mints an
 * opaque token, which Photon's own `requireAuth` rejects with 401 — every call
 * below would fail with what looks like an expired session. The value has to be
 * exactly the auth base URL; `validAudiences` is not configured, so anything
 * else is refused.
 */
export const photonAudience = () => photonUrl('/api/auth');

export async function photonFetch(
    url: string,
    init: RequestInit = {},
): Promise<Response> {
    try {
        return await fetch(url, {
            ...init,
            cache: 'no-store',
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    } catch (err) {
        throw new PhotonUnavailableError(err);
    }
}

/** A GET against Photon carrying the member's own access token. */
export async function photonGet<T>(
    path: string,
    accessToken: string | undefined,
    what: string,
): Promise<T> {
    const response = await photonFetch(photonUrl(path), {
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
        },
    });

    if (!response.ok) {
        console.error(
            `[photon] GET ${path} failed`,
            response.status,
            await response.text().catch(() => ''),
        );
        throw new PhotonError(`Kunne ikke hente ${what} fra TIHLDE.`, response.status);
    }

    return (await response.json()) as T;
}
