'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { DateTimeField } from '@/components/ui/date-time-field';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loadingspinner';
import GroupSelect from '@/components/ui/group-select';

import { api } from '@/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useEffect } from 'react';
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

interface MultiItemReservationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: Array<{
        itemId: number;
        name: string;
        description: string;
        groupSlug: string;
        allowsAlcohol: boolean;
    }>;
    onSuccess?: () => void;
}

export default function MultiItemReservationDialog({
    open,
    onOpenChange,
    items,
    onSuccess,
}: MultiItemReservationDialogProps) {
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

    // Check if ALL selected items allow alcohol (only show alcohol option if all allow it)
    const allAllowAlcohol = useMemo(
        () => items.length > 0 && items.every((item) => item.allowsAlcohol),
        [items],
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        shouldUnregister: false,
        mode: 'onSubmit', // Only validate on submit, not on change or blur
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

    const createReservation = api.reservation.create.useMutation({
        onSuccess: (data) => {
            toast({
                title: 'Reservasjoner opprettet',
                description: `${data.count} reservasjon(er) er sendt til godkjenning.`,
            });
            form.reset();
            onSuccess?.();
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
        if (items.length === 0) {
            toast({
                title: 'Feil',
                description: 'Ingen elementer valgt',
                variant: 'destructive',
            });
            return;
        }

        createReservation.mutate({
            itemIds: items.map((item) => item.itemId),
            groupSlug: data.onBehalfOf,
            description: data.description,
            servesAlcohol: data.servesAlcohol,
            soberWatch: data.soberWatch || '',
            startTime: data.from,
            endTime: data.to,
            acceptedRules: data.acceptedRules,
        });
    }

    const servesAlcohol = form.watch('servesAlcohol');

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            form.reset({
                from: new Date(),
                to: new Date(Date.now() + 1000 * 60 * 60),
                onBehalfOf: '',
                description: '',
                servesAlcohol: false,
                soberWatch: '',
                acceptedRules: false,
            });
            // Clear all form errors when dialog closes
            form.clearErrors();
        }
    }, [open, form]);

    if (items.length === 0) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Reserver flere elementer</DialogTitle>
                    <DialogDescription>
                        Opprett reservasjon for {items.length} valgte element(er)
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Selected Items List */}
                    <div className="space-y-2">
                        <Label>Valgte elementer</Label>
                        <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                            {items.map((item) => (
                                <div
                                    key={item.itemId}
                                    className="flex items-center justify-between p-2 bg-muted/50 rounded"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {item.description}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="ml-2">
                                        {allGroups?.find((g) => g.groupSlug === item.groupSlug)?.groupName ?? item.groupSlug}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Group Selection */}
                    <div className="space-y-2">
                        <Label>Reserver på vegne av</Label>
                        {groupsLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <GroupSelect
                                value={form.watch('onBehalfOf')}
                                onChange={(value) => form.setValue('onBehalfOf', value)}
                                groups={availableGroups}
                                disabled={groupsLoading}
                            />
                        )}
                        {form.formState.errors.onBehalfOf && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.onBehalfOf.message}
                            </p>
                        )}
                    </div>

                    {/* Date/Time Fields */}
                    <div className="space-y-2">
                        <Label>Fra</Label>
                        <DateTimeField
                            value={form.watch('from') ?? null}
                            onChange={(next) => {
                                const currentTo = form.getValues('to');
                                form.setValue('from', next, {
                                    shouldValidate: true,
                                });
                                if (
                                    currentTo != null &&
                                    next > currentTo
                                ) {
                                    const adjustedTo = new Date(next);
                                    adjustedTo.setHours(
                                        currentTo.getHours(),
                                        currentTo.getMinutes(),
                                        currentTo.getSeconds(),
                                        currentTo.getMilliseconds(),
                                    );
                                    form.setValue('to', adjustedTo, {
                                        shouldValidate: true,
                                    });
                                }
                            }}
                        />
                        {form.formState.errors.from && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.from.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Til</Label>
                        <DateTimeField
                            value={form.watch('to') ?? null}
                            onChange={(next) => {
                                form.setValue('to', next, {
                                    shouldValidate: true,
                                });
                            }}
                        />
                        {form.formState.errors.to && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.to.message}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Beskrivelse</Label>
                        <Textarea
                            placeholder="Beskriv formålet med reservasjonen..."
                            {...form.register('description')}
                        />
                        {form.formState.errors.description && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.description.message}
                            </p>
                        )}
                    </div>

                    {/* Alcohol Section */}
                    {allAllowAlcohol && (
                        <div className="space-y-4">
                            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <Checkbox
                                    id="servesAlcohol"
                                    checked={servesAlcohol}
                                    onCheckedChange={(checked) =>
                                        form.setValue('servesAlcohol', Boolean(checked), {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                            shouldTouch: true,
                                        })
                                    }
                                />
                                <div className="space-y-1 leading-none flex-1">
                                    <Label htmlFor="servesAlcohol" className="cursor-pointer">
                                        Jeg/vi vil servere alkohol
                                    </Label>
                                    <span className="text-sm ml-1">
                                        <a
                                            href="https://hjelp.ntnu.no/tas/public/ssp/content/serviceflow?unid=8f090c9e58444762876750db1104178d&from=aef98c8c-3eb9-4e29-8439-e79834d88223&openedFromService=true"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-bold underline hover:text-primary"
                                        >
                                            Søk om skjenkebevilling hos NTNU
                                        </a>
                                        {' • '}
                                        <a
                                            href="https://wiki.tihlde.org/retningslinjer/kontoret"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-bold underline hover:text-primary"
                                        >
                                            Se retningslinjer for kontoret
                                        </a>
                                    </span>
                                </div>
                            </div>

                            {servesAlcohol && (
                                <div className="space-y-2">
                                    <Label htmlFor="soberWatch">
                                        Ansvarlig for edruoppsyn
                                    </Label>
                                    <Input
                                        id="soberWatch"
                                        placeholder="Navn på person med edruoppsyn"
                                        {...form.register('soberWatch')}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rules Acceptance */}
                    <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <Checkbox
                            id="acceptedRules"
                            checked={form.watch('acceptedRules')}
                            onCheckedChange={(checked) =>
                                form.setValue('acceptedRules', Boolean(checked), {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                    shouldTouch: true,
                                })
                            }
                        />
                        <div className="space-y-1 leading-none">
                            <Label htmlFor="acceptedRules" className="cursor-pointer">
                                Jeg godtar{' '}
                                <a
                                    href="https://wiki.tihlde.org/retningslinjer/kontoret"
                                    className="font-bold underline hover:text-primary"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    vilkårene for bruk og utlån av TIHLDEs eiendeler
                                </a>
                            </Label>
                            {form.formState.errors.acceptedRules && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.acceptedRules.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={
                                form.formState.isSubmitting ||
                                createReservation.isPending
                            }
                        >
                            Avbryt
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                form.formState.isSubmitting ||
                                createReservation.isPending
                            }
                        >
                            {form.formState.isSubmitting ||
                            createReservation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Oppretter...
                                </>
                            ) : (
                                `Opprett ${items.length} reservasjon(er)`
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
