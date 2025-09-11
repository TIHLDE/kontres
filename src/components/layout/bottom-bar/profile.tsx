'use client';

// Temporary type
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';

// import { signOutUser } from '@/utils/apis/user'; // TODO: Fix this import
import { useRouter } from 'next/navigation';
import { type Dispatch, type SetStateAction } from 'react';

// import { type User } from '@/types/User'; // TODO: Fix this import

type User = any; // Temporary type

interface ProfileProps {
    user?: User;
    admin?: boolean;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const Profile = ({ user, admin, open, setOpen }: ProfileProps) => {
    const router = useRouter();

    const signOut = () => {
        setOpen(false);
        // signOutUser(); // TODO: Fix this
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
        <Drawer open={open} onOpenChange={(open) => setOpen(open)}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Hei, {user?.first_name}!</DrawerTitle>
                </DrawerHeader>

                <div className="flex flex-col gap-2 p-4">
                    {admin ? (
                        <Button variant="outline" onClick={goToAdmin}>
                            Admin
                        </Button>
                    ) : undefined}
                    <Button variant="outline" onClick={goToMyPage}>
                        Min side
                    </Button>
                    <Button variant={'destructive'} onClick={signOut}>
                        Logg ut
                    </Button>
                </div>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button
                            className="w-full"
                            onClick={() => setOpen(false)}
                        >
                            Lukk
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default Profile;
