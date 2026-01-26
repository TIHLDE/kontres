'use client';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { UserRound } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface UserAreaProps extends React.HTMLProps<HTMLDivElement> {
    name: string;
    image: string;
    admin?: boolean;
}

export const UserArea = ({
    name,
    image,
    admin,
    className,
    ...props
}: UserAreaProps) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const signOutButton = async () => {
        setOpen(false);
        // Prevent NextAuth from doing a full redirect so we can control navigation client-side
        await signOut({ redirect: false });
        router.push('/');
        router.refresh();
    };

    const goToAdmin = () => {
        setOpen(false);
        router.push('/admin');
    };

    const goToMyPage = () => {
        setOpen(false);
        router.push('/min-side');
    };

    return (
        <div
            {...props}
            className={cn(
                'flex items-center justify-center w-fit',
                className,
            )}
        >
            <Popover onOpenChange={(open) => setOpen(open)} open={open}>
                <PopoverTrigger>
                    <Avatar>
                        <AvatarImage src={image} alt={'profilbilde'} />
                        <AvatarFallback>
                            <UserRound className="text-foreground" />
                        </AvatarFallback>
                    </Avatar>
                </PopoverTrigger>
                <PopoverContent>
                    <div className="w-full flex flex-col items-center content-center">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={image} alt={'profilbilde'} />
                            <AvatarFallback>
                                <UserRound className="text-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <span className="scroll-m-20 text-2xl font-semibold tracking-tight">
                            Hei, {name}
                        </span>
                        <Button
                            variant={'destructive'}
                            className="mt-2 w-full"
                            onClick={signOutButton}
                        >
                            Logg ut
                        </Button>
                        <Button
                            variant={'outline'}
                            className="w-full mt-1"
                            onClick={goToMyPage}
                        >
                            Min side
                        </Button>
                        {admin ? (
                            <Button
                                variant={'outline'}
                                className="w-full mt-1"
                                onClick={goToAdmin}
                            >
                                Admin
                            </Button>
                        ) : undefined}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};
