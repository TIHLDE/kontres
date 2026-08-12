import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';

/**
 * Innlogging skjer hos TIHLDE.
 *
 * Passordskjemaet er borte: det sendte brukernavn og passord gjennom denne
 * appen til Lepton. Nå går man til photon.tihlde.org, skriver passordet der, og
 * kommer tilbake med et token som bare rekker det denne appen trenger.
 */
export default async function Page(props: {
    searchParams?: Promise<{ redirect?: string; error?: string }>;
}) {
    const searchParams = await props.searchParams;
    const redirectUrl = searchParams?.redirect ?? '/';

    const session = await auth();

    if (session?.user) redirect(redirectUrl);

    return (
        <div className="max-w-page mx-auto h-screen -mt-24 flex flex-col justify-center items-center">
            <Card className="w-96">
                <CardHeader>
                    <CardTitle className="text-center">Logg inn</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Du logger inn med TIHLDE-brukeren din. Du blir sendt til
                        tihlde.org og tilbake hit etterpå.
                    </p>
                    {searchParams?.error ? (
                        <p className="text-sm font-medium text-destructive text-center">
                            Innloggingen ble avbrutt. Prøv på nytt.
                        </p>
                    ) : null}
                    <form
                        action={async () => {
                            'use server';
                            await signIn('tihlde', { redirectTo: redirectUrl });
                        }}
                    >
                        <Button className="w-full" type="submit">
                            Logg inn med TIHLDE
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
