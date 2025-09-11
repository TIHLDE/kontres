import Logo from '@/components/ui/logo';

import HeaderButtonsWrapper from './header-buttons-wrapper';
import HeaderSkeleton from './header-skeleton';
import HeaderWrapper from './header-wrapper';
import Link from 'next/link';
import { Suspense } from 'react';

type HeaderProps = React.HTMLProps<HTMLHeadElement>;

export default async function Header({ className, ...props }: HeaderProps) {
    return (
        <HeaderWrapper {...props}>
            <div className="w-full h-full hidden md:block">
                <Suspense fallback={<HeaderSkeleton />}>
                    <HeaderButtonsWrapper />
                </Suspense>
            </div>
            <div className="md:hidden flex place-content-center w-full">
                <Link href={'/'}>
                    <Logo />
                </Link>
            </div>
        </HeaderWrapper>
    );
}
