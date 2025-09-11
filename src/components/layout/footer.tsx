import HeaderLink from '../ui/header-link';
import Logo from '../ui/logo';

export default function Footer() {
    return (
        <footer className="">
            <nav className="flex gap-6 w-full items-center p-4 text-zinc-500 dark:text-zinc-600 border-t border-border">
                <HeaderLink href="/" className="mr-auto">
                    <Logo />
                </HeaderLink>
                <HeaderLink href="/reservation">Reservasjoner</HeaderLink>
                <HeaderLink href="/booking">Booking</HeaderLink>
            </nav>
        </footer>
    );
}
