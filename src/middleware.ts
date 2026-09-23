import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export const middleware = auth((req) => {
    const path = req.nextUrl.pathname;
    if (path === '/') return;
    if (path.startsWith('/login')) return;
    if (path.startsWith('/api')) return;
    if (path.startsWith('/trpc')) return;

    console.log('[MIDDLEWARE] Checking logged in state for:', path);
    const isLoggedIn = !!req.auth;
    if (!isLoggedIn) {
        const redirectUrl = new URL('/login', req.url);
        redirectUrl.searchParams.set(
            'redirect',
            req.nextUrl.pathname + req.nextUrl.search,
        );
        console.log(
            '[MIDDLEWARE] Redirecting to login page:',
            redirectUrl.toString(),
        );
        return NextResponse.redirect(redirectUrl);
    }
    const user = req.auth?.user;
    const canAdminister =
        user?.role === 'ADMIN' || (user?.leaderOf?.length ?? 0) > 0;

    console.log('[MIDDLEWARE] User is logged in');

    if (!canAdminister) {
        console.log('[MIDDLEWARE] User does not administer any group');
        if (path.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        // '/(api|trpc)(.*)',
    ],
};
