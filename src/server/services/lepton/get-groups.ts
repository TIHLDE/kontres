import { env } from '@/env';

/**
 * Get a TIHLDE user's group memberships information
 * @param token TIHLDE token
 * @returns The user's membership info
 */
export const getTIHLDEGroups = async (
    token?: string,
): Promise<GroupResponse[]> => {
    const response = await fetch(`${env.LEPTON_API_URL}/groups/`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'x-csrf-token': token } : {}),
        },
    });

    if (!response.ok) {
        console.error(
            response.status,
            response.statusText,
            await response.json(),
        );
        throw new Error('Failed to fetch memberships');
    }

    return await response.json();
};

type GroupResponse = {
    name: string;
    slug: string;
    type: 'STUDYYEAR' | 'STUDY' | 'COMMITTEE' | 'BOARD' | 'SUBGROUP';
};
