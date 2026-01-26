import HeaderLink from '../../ui/header-link';
import Logo from '../../ui/logo';
import { UserArea } from '../user-area';
import { ModeToggle } from '../../ui/theme-mode-toggler';
import { auth } from '@/auth';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const HeaderButtonsWrapper = async ({
    className,
    ...props
}: React.HTMLProps<HTMLDivElement>) => {
    const session = await auth();

    return (
        <nav
            {...props}
            className={cn(
                'relative flex items-center py-3 px-12 w-full',
                className,
            )}
        >
            <div className="flex-1">
            <Link href="/" className="text-primary" aria-label="Til forsiden">
                <Logo />
            </Link>
            </div>
            
            <div className="absolute left-1/2 -translate-x-1/2 flex gap-6 items-center max-md:hidden">
                <HeaderLink href="/booking">Booking</HeaderLink>
                <HeaderLink href="/faq">FAQ</HeaderLink>
                {session?.user?.role === 'ADMIN' && (
                    <HeaderLink href="/admin">Admin</HeaderLink>
                )}
            </div>

            <div className="flex-1 flex items-center gap-3 justify-end">
                <ModeToggle />
                {session?.user ? (
                    <UserArea
                        name={session.user.firstName ?? ''}
                        image={session.user.profilePicture ?? ''}
                        admin={session.user.role == 'ADMIN'}
                    />
                ) : undefined}
            </div>
        </nav>
    );
};

export default HeaderButtonsWrapper;
