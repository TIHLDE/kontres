import { Card } from '@/components/ui/card';

import { SessionProvider } from 'next-auth/react';
import CreateFaqForm from '../components/CreateFaqForm';


export default async function page() {
    return (
        <SessionProvider>
            <div className="max-w-2xl mx-auto min-h-screen gap-5 justify-center">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl w-fit p-4">
                    Opprett ny FAQ
                </h1>
                <Card className="p-4 h-fit max-w-2xl">
                    <CreateFaqForm />
                </Card>
            </div>
        </SessionProvider>
    );
}