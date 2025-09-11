'use client';

import { Button } from '@/components/ui/button';
import FileInput from '@/components/ui/file-input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import GroupSelect from '@/components/ui/group-select';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loadingspinner';

import { api } from '@/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
    name: z.string().min(1, {
        message: 'Navnet på gjenstanden er påkrevd',
    }),
    description: z.string().min(5, {
        message: 'Gjenstandsbeskrivelsen må være minst 5 tegn langt',
    }),
    group: z.string().min(1, {
        message: 'Gjenstanden må tilhøre en gruppe',
    }),
});

interface ItemFormProps {
    onSubmit: (values: z.infer<typeof schema>) => void;
    isSubmitting?: boolean;
    defaultValues?: z.infer<typeof schema>;
    formAction?: 'edit' | 'create';
}

export default function ItemForm({
    onSubmit,
    formAction,
    defaultValues,
    isSubmitting,
}: ItemFormProps) {
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    const formSubmitRef = useRef<HTMLButtonElement>(null);

    const { data: session } = useSession();
    const membershipGroups = useMemo(() => session?.user.groups, [session]);
    const { data: allGroups } = api.group.getAll.useQuery();
    const pickableGroups = useMemo(() => {
        return allGroups
            ?.filter((g) => membershipGroups?.includes(g.groupId))
            .map((g) => g.name);
    }, [allGroups, membershipGroups]);

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Navn</FormLabel>
                                <FormControl>
                                    <Input {...field} />
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
                                <FormLabel>Beskrivelse</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="group"
                        render={({ field: { onChange, value } }) => (
                            <FormItem className="w-full">
                                <FormLabel>Gruppe</FormLabel>
                                <FormControl>
                                    <GroupSelect
                                        groups={allGroups?.map((g) => ({
                                            label: g.name,
                                            value: g.groupId,
                                        }))}
                                        onChange={onChange}
                                        value={value}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="hidden"
                        ref={formSubmitRef}
                    />
                </form>
            </Form>
            <FileInput
                disabled
                title="Ikke ferdigimplementert"
                className="mt-5"
                label="Velg bilde"
                accept="image/*"
                maxSize={0}
            />
            <div className="mt-5 flex justify-end gap-5">
                <Button variant="ghost">Avbryt</Button>
                <Button
                    onClick={() => formSubmitRef.current?.click()}
                    disabled={isSubmitting}
                    className="gap-2.5"
                >
                    {isSubmitting ? (
                        <>
                            <LoadingSpinner />{' '}
                            {formAction === 'edit' ? 'Lagrer' : 'Oppretter'}
                        </>
                    ) : formAction === 'edit' ? (
                        'Lagre endringer'
                    ) : (
                        'Opprett gjenstand'
                    )}
                </Button>
            </div>
        </div>
    );
}
