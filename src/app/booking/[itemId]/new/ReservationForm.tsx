'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DateTimeField } from '@/components/ui/date-time-field';
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
import { LoadingSpinner } from '@/components/ui/loadingspinner';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

import { api } from '@/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z
    .object({
        from: z.date({
            required_error: 'Du må velge startdato og tid',
        }),
        to: z.date({
            required_error: 'Du må velge sluttdato og tid',
        }),
        onBehalfOf: z.string().min(1, { message: 'Du må velge en gruppe' }),
        description: z
            .string()
            .min(10, { message: 'Beskrivelse må være minst 10 tegn' })
            .max(500, { message: 'Beskrivelse kan ikke være mer enn 500 tegn' }),
        servesAlcohol: z.boolean().default(false),
        soberWatch: z.string().optional(),
        acceptedRules: z.boolean().refine((val) => val === true, {
            message: 'Du må godta vilkårene for å fortsette',
        }),
    })
    .refine((data) => data.to > data.from, {
        message: 'Sluttdato må være etter startdato',
        path: ['to'],
    });

interface ReservationFormProps {
    itemId: number;
    itemName?: string;
    allowsAlcohol?: boolean;
}

const ReservationForm = ({ 
    itemId, 
    itemName,
    allowsAlcohol = false,
}: ReservationFormProps) => {
    const router = useRouter();
    
    // Fetch user's group slugs and all available groups
    const { data: userGroupSlugs } = api.group.getUserGroups.useQuery();
    const { data: allGroups, isLoading: groupsLoading } = api.group.getAll.useQuery();
    
    // Filter groups to only show ones the user is a member of
    const availableGroups = useMemo(() => {
        if (!userGroupSlugs || !allGroups) return [];
        return allGroups
            .filter((group) => userGroupSlugs.includes(group.groupSlug))
            .map((group) => ({
                value: group.groupSlug,
                label: group.groupName,
            }));
    }, [userGroupSlugs, allGroups]);
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        shouldUnregister: false,
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        defaultValues: {
            from: new Date(),
            to: new Date(Date.now() + 1000 * 60 * 60), // Default: 1 hour from now
            onBehalfOf: '',
            description: '',
            servesAlcohol: false,
            soberWatch: '',
            acceptedRules: false,
        },
    });

    const servesAlcohol = form.watch('servesAlcohol');

    const createReservation = api.reservation.create.useMutation({
        onSuccess: () => {
            toast({
                title: 'Reservasjon sendt',
                description: 'Din reservasjon er sendt til godkjenning.',
            });
            router.push('/booking');
        },
        onError: (error) => {
            toast({
                title: 'Feil',
                description: error.message || 'Noe gikk galt. Prøv igjen senere.',
                variant: 'destructive',
            });
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        createReservation.mutate({
            itemIds: [itemId],
            groupSlug: data.onBehalfOf,
            description: data.description,
            startTime: data.from,
            endTime: data.to,
            servesAlcohol: data.servesAlcohol,
            soberWatch: data.soberWatch || '',
            acceptedRules: data.acceptedRules,
        });
    }

    return (
        <div className="grid min-h-[calc(100vh-5rem)] place-items-center px-4 py-10">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        {itemName ? `Reserver ${itemName}` : 'Ny reservasjon'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="from"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fra dato og tid</FormLabel>
                                            <FormControl>
                                                <DateTimeField
                                                    value={field.value ?? null}
                                                    onChange={(next) => {
                                                        form.setValue('from', next, {
                                                            shouldValidate: true,
                                                            shouldDirty: true,
                                                            shouldTouch: true,
                                                        });
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="to"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Til dato og tid</FormLabel>
                                            <FormControl>
                                                <DateTimeField
                                                    value={field.value ?? null}
                                                    onChange={(next) => {
                                                        form.setValue('to', next, {
                                                            shouldValidate: true,
                                                            shouldDirty: true,
                                                            shouldTouch: true,
                                                        });
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="onBehalfOf"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>På vegne av gruppe</FormLabel>
                                        <FormControl>
                                            <GroupSelect
                                                groups={availableGroups}
                                                value={field.value}
                                                onChange={field.onChange}
                                                disabled={groupsLoading}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {groupsLoading 
                                                ? 'Laster grupper...'
                                                : availableGroups.length === 0
                                                ? 'Du er ikke medlem av noen grupper'
                                                : 'Du kan kun sende inn forespørsler på vegne av grupper du er medlem av'
                                            }
                                        </FormDescription>
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
                                                placeholder="Beskriv formålet med reservasjonen..."
                                                rows={4}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Minst 10 tegn, maks 500 tegn
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Alcohol Section */}
                            {allowsAlcohol && (
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="servesAlcohol"
                                        render={({ field: { value, ...rest } }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        {...rest}
                                                        checked={!!value}
                                                        onCheckedChange={(e) => {
                                                            form.setValue(
                                                                'servesAlcohol',
                                                                Boolean(e.valueOf()),
                                                                {
                                                                    shouldValidate: true,
                                                                    shouldDirty: true,
                                                                    shouldTouch: true,
                                                                },
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none flex-1">
                                                    <FormLabel className="cursor-pointer">
                                                        Vil servere alkohol
                                                    </FormLabel>
                                                    <span className="text-muted-foreground text-sm ml-1">
                                                        (
                                                        <a
                                                            href="https://wiki.tihlde.org/retningslinjer/kontoret"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="underline hover:text-foreground"
                                                        >
                                                            Se retningslinjer for kontoret
                                                        </a>
                                                        )
                                                    </span>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {servesAlcohol && (
                                        <FormField
                                            control={form.control}
                                            name="soberWatch"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ansvarlig for edruoppsyn</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Navn på person med edruoppsyn"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="acceptedRules"
                                render={({ field: { value, ...rest } }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                {...rest}
                                                checked={!!value}
                                                onCheckedChange={(e) => {
                                                    form.setValue(
                                                        'acceptedRules',
                                                        Boolean(e.valueOf()),
                                                        {
                                                            shouldValidate: true,
                                                            shouldDirty: true,
                                                            shouldTouch: true,
                                                        },
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Jeg godtar{' '}
                                                <Link
                                                    href="https://wiki.tihlde.org/retningslinjer/kontoret"
                                                    className="font-bold underline hover:text-primary"
                                                    target="_blank"
                                                >
                                                    vilkårene for bruk og utlån av TIHLDEs eiendeler
                                                </Link>
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => router.back()}
                                    disabled={form.formState.isSubmitting || createReservation.isPending}
                                >
                                    Avbryt
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={form.formState.isSubmitting || createReservation.isPending}
                                >
                                    {form.formState.isSubmitting || createReservation.isPending ? (
                                        <>
                                            <LoadingSpinner />
                                            <span className="ml-2">Sender...</span>
                                        </>
                                    ) : (
                                        'Send inn reservasjon'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReservationForm;
