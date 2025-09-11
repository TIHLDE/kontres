import {
    createTRPCRouter,
    groupLeaderProcedure,
    memberProcedure,
} from '@/server/api/trpc';

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const faqRouter = createTRPCRouter({
    //get all FAQs
    getAll: memberProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).optional(),
                cursor: z.number().nullish(),
                direction: z.enum(['forward', 'backward']),
                filter: z.string().optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const limit = input.limit ?? 50;
            const { cursor } = input;

            const faqs = await ctx.db.fAQ.findMany({
                take: limit + 1,
                cursor: cursor ? { questionId: cursor } : undefined,
                where: {
                    question: {
                        contains: input.filter,
                    },
                },
                orderBy: {
                    questionId: 'asc',
                },
                include: {
                    bookableItems: true,
                },
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (faqs.length > limit) {
                const nextItem = faqs.pop();
                nextCursor = nextItem!.questionId;
            }

            return {
                faqs,
                nextCursor,
            };
        }),

    //get FAQ by id
    getById: memberProcedure
        .input(
            z.object({
                questionId: z.number(),
            }),
        )
        .query(async ({ input }) => {
            const faq = await prisma.fAQ.findUnique({
                where: {
                    questionId: input.questionId,
                },
                include: {
                    bookableItems: true,
                },
            });

            if (!faq) {
                throw new Error('Question could not be found!');
            }

            return faq;
        }),

    //create new question
    create: groupLeaderProcedure
        .input(
            z.object({
                question: z.string(),
                answer: z.string(),
                group: z.string().optional(),
                author: z.string(),
                bookableItemIds: z.array(z.number()).optional(),
                imageUrl: z.string().optional(),
            }),
        )
        .mutation(async ({ input }) => {
            const newFAQ = await prisma.fAQ.create({
                data: {
                    question: input.question,
                    answer: input.answer,
                    group: input.group || '',
                    imageUrl: input.imageUrl || '',
                    ...(input.bookableItemIds?.length
                        ? {
                              bookableItems: {
                                  connect: input.bookableItemIds.map((id) => ({
                                      itemId: id,
                                  })),
                              },
                          }
                        : []),
                    author: input.author,
                },
            });
            return newFAQ;
        }),

    update: memberProcedure
        .input(
            z.object({
                questionId: z.number(),
                question: z.string(),
                answer: z.string(),
                group: z.string().optional(),
                author: z.string(),
                bookableItemIds: z.array(z.number()).optional(),
                imageUrl: z.string().optional(),
            }),
        )
        .mutation(async ({ input }) => {
            const updateData: any = {
                question: input.question,
                answer: input.answer,
                group: input.group,
                ...(input.bookableItemIds?.length
                    ? {
                          bookableItems: {
                              set: input.bookableItemIds.map((id) => ({
                                  itemId: id,
                              })),
                          },
                      }
                    : {
                          bookableItems: {
                              set: [],
                          },
                      }),
                author: input.author,
            };

            if (input.imageUrl !== undefined && input.imageUrl !== '') {
                updateData.imageUrl = input.imageUrl;
            }

            const updateFAQ = await prisma.fAQ.update({
                where: { questionId: input.questionId },
                data: updateData,
            });

            return updateFAQ;
        }),
});
