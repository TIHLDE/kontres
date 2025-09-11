import { env } from '../../../env';

/**
 * Return basic user info from a given TIHLDE user
 * @param token TIHLDE token
 * @param username TIHLDE username
 * @returns Information about the user
 */
export const getTIHLDEUser = async (
    token: string,
    username: string,
): Promise<TIHLDEUser> => {
    const response = await fetch(`${env.LEPTON_API_URL}/users/${username}/`, {
        headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': token,
        },
    });

    if (!response.ok) {
        console.error(
            response.status,
            response.statusText,
            await response.json(),
        );
        throw new Error('Failed to fetch user');
    }

    return (await response.json()) as TIHLDEUser;
};

export interface TIHLDEUser {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    image?: string;
    gender: number;
    study: {
        membership_type: string;
    };
}
