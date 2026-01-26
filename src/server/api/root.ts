import { faqRouter } from '@/server/api/routers/faq';
import { postRouter } from '@/server/api/routers/post';
import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';

import { authTesterRouter } from './routers/auth-tester';
import { bookableItemRouter } from './routers/bookableItem';
import { groupRouter } from './routers/groupRouter';
import { itemRouter } from './routers/itemRouter';
import { linkRouter } from './routers/linkRouter';
import { reservationRouter } from './routers/reservationRouter';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    post: postRouter,
    authTester: authTesterRouter,
    item: itemRouter,
    bookableItem: bookableItemRouter,
    reservation: reservationRouter,
    faq: faqRouter,
    group: groupRouter,
    link: linkRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
