'use client';

// Temporary type
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { MobileModeToggle } from '../../ui/theme-mode-toggler';
import More from './more';
import Profile from './profile';
import { cn } from '@/lib/utils';
import {
    type HTMLMotionProps,
    motion,
    useAnimate,
    useScroll,
    useSpring,
    useTransform,
} from 'framer-motion';
import { ArrowLeft, Menu, UserRound } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// import { type User } from '@/types/User'; // TODO: Fix this import

// import { type DetailedItem } from '@/utils/apis/types'; // TODO: Fix this import

type User = any; // Temporary type
type DetailedItem = any; // Temporary type

interface BottomBarProps extends HTMLMotionProps<'div'> {
    user?: User;
    items?: DetailedItem[];
    admin?: boolean;
}

/**
 * This bottom bar is designated for mobile views. It is intended as a dynamic, and eye-catching
 * way to navigate the app.
 *
 * Terminology:
 * **Narrow mode** => The bottom bar is in a narrow state, meaning it is small and compact. It will only display a
 * back button.
 *
 * **Wide mode** => The bottom bar is in a wide state, meaning it is large and spacious. This is the opposite of narrow mode.
 * It will display a profile button, a more button and a theme button.
 */
const BottomBar = ({
    user,
    admin,
    className,
    items,
    ...props
}: BottomBarProps) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [scope, animate] = useAnimate();

    const router = useRouter();
    const path = usePathname();

    const { scrollYProgress } = useScroll();
    const scrollTransform = useTransform(scrollYProgress, [0, 1], [0, 360]);
    const scrollSpring = useSpring(scrollTransform);

    useEffect(() => {
        // Conditionally animate the bottom bar based on the path
        let narrow = false;
        const calendarPath = new RegExp(
            '^/calendar/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$',
        );
        narrow = narrow || calendarPath.test(path);

        // let someOtherPath = /\/some-other-path/; // Example of another path
        // narrow = narrow || someOtherPath.test(path);

        // ^ This code can be expanded to include multiple paths. Just be sure to use the proper
        //  regex pattern for the path you want to match.

        // Animate between the narrow and wide states
        animate(
            scope.current,
            {
                y: 0,
                ...(narrow
                    ? {
                          width: '5rem',
                          height: '5rem',
                          borderRadius: '2.5rem',
                      }
                    : {
                          width: '75%',
                          height: '5.5rem',
                          borderRadius: '1.5rem',
                      }),
            },
            {
                duration: 1,
                type: 'spring',
                delay: 0.4,
            },
        );

        // Animate out the profile, more and theme buttons if narrow mode is enabled
        animate(
            'button#small-hide',
            { y: narrow ? 200 : 0 },
            {
                duration: 1,
                type: 'spring',
                delay: 0.4,
            },
        );

        // Animate in the back button if narrow mode is enabled
        animate(
            'button#small-show',
            { y: narrow ? 0 : 200, display: narrow ? 'block' : 'none' },
            {
                duration: 1,
                type: 'spring',
                delay: 0.4,
            },
        );
    }, [animate, scope, path]);

    return (
        <motion.div
            {...props}
            ref={scope}
            className={cn(
                className,
                'overflow-hidden gap-5 bg-background/50 backdrop-blur-md border border-border place-content-center items-center flex shadow-lg mx-auto',
            )}
            initial={{ y: '200%' }}
            transition={{
                type: 'spring',
                delay: 0.5,
            }}
            drag
            dragConstraints={{
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
            }}
            dragTransition={{
                bounceStiffness: 800,
                power: 1,
            }}
            dragElastic={0.3}
        >
            {/* The back button, which is only shown in narrow mode */}
            <Button
                variant={'ghost'}
                onClick={router.back}
                id="small-show"
                className="absolute"
                aria-label="Gå tilbake"
            >
                <ArrowLeft />
            </Button>

            {/* Profile button */}
            <Button
                id="small-hide"
                variant={'ghost'}
                onClick={() => {
                    if (!user) return;
                    setProfileOpen(!profileOpen);
                }}
                size={'lg'}
                className="px-0"
            >
                <Avatar className="w-full h-full aspect-square">
                    <AvatarImage src={user?.image} alt="Profililde" />
                    <AvatarFallback>
                        <UserRound className="text-foreground" />
                    </AvatarFallback>
                </Avatar>
            </Button>

            {/* More button (Burger menu button) */}
            <Button
                className="aspect-square rounded-full h-16 shadow-md"
                id="small-hide"
                onClick={() => setMoreOpen(!moreOpen)}
            >
                <Menu />
            </Button>

            {/* Theme button (with rotation based on scroll) */}
            <motion.div
                style={{
                    rotate: scrollSpring,
                }}
            >
                <MobileModeToggle variant={'ghost'} id="small-hide" />
            </motion.div>

            {/* Drawer for the hamburger menu button */}
            <More items={items} open={moreOpen} setOpen={setMoreOpen} />

            {/* Drawer for the profile button */}
            <Profile
                open={profileOpen}
                setOpen={setProfileOpen}
                user={user}
                admin={admin}
            />
        </motion.div>
    );
};

export default BottomBar;
