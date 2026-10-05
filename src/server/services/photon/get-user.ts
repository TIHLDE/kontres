import { PhotonError, photonFetch, photonGet, photonUrl } from './client';

/**
 * The OIDC userinfo claims, fetched with a freshly minted access token.
 *
 * Auth.js can call this endpoint itself, but it does so through oauth4webapi,
 * which refuses any URL that is not HTTPS — that makes a local Photon on
 * `http://localhost:4000` impossible to log in against. Going through our own
 * client also gives the call the same timeout and error types as everything
 * else here.
 */
export async function fetchPhotonUserInfo(
    accessToken: string,
): Promise<Record<string, unknown>> {
    const response = await photonFetch(photonUrl('/api/auth/oauth2/userinfo'), {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        console.error(
            '[photon] userinfo failed',
            response.status,
            await response.text().catch(() => ''),
        );
        throw new PhotonError(
            'Kunne ikke hente brukeren din fra TIHLDE.',
            response.status,
        );
    }

    return (await response.json()) as Record<string, unknown>;
}

/**
 * A member's profile, read with their own access token.
 *
 * Photon's `GET /api/user/:id` accepts either the user id or the username, and
 * the usernames came across unchanged in the Lepton migration — which is what
 * lets this app keep looking people up by the ids already stored in
 * `Reservation.authorId`.
 */
export const getPhotonUser = async (
    accessToken: string,
    identifier: string,
): Promise<PhotonUser> =>
    photonGet<PhotonUser>(
        `/api/user/${encodeURIComponent(identifier)}`,
        accessToken,
        'brukeren',
    );

export interface PhotonUserGroup {
    slug: string;
    name: string;
    type: string;
    logoUrl: string | null;
    /** "member" or "leader" — Photon's membership role, lowercase. */
    role: string;
}

export interface PhotonUser {
    id: string;
    name: string;
    username: string | null;
    email: string | null;
    image: string | null;
    bio: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    studyProgram: string | null;
    studyStartYear: number | null;
    groups: PhotonUserGroup[];
}

/**
 * Photon carries one display name, Lepton carried two. The UI shows them side
 * by side, so the name is split on the last space: everything before it is the
 * given name, the remainder the surname. A single-word name becomes the given
 * name with an empty surname rather than being duplicated.
 */
export function splitName(name: string): {
    firstName: string;
    lastName: string;
} {
    const trimmed = name.trim();
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace === -1) return { firstName: trimmed, lastName: '' };
    return {
        firstName: trimmed.slice(0, lastSpace),
        lastName: trimmed.slice(lastSpace + 1),
    };
}

/** Groups the member leads. Drives `groupLeaderProcedure`. */
export function leaderOf(user: PhotonUser): string[] {
    return user.groups
        .filter((g) => g.role.toLowerCase() === 'leader')
        .map((g) => g.slug);
}

/** Every group the member belongs to. */
export function groupSlugs(user: PhotonUser): string[] {
    return user.groups.map((g) => g.slug);
}

/**
 * Groups whose members administer this app. Unchanged from the Lepton setup —
 * Index drifter appen, HS eier den.
 */
const ADMIN_GROUP_SLUGS = ['index', 'hs'];

export function isAdmin(user: PhotonUser): boolean {
    const admin = new Set(ADMIN_GROUP_SLUGS);
    return user.groups.some((g) => admin.has(g.slug.toLowerCase()));
}
