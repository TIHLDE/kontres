import { z } from 'zod';

export const formSchema = z.object({
    question: z.string().min(1, {
        message: 'Du må legge inn et spørsmål',
    }),
    answer: z.string().min(1, {
        message: 'Legg inn et svar på spørsmålet',
    }),
    bookableItemIds: z.array(z.number()).optional(),
    group: z.string().optional(),
    imageUrl: z.string().optional(),
});

export type FaqFormValueTypes = z.infer<typeof formSchema>;
