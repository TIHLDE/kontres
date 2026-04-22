import { type ReservationWithAuthor, type ReservationWithAuthorAndItem } from '@/server/dtos/reservations';
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

            // Build where clause
            const whereClause: any = {
                ...(input.filters.state && input.filters.state.length > 0
                    ? {
                          status: {
                              in: input.filters.state,
                          },
                      }
                    : {}),
                ...(input.filters.groupSlugs &&
                input.filters.groupSlugs.length > 0
                    ? {
                          groupSlug: {
                              in: input.filters.groupSlugs,
                          },
                      }
                    : {}),
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
                ...(input.filters.bookableItem &&
                input.filters.bookableItem.length > 0
                    ? {
                          bookableItem: {
                              itemId: {
                                  in: input.filters.bookableItem,
                              },
                          },
                      }
                    : {}),
            };

            // Fetch all matching reservations (we'll sort in memory)
            // Use a larger limit to ensure we have enough data for proper sorting
            const allReservations = (await ctx.db.reservation.findMany({
                take: 1000, // Fetch more to ensure proper sorting
                include: {
                    bookableItem: true,
                },
                where: whereClause,
                orderBy: {
                    reservationId: 'asc', // Initial sort by ID (proxy for created_at)
                },
            })) as ReservationWithAuthorAndItem[];

            // Define status order: PENDING, APPROVED, REJECTED
            const statusOrder = {
                [ReservationState.PENDING]: 0,
                [ReservationState.APPROVED]: 1,
                [ReservationState.REJECTED]: 2,
            };

            // Sort by status first, then by reservationId (created_at proxy)
            const sortedReservations = allReservations.sort((a, b) => {
                const statusA = statusOrder[a.status] ?? 999;
                const statusB = statusOrder[b.status] ?? 999;

                if (statusA !== statusB) {
                    return statusA - statusB;
                }

                // Within same status, sort by reservationId (ascending = oldest first)
                return a.reservationId - b.reservationId;
            });

            // Apply cursor-based pagination after sorting
            let reservations: ReservationWithAuthorAndItem[];
            if (cursor) {
                const cursorIndex = sortedReservations.findIndex(
                    (r) => r.reservationId === cursor,
                );
                if (cursorIndex >= 0) {
                    reservations = sortedReservations.slice(
                        cursorIndex + 1,
                        cursorIndex + 1 + limit + 1,
                    );
                } else {
                    reservations = sortedReservations.slice(0, limit + 1);
                }
            } else {
                reservations = sortedReservations.slice(0, limit + 1);
            }

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
                const userPromises: Promise<{ userId: string; user: User | null }>[] = [];

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
                            console.error(`Failed to fetch user ${userId}:`, error);
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

    getAllReservationsInRange: memberProcedure
        .input(
            z.object({
                startDate: z.date(),
                endDate: z.date(),
            }),
        )
        .query(async ({ input, ctx }) => {
            const { startDate, endDate } = input;

            const reservations = await ctx.db.reservation.findMany({
                where: {
                    OR: [
                        {
                            startTime: { gte: startDate, lte: endDate },
                        },
                        {
                            endTime: { gte: startDate, lte: endDate },
                        },
                        {
                            AND: [
                                { startTime: { lte: startDate } },
                                { endTime: { gte: endDate } },
                            ],
                        },
                    ],
                },
                include: {
                    bookableItem: {
                        select: {
                            itemId: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    startTime: 'asc',
                },
            });

            const authorIds = [...new Set(reservations.map((r) => r.authorId))];
            let userMap = new Map<string, User>();

            if (authorIds.length > 0) {
                const BATCH_SIZE = 10;
                const userPromises: Promise<{ userId: string; user: User | null }>[] = [];

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
                            console.error(`Failed to fetch user ${userId}:`, error);
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

            const reservationsWithUsers = reservations.map((reservation) => ({
                ...reservation,
                author: userMap.get(reservation.authorId) || null,
            }));

            return { reservations: reservationsWithUsers };
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
                itemIds: z.array(z.number()).min(1, {
                    message: 'At least one item must be selected',
                }),
                groupSlug: z.string(),
                acceptedRules: z.boolean(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            // Validate that if serving alcohol, all items must allow alcohol
            if (input.servesAlcohol) {
                const items = await ctx.db.bookableItem.findMany({
                    where: {
                        itemId: {
                            in: input.itemIds,
                        },
                    },
                    select: {
                        itemId: true,
                        name: true,
                        allowsAlcohol: true,
                    },
                });

                const itemsNotAllowingAlcohol = items.filter(
                    (item) => !item.allowsAlcohol,
                );

                if (itemsNotAllowingAlcohol.length > 0) {
                    const names = itemsNotAllowingAlcohol
                        .map((item) => item.name)
                        .join(', ');
                    throw new Error(
                        `Cannot serve alcohol. The following items do not allow alcohol: ${names}`,
                    );
                }
            }

            // Check availability for all items before creating
            const conflictingReservations = await ctx.db.reservation.findMany({
                where: {
                    bookableItemId: {
                        in: input.itemIds,
                    },
                    status: {
                        in: ['PENDING', 'APPROVED'], // Only check active reservations
                    },
                    OR: [
                        {
                            // Reservation starts during our time
                            startTime: {
                                gte: input.startTime,
                                lt: input.endTime,
                            },
                        },
                        {
                            // Reservation ends during our time
                            endTime: {
                                gt: input.startTime,
                                lte: input.endTime,
                            },
                        },
                        {
                            // Reservation spans our entire time
                            AND: [
                                { startTime: { lte: input.startTime } },
                                { endTime: { gte: input.endTime } },
                            ],
                        },
                    ],
                },
                include: {
                    bookableItem: true,
                },
            });

            // Group conflicts by item
            const conflictsByItem = new Map<number, typeof conflictingReservations>();
            conflictingReservations.forEach((res) => {
                if (!conflictsByItem.has(res.bookableItemId)) {
                    conflictsByItem.set(res.bookableItemId, []);
                }
                conflictsByItem.get(res.bookableItemId)!.push(res);
            });

            // Check which items have conflicts
            const itemsWithConflicts = Array.from(conflictsByItem.keys());
            if (itemsWithConflicts.length > 0) {
                const itemNames = await ctx.db.bookableItem.findMany({
                    where: {
                        itemId: {
                            in: itemsWithConflicts,
                        },
                    },
                    select: {
                        name: true,
                        itemId: true,
                    },
                });
                
                const names = itemNames.map((item) => item.name).join(', ');
                throw new Error(
                    `The following items are not available during this time: ${names}`,
                );
            }

            // Create all reservations in a transaction
            const reservations = await ctx.db.$transaction(
                input.itemIds.map((itemId) =>
                    ctx.db.reservation.create({
                        data: {
                            authorId: ctx.session.user.id,
                            groupSlug: input.groupSlug,
                            acceptedRules: input.acceptedRules,
                            bookableItemId: itemId,
                            description: input.description,
                            endTime: input.endTime,
                            startTime: input.startTime,
                            soberWatch: input.soberWatch,
                            servesAlcohol: input.servesAlcohol,
                        },
                    }),
                ),
            );

            return {
                reservations,
                count: reservations.length,
            };
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
