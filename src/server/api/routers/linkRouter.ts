import { adminProcedure, createTRPCRouter, memberProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

// URL validation to prevent XSS and ensure safe URLs
const safeUrlSchema = z
    .string()
    .url('Must be a valid URL')
    .refine(
        (url) => {
            const parsed = new URL(url);
            return ['http:', 'https:'].includes(parsed.protocol);
        },
        { message: 'Only HTTP and HTTPS URLs are allowed' },
    );

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
                url: safeUrlSchema,
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
                url: safeUrlSchema.optional(),
                description: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { linkId, ...data } = input;

            // Check if link exists
            const existingLink = await ctx.db.resourceLink.findUnique({
                where: { linkId },
            });

            if (!existingLink) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Link not found',
                });
            }

            return ctx.db.resourceLink.update({
                where: { linkId },
                data,
            });
        }),

    deleteLink: adminProcedure
        .input(z.object({ linkId: z.number() }))
        .mutation(async ({ ctx, input: { linkId } }) => {
            // Check if link exists
            const existingLink = await ctx.db.resourceLink.findUnique({
                where: { linkId },
            });

            if (!existingLink) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Link not found',
                });
            }

            return ctx.db.resourceLink.delete({
                where: { linkId },
            });
        }),
});
