'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function loginUser(
    username: string,
    password: string,
    redirectUrl?: string,
) {
    try {
        await signIn('tihlde', {
            redirect: false,
            redirectTo: redirectUrl,
            username,
            password,
        });
        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            if (error.type === 'CredentialsSignin') {
                return { 
                    success: false, 
                    error: 'Ugyldig brukernavn eller passord' 
                };
            }
            return { 
                success: false, 
                error: 'Noe gikk galt. Prøv igjen senere.' 
            };
        }
        return { 
            success: false, 
            error: 'Noe gikk galt. Prøv igjen senere.' 
        };
    }
}
