// Main file for interacting with lepton services
import { URLS } from './api/urls';
import { env } from '@/env';

const getHeaders = (headers?: HeadersInit, token?: string) => {
    return {
        'x-csrf-token': token ?? '',
        'Content-Type': 'application/json',
        ...headers,
    };
};

const getUserById = async (userId: string, requestToken: string) => {
    return fetch(`${env.LEPTON_API_URL}/${URLS.USERS}/${userId}/`, {
        headers: {
            ...getHeaders(undefined, requestToken),
        },
    });
};

const getReservations = async (requestToken: string) => {
    const response = await fetch(
        `${env.LEPTON_API_URL}/${URLS.RESERVATIONS}/`,
        {
            headers: {
                ...getHeaders(undefined, requestToken),
            },
        },
    );

    if (!response.ok) {
        console.error(
            'Failed to fetch reservations from Lepton',
            response.status,
            response.statusText,
        );
        throw new Error('Failed to fetch reservations');
    }

    return response.json();
};

const Lepton = {
    getUserById,
    getReservations,
};

export default Lepton;
