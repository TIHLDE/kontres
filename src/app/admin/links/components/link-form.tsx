'use client';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loadingspinner';
import { Textarea } from '@/components/ui/textarea';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
    title: z.string().min(1, {
        message: 'Tittelen er påkrevd',
    }),
    url: z
        .string()
        .url({
            message: 'URL må være gyldig',
        })
        .refine(
            (url) => {
                try {
                    const parsed = new URL(url);
                    return ['http:', 'https:'].includes(parsed.protocol);
                } catch {
                    return false;
                }
            },
            { message: 'Kun HTTP og HTTPS URLer er tillatt' },
        ),
    description: z.string().optional(),
});

interface LinkFormProps {
    onSubmit: (values: z.infer<typeof schema>) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    defaultValues?: z.infer<typeof schema>;
    formAction?: 'edit' | 'create';
}

export default function LinkForm({
    onSubmit,
    onCancel,
    formAction,
    defaultValues,
    isSubmitting,
}: LinkFormProps) {
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    return (
        <div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tittel</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="f.eks. Wiki - Kamerabestilling"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="https://..."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Beskrivelse (valgfritt)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder="Beskriv hva lenken inneholder..."
                                        className="min-h-[80px]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={onCancel}
                        >
                            Avbryt
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="gap-2.5"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner />{' '}
                                    {formAction === 'edit'
                                        ? 'Lagrer'
                                        : 'Oppretter'}
                                </>
                            ) : formAction === 'edit' ? (
                                'Lagre endringer'
                            ) : (
                                'Opprett lenke'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
