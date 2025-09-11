import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loadingspinner';

import FaqList from './components/faq-list';
import { auth } from '@/auth';
import { api } from '@/trpc/server';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function page() {
    const session = await auth();
    const isAdmin = session?.user.role === 'ADMIN';

    return (
        <div className="max-w-page mx-auto min-h-screen flex flex-col gap-10 w-full">
            <div className="flex flex-row justify-between items-center">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl w-fit">
                    FAQ
                </h1>
                {isAdmin && (
                    <Link href={'./faq/create/'} className="w-fit">
                        <Button className='gap-2.5'>
                            <Plus size={16} strokeWidth={2.5}/>
                            Opprett ny
                        </Button>
                    </Link>
                )}
            </div>
            <FaqList />
        </div>
    );
}
