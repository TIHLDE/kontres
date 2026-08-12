import { photonGet } from './client';

/**
 * Every group in TIHLDE.
 *
 * `GET /api/groups` is open, but the member's token is sent anyway so the call
 * is attributable and behaves the same as the rest of the client.
 */
export const getPhotonGroups = async (
    accessToken?: string,
): Promise<PhotonGroup[]> =>
    photonGet<PhotonGroup[]>('/api/groups', accessToken, 'gruppene');

/**
 * Photon reports group types in lower case (`committee`), Lepton used upper
 * (`COMMITTEE`). The upper-case form is what this app's `AllowedGroupType` and
 * the components reading it expect, so the translation happens here rather than
 * rippling through the UI.
 */
export type PhotonGroup = {
    name: string;
    slug: string;
    type: string;
    logoUrl?: string | null;
};

export function normalizeGroupType(type: string): string {
    return type.toUpperCase();
}
