import { authConfig } from '@/auth.config';
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

/**
 * Egen NextAuth-instans, uten `jwt`-callbacken i `auth.ts`.
 *
 * Mellomvaren kjører i sin egen kjøretid med sine egne modulkopier. Hadde den
 * kjørt tokenfornyelsen også, ville den og serveren fornyet med det samme
 * refresh-tokenet uavhengig av hverandre, og Photon ville lest den andre bruken
 * som tyveri og logget brukeren ut. Alt mellomvaren trenger — om noen er logget
 * inn og om de er admin — ligger allerede i JWT-en.
 */
const { auth } = NextAuth(authConfig);

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
    const isAdmin = req.auth?.user?.role === 'ADMIN';

    console.log('[MIDDLEWARE] User is logged in');

    if (!isAdmin) {
        console.log('[MIDDLEWARE] User is not an admin');
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
