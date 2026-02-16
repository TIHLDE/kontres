import {
    createTRPCRouter,
    groupLeaderProcedure,
    memberProcedure,
} from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const itemRouter = createTRPCRouter({
    getItem: memberProcedure
        .input(z.number())
        .query(({ input: itemId, ctx }) => {
            return ctx.db.bookableItem.findUnique({
                where: { itemId },
            });
        }),
    getItems: memberProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).optional(),
                cursor: z.number().nullish().optional(),
                direction: z
                    .enum(['forward', 'backward'])
                    .default('forward')
                    .optional(),
                filters: z
                    .object({
                        query: z.string().optional(),
                        groupIds: z.string().array().optional(),
                        items: z.number().array().optional(),
                    })
                    .optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const limit = input.limit ?? 20;
            console.log(
                'ITEMS: ',
                input.filters?.items,
                input.filters?.groupIds,
            );
            const { cursor } = input;
            const items = await ctx.db.bookableItem.findMany({
                take: limit + 1,
                cursor: cursor ? { itemId: cursor } : undefined,
                where: {
                    name: {
                        contains: input.filters?.query,
                    },
                    groupSlug: {
                        in: input.filters?.groupIds,
                    },
                    itemId: {
                        in: input.filters?.items,
                    },
                },
                orderBy: {
                    name: 'asc',
                },
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.itemId;
            }

            return {
                items,
                nextCursor,
            };
        }),

    createItem: groupLeaderProcedure
        .input(
            z.object({
                name: z.string(),
                description: z.string(),
                allowsAlcohol: z.boolean(),
                groupSlug: z.string(),
                imageUrl: z.string().optional(),
            }),
        )
        .mutation(({ ctx, input }) => {
            const data: {
                name: string;
                description: string;
                allowsAlcohol: boolean;
                groupSlug: string;
                imageUrl?: string;
            } = {
                name: input.name,
                description: input.description,
                allowsAlcohol: input.allowsAlcohol,
                groupSlug: input.groupSlug,
            };
            if (input.imageUrl && input.imageUrl.trim() !== '') {
                data.imageUrl = input.imageUrl.trim();
            }
            return ctx.db.bookableItem.create({ data });
        }),

    updateItem: groupLeaderProcedure
        .input(
            z.object({
                groupSlug: z.string(),
                itemId: z.number(),
                data: z.object({
                    name: z.string().optional(),
                    description: z.string().optional(),
                    allowsAlcohol: z.boolean().optional(),
                    imageUrl: z.string().optional(),
                }),
            }),
        )
        .mutation(({ ctx, input }) => {
            return ctx.db.bookableItem.update({
                where: { itemId: input.itemId },
                data: input.data,
            });
        }),

    deleteItem: groupLeaderProcedure
        .input(z.object({ itemId: z.number(), groupSlug: z.string() }))
        .mutation(async ({ ctx, input: { itemId } }) => {
            const reservationCount = await ctx.db.reservation.count({
                where: { bookableItemId: itemId },
            });
            if (reservationCount > 0) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: `Kan ikke slette gjenstanden: den har ${reservationCount} reservasjon(er). Slett eller flytt reservasjonene først.`,
                });
            }
            return ctx.db.bookableItem.delete({
                where: { itemId },
            });
        }),
});
