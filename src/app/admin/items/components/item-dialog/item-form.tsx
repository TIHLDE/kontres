'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import FileInput from '@/components/ui/file-input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import GroupSelect from '@/components/ui/group-select';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loadingspinner';
import { Textarea } from '@/components/ui/textarea';

import { api } from '@/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
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
    allowsAlcohol: z.boolean().default(false),
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

    const { data: session } = useSession();
    const membershipGroups = useMemo(() => session?.user.groups, [session]);
    const { data: allGroups } = api.group.getAll.useQuery();
    const pickableGroups = useMemo(() => {
        return allGroups
            ?.filter(
                (g: { groupSlug: string; groupName: string; type: string }) =>
                    membershipGroups?.includes(g.groupSlug),
            )
            .map(
                (g: { groupSlug: string; groupName: string; type: string }) =>
                    g.groupName,
            );
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
                                    <Textarea
                                        {...field}
                                        placeholder="Beskriv gjenstanden..."
                                        className="min-h-[100px]"
                                    />
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
                                        groups={allGroups?.map(
                                            (g: {
                                                groupSlug: string;
                                                groupName: string;
                                                type: string;
                                            }) => ({
                                                label: g.groupName,
                                                value: g.groupSlug,
                                            }),
                                        )}
                                        onChange={onChange}
                                        value={value}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="allowsAlcohol"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Tillater alkohol</FormLabel>
                                    <FormDescription>
                                        Tillat alkoholservering ved
                                        reservasjoner av denne gjenstanden
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
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
                <Button variant="ghost" type="button">
                    Avbryt
                </Button>
                <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="gap-2.5"
                    type="button"
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
