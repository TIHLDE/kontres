/**
 * The bit of a TIHLDE member this app shows next to a reservation.
 *
 * The snake_case names are Lepton's, kept because every table and card in the
 * UI reads them and because renaming them buys nothing — the data now comes
 * from Photon's `GET /api/user/:id`, mapped in `toReservationAuthor` below.
 */
export type User = {
    user_id: string;
    first_name: string;
    last_name: string;
    image: string;
    email: string;
};

import { type PhotonUser, splitName } from '../services/photon/get-user';

export function toReservationAuthor(
    profile: PhotonUser,
    fallbackId: string,
): User {
    const { firstName, lastName } = splitName(profile.name);

    return {
        user_id: profile.username ?? fallbackId,
        first_name: firstName,
        last_name: lastName,
        image: profile.image ?? '',
        email: profile.email ?? '',
    };
}
