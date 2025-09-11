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
});

/**
 * If a user doesnt have a membership, authorize will fail.
 * @see auth.ts
 */
export const memberProcedure = t.procedure
    .use(timingMiddleware)
    .use(({ ctx, next }) => {
        if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });

        return next({
            ctx: {
                session: ctx.session,
            },
        });
    });

const groupLeaderInputSchema = z.object({
    groupId: z.string(),
});

export const groupLeaderProcedure = t.procedure
    .input(groupLeaderInputSchema)
    .use(timingMiddleware)
    .use(({ ctx, input, next }) => {
        if (
            !ctx.session ||
            (ctx.session.user.role !== 'ADMIN' &&
                !ctx.session.user.leaderOf.includes(input.groupId))
        ) {
            throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        return next({
            ctx: {
                session: ctx.session,
            },
        });
    });

export const adminProcedure = t.procedure
    .use(timingMiddleware)
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
