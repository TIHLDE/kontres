import { db } from '@/server/db';

import Lepton from '../lepton';
import { auth } from '@/auth';
import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError, z } from 'zod';

export const createTRPCContext = async (opts: { headers: Headers }) => {
    const session = await auth();

    return {
        session,
        Lepton,
        db,
        ...opts,
    };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause instanceof ZodError
                        ? error.cause.flatten()
                        : null,
            },
        };
    },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

/*
const timingMiddleware = t.middleware(async ({ next, path }) => {
    const start = Date.now();

    if (t._config.isDev) {
        // artificial delay in dev
        const waitMs = Math.floor(Math.random() * 400) + 100;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    const result = await next();

    const end = Date.now();

    return result;
});*/

/**
 * If a user doesnt have a membership, authorize will fail.
 * @see auth.ts
 */
export const memberProcedure = t.procedure
    //.use(timingMiddleware)
    .use(({ ctx, next }) => {
        if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });

        return next({
            ctx: {
                session: ctx.session,
            },
        });
    });

export function canManageGroup(
    user: { role: string; leaderOf: string[] },
    groupSlug: string,
) {
    return user.role === 'ADMIN' || user.leaderOf.includes(groupSlug);
}

const groupLeaderInputSchema = z.object({
    groupSlug: z.string(),
});

export const groupLeaderProcedure = t.procedure
    .input(groupLeaderInputSchema)
    //.use(timingMiddleware)
    .use(({ ctx, input, next }) => {
        if (!ctx.session || !canManageGroup(ctx.session.user, input.groupSlug)) {
            throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        return next({
            ctx: {
                session: ctx.session,
            },
        });
    });

/**
 * Gjenstanden sin eiergruppe hentes fra databasen, aldri fra klienten, slik at
 * en leder ikke kan autorisere seg med en gruppe de tilfeldigvis leder.
 */
export const itemLeaderProcedure = t.procedure
    .input(z.object({ itemId: z.number() }))
    .use(async ({ ctx, input, next }) => {
        if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });

        const item = await ctx.db.bookableItem.findUnique({
            where: { itemId: input.itemId },
            select: { groupSlug: true },
        });

        if (!item) throw new TRPCError({ code: 'NOT_FOUND' });
        if (!canManageGroup(ctx.session.user, item.groupSlug)) {
            throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        return next({
            ctx: {
                session: ctx.session,
            },
        });
    });

export const reservationLeaderProcedure = t.procedure
    .input(z.object({ reservationId: z.number() }))
    .use(async ({ ctx, input, next }) => {
        if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });

        const reservation = await ctx.db.reservation.findUnique({
            where: { reservationId: input.reservationId },
            select: { bookableItem: { select: { groupSlug: true } } },
        });

        if (!reservation) throw new TRPCError({ code: 'NOT_FOUND' });
        if (
            !canManageGroup(
                ctx.session.user,
                reservation.bookableItem.groupSlug,
            )
        ) {
            throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        return next({
            ctx: {
                session: ctx.session,
            },
        });
    });

export const faqLeaderProcedure = t.procedure
    .input(z.object({ questionId: z.number() }))
    .use(async ({ ctx, input, next }) => {
        if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });

        const faq = await ctx.db.fAQ.findUnique({
            where: { questionId: input.questionId },
            select: { groupSlug: true },
        });

        if (!faq) throw new TRPCError({ code: 'NOT_FOUND' });
        // FAQ uten gruppe kan bare røres av index/HS, ellers ville den vært eierløs
        if (!canManageGroup(ctx.session.user, faq.groupSlug ?? '')) {
            throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        return next({
            ctx: {
                session: ctx.session,
            },
        });
    });

export const adminProcedure = t.procedure
    //.use(timingMiddleware)
    .use(({ ctx, next }) => {
        if (!ctx.session || ctx.session.user.role !== 'ADMIN') {
            throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        return next({
            ctx: {
                session: ctx.session,
            },
        });
    });
