// Main file for interacting with Photon, TIHLDE's API
import { getPhotonGroups } from './services/photon/get-groups';
import { type PhotonUser, getPhotonUser } from './services/photon/get-user';

/**
 * Replaces the old `Lepton` client on the tRPC context. The shape is a little
 * different on purpose: Lepton handed back raw `Response` objects and left
 * every caller to check `ok` and parse, while these throw a `PhotonError` with
 * the status on them.
 */
const Photon = {
    getUserById: (userId: string, accessToken: string): Promise<PhotonUser> =>
        getPhotonUser(accessToken, userId),
    getGroups: getPhotonGroups,
};

export default Photon;
