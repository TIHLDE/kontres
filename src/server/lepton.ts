// Main file for interacting with lepton services
import { URLS } from './api/urls';
import { env } from '@/env';

const getHeaders = (headers?: HeadersInit, token?: string) => {
    return {
        'x-csrf-token': token ?? '',
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

const Lepton = {
    getUserById,
};

export default Lepton;
