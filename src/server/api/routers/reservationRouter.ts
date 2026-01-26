import {
    type ReservationWithAuthor,
    type ReservationWithAuthorAndItem,
} from '@/server/dtos/reservations';
import { User } from '@/server/dtos/user';

import {
    createTRPCRouter,
    groupLeaderProcedure,
    memberProcedure,
} from '../trpc';
import { TimeDirection } from '@/app/admin/utils/enums';
import { ReservationState } from '@prisma/client';
import { z } from 'zod';

export const reservationRouter = createTRPCRouter({
    getReservation: memberProcedure
        .input(z.number())
        .query(({ input: reservationId, ctx }) => {
            return ctx.db.reservation.findUnique({
                where: { reservationId },
            });
        }),

    getReservations: memberProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).optional(),
                cursor: z.number().nullish().optional(),
                direction: z
                    .enum(['forward', 'backward'])
                    .default('forward')
                    .optional(),
                filters: z.object({
                    state: z.nativeEnum(ReservationState).array().optional(),
                    query: z.string().optional(),
                    groupSlugs: z.string().array().optional(),
                    fromDate: z.string().optional(),
                    toDate: z.string().optional(),
                    bookableItem: z.number().array().optional(),
                    timeDirection: z
                        .nativeEnum(TimeDirection)
                        .array()
                        .optional(),
                }),
            }),
        )
        .query(async ({ ctx, input }) => {
            const limit = input.limit ?? 30;
            const { cursor } = input;

            try {
                if (input.filters.fromDate)
                    input.filters.fromDate = new Date(
                        input.filters.fromDate,
                    ).toISOString();

                if (input.filters.toDate)
                    input.filters.toDate = new Date(
                        input.filters.toDate,
                    ).toISOString();
            } catch (error) {
                console.error('Could not parse date', error);
                return {
                    reservations: [],
                    nextCursor: undefined,
                };
            }

            // Query database (includes all new reservations)
            const reservations = (await ctx.db.reservation.findMany({
                take: limit + 1,
                cursor: cursor ? { reservationId: cursor } : undefined,
                include: {
                    bookableItem: true,
                },
                where: {
                    status: {
                        in: input.filters.state,
                    },
                    groupSlug: {
                        in: input.filters.groupSlugs,
                    },

                    ...(input.filters.fromDate ||
                    input.filters.toDate ||
                    (input.filters.timeDirection &&
                        input.filters.timeDirection?.length > 0)
                        ? {
                              OR: [
                                  {
                                      startTime: {
                                          gte:
                                              (input.filters.fromDate ??
                                              input.filters.timeDirection?.includes(
                                                  TimeDirection.FORWARD,
                                              ))
                                                  ? new Date()
                                                  : undefined,
                                      },
                                      endTime: {
                                          lte:
                                              (input.filters.toDate ??
                                              input.filters.timeDirection?.includes(
                                                  TimeDirection.BACKWARD,
                                              ))
                                                  ? new Date()
                                                  : undefined,
                                      },
                                  },
                              ],
                          }
                        : {}),

                    bookableItem: {
                        itemId: {
                            in: input.filters.bookableItem,
                        },
                    },
                },
                orderBy: {
                    reservationId: 'asc',
                },
            })) as ReservationWithAuthorAndItem[];

            let nextCursor: typeof cursor | undefined = undefined;
            if (reservations.length > limit) {
                const nextItem = reservations.pop();
                nextCursor = nextItem!.reservationId;
            }

            // Batch fetch user data from Lepton (instead of N+1 queries)
            const authorIds = [...new Set(reservations.map((r) => r.authorId))];

            // Only fetch users if we have reservations (avoid unnecessary API calls)
            let userMap = new Map<string, User>();
            if (authorIds.length > 0) {
                // Fetch all users in parallel (much faster than sequential)
                // Limit concurrent requests to avoid overwhelming the API
                const BATCH_SIZE = 10;
                const userPromises: Promise<{
                    userId: string;
                    user: User | null;
                }>[] = [];

                for (let i = 0; i < authorIds.length; i += BATCH_SIZE) {
                    const batch = authorIds.slice(i, i + BATCH_SIZE);
                    const batchPromises = batch.map(async (userId) => {
                        try {
                            const response = await ctx.Lepton.getUserById(
                                userId,
                                ctx.session.user.TIHLDE_Token,
                            );
                            if (!response.ok) {
                                throw new Error(`HTTP ${response.status}`);
                            }
                            const user = (await response.json()) as User;
                            return { userId, user };
                        } catch (error) {
                            console.error(
                                `Failed to fetch user ${userId}:`,
                                error,
                            );
                            return { userId, user: null };
                        }
                    });
                    userPromises.push(...batchPromises);
                }

                const userResults = await Promise.all(userPromises);
                userMap = new Map(
                    userResults
                        .filter((r) => r.user !== null)
                        .map((r) => [r.userId, r.user!]),
                );
            }

            // Attach user data to reservations
            const reservationsWithUsers = reservations.map((reservation) => ({
                ...reservation,
                author: userMap.get(reservation.authorId) || null,
            })) as ReservationWithAuthorAndItem[];

            return {
                reservations: reservationsWithUsers,
                nextCursor,
            };
        }),

    getReservationsByBookableItemId: memberProcedure
        .input(
            z.object({
                bookableItemId: z.number().nullable(),
                startDate: z.date().optional(),
                endDate: z.date().optional(),
            }),
        )
        .query(async ({ input, ctx }) => {
            if (!input.bookableItemId) {
                return { reservations: [], totalReservations: 0 };
            }

            const { bookableItemId, startDate, endDate } = input;

            // Default to 3 months past and 6 months future if no dates provided
            // This prevents loading hundreds/thousands of old reservations
            const defaultStartDate = startDate || new Date();
            defaultStartDate.setMonth(defaultStartDate.getMonth() - 3);

            const defaultEndDate = endDate || new Date();
            defaultEndDate.setMonth(defaultEndDate.getMonth() + 6);

            const where = {
                bookableItemId,
                // Only get reservations that overlap with the date range
                OR: [
                    {
                        // Reservation starts within range
                        startTime: {
                            gte: defaultStartDate,
                            lte: defaultEndDate,
                        },
                    },
                    {
                        // Reservation ends within range
                        endTime: {
                            gte: defaultStartDate,
                            lte: defaultEndDate,
                        },
                    },
                    {
                        // Reservation spans the entire range
                        AND: [
                            { startTime: { lte: defaultStartDate } },
                            { endTime: { gte: defaultEndDate } },
                        ],
                    },
                ],
            };

            const reservations = await ctx.db.reservation.findMany({
                where,
                orderBy: {
                    startTime: 'asc',
                },
            });

            const totalReservations = await ctx.db.reservation.count({
                where,
            });

            return {
                reservations,
                totalReservations,
            };
        }),

    getUserReservations: memberProcedure
        .input(z.object({ userId: z.string() }))
        .query(({ input, ctx }) => {
            return ctx.db.reservation.findMany({
                where: { authorId: input.userId },
                include: {
                    bookableItem: true,
                },
            });
        }),

    create: memberProcedure
        .input(
            z.object({
                servesAlcohol: z.boolean(),
                description: z.string(),
                soberWatch: z.string(),
                startTime: z.date(),
                endTime: z.date(),
                itemId: z.number(),
                groupSlug: z.string(),
            }),
        )
        .mutation(({ input, ctx }) => {
            return ctx.db.reservation.create({
                data: {
                    authorId: ctx.session.user.id,
                    groupSlug: input.groupSlug,
                    acceptedRules: false,
                    bookableItemId: input.itemId,
                    description: input.description,
                    endTime: input.endTime,
                    startTime: input.startTime,
                    soberWatch: input.soberWatch,
                    servesAlcohol: input.servesAlcohol,
                },
            });
        }),
    updateStatus: groupLeaderProcedure
        .input(
            z.object({
                reservationId: z.number(),
                status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
            }),
        )
        .mutation(({ ctx, input }) => {
            if (input.status === 'APPROVED') {
                return ctx.db.reservation.update({
                    where: {
                        reservationId: input.reservationId,
                    },
                    data: {
                        status: input.status,
                        approvedById: ctx.session.user.id,
                    },
                });
            }

            return ctx.db.reservation.update({
                where: {
                    reservationId: input.reservationId,
                },
                data: {
                    status: input.status,
                },
            });
        }),
    delete: groupLeaderProcedure
        .input(z.object({ reservationId: z.number() }))
        .mutation(({ input: { reservationId }, ctx }) => {
            return ctx.db.reservation.delete({
                where: { reservationId },
            });
        }),
});
