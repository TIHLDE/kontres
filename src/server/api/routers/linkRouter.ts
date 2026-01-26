import { adminProcedure, createTRPCRouter, memberProcedure } from '../trpc';
import { z } from 'zod';

export const linkRouter = createTRPCRouter({
    getLinks: memberProcedure.query(({ ctx }) => {
        return ctx.db.resourceLink.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }),

    getLink: memberProcedure
        .input(z.number())
        .query(({ input: linkId, ctx }) => {
            return ctx.db.resourceLink.findUnique({
                where: { linkId },
            });
        }),

    createLink: adminProcedure
        .input(
            z.object({
                title: z.string().min(1, 'Title is required'),
                url: z.string().url('Must be a valid URL'),
                description: z.string().optional(),
            }),
        )
        .mutation(({ ctx, input }) => {
            return ctx.db.resourceLink.create({
                data: {
                    title: input.title,
                    url: input.url,
                    description: input.description,
                    createdBy: ctx.session.user.id,
                },
            });
        }),

    updateLink: adminProcedure
        .input(
            z.object({
                linkId: z.number(),
                title: z.string().min(1, 'Title is required').optional(),
                url: z.string().url('Must be a valid URL').optional(),
                description: z.string().optional(),
            }),
        )
        .mutation(({ ctx, input }) => {
            const { linkId, ...data } = input;
            return ctx.db.resourceLink.update({
                where: { linkId },
                data,
            });
        }),

    deleteLink: adminProcedure
        .input(z.object({ linkId: z.number() }))
        .mutation(({ ctx, input: { linkId } }) => {
            return ctx.db.resourceLink.delete({
                where: { linkId },
            });
        }),
});
