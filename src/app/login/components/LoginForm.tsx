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

import { loginUser } from '../actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

type LoginFormSubmitEventType = z.infer<typeof formSchema>;

const formSchema = z.object({
    username: z.string(),
    password: z.string(),
});

type LoginFormProps = {
    redirectUrl: string;
};

export function LoginForm({ redirectUrl }: LoginFormProps) {
    const router = useRouter();
    const form = useForm<LoginFormSubmitEventType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const handleSubmit = useCallback(
        async (data: LoginFormSubmitEventType) => {
            const result = await loginUser(data.username, data.password, redirectUrl);
            
            if (result.success) {
                router.push(redirectUrl);
                router.refresh();
            } else {
                form.setError('root', {
                    message: result.error || 'Noe gikk galt. Prøv igjen senere.',
                });
            }
        },
        [redirectUrl, form, router],
    );

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Brukernavn</FormLabel>
                            <FormControl>
                                <Input placeholder="brukernavn" {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Passord</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="passord"
                                    type="password"
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {form.formState.errors.root && (
                    <div className="my-2">
                        <p className="text-sm font-medium text-destructive">
                            {form.formState.errors.root.message}
                        </p>
                    </div>
                )}
                <Button
                    className="w-full"
                    type="submit"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? (
                        <LoadingSpinner />
                    ) : (
                        'Logg inn'
                    )}
                </Button>
            </form>
        </Form>
    );
}
