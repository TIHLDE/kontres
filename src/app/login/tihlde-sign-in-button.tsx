'use client';

import { Button } from '@/components/ui/button';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

/**
 * Innloggingsknappen, med vilje som klientkall og ikke som server action.
 *
 * Server actions får en id av en build-hash. En fane som ble åpnet før en
 * deploy sitter dermed med en id som ikke finnes etterpå, og klikket svarer
 * «Failed to find Server Action» — som Next.js viser som en blank
 * «Something went wrong». Brukeren kommer da aldri av gårde til tihlde.org,
 * og siden Kontres deployer ofte, traff det nettopp den ene knappen som må
 * virke. Vi så ni slike i loggene på fire døgn.
 *
 * `signIn` fra next-auth/react henter CSRF-token selv og poster til
 * `/api/auth/signin/tihlde`. Den ruta er den samme på tvers av deploys, så en
 * gammel fane fungerer like godt som en fersk.
 */
export function TihldeSignInButton({ redirectTo }: { redirectTo: string }) {
    const [sending, setSending] = useState(false);

    return (
        <Button
            className="w-full"
            disabled={sending}
            onClick={() => {
                setSending(true);
                // Lykkes den, forlater vi siden uansett. Feiler den, er det
                // eneste rimelige å la brukeren prøve igjen.
                void signIn('tihlde', { redirectTo }).catch(() =>
                    setSending(false),
                );
            }}
        >
            {sending ? 'Sender deg til TIHLDE …' : 'Logg inn med TIHLDE'}
        </Button>
    );
}
