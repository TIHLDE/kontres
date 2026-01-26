'use client';

import { cn } from '../../../lib/utils';
import { useEffect, useState } from 'react';

interface HeaderWrapperProps extends React.HTMLProps<HTMLHeadElement> {}

export default function HeaderWrapper({
    children,
    className,
    ...props
}: HeaderWrapperProps) {
    const [isOnTop, setIsOnTop] = useState(true);
    
    useEffect(() => {
        function handleScroll() {
            setIsOnTop(window.scrollY < 20);
        }
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={cn(
                'fixed left-0 right-0 z-30 w-full top-0 transition-all duration-150 max-md:flex max-md:items-center max-md:justify-between',
                !isOnTop &&
                    'border-b border-border/40 backdrop-blur-sm supports-backdrop-filter:bg-card/60 dark:supports-backdrop-filter:bg-background/60 bg-background/60',
                isOnTop && 'bg-transparent',
                className,
            )}
            {...props}
        >
            {children}
        </header>
    );
}
