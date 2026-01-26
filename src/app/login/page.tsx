import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { LoginForm } from './components/LoginForm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Page(props: {
    searchParams?: Promise<{ redirect?: string }>;
}) {
    const searchParams = await props.searchParams;
    const redirectUrl = searchParams?.redirect ?? '/';

    const session = await auth();

    if (session?.user) redirect(redirectUrl);

    return (
        /* This isn't a very elegant solution..? */
        <div className="max-w-page mx-auto h-screen -mt-24 flex flex-col justify-center items-center">
            <Card className="w-80">
                <CardHeader>
                    <CardTitle className="text-center">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <LoginForm redirectUrl={redirectUrl} />
                </CardContent>
            </Card>
        </div>
    );
}
