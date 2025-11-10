'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

import { api } from '@/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const reservationSchema = z.object({
    startTime: z.date({
        required_error: 'Start time is required',
    }),
    endTime: z.date({
        required_error: 'End time is required',
    }),
    description: z.string().min(10, {
        message: 'Description must be at least 10 characters',
    }),
    servesAlcohol: z.boolean(),
    soberWatch: z.string().optional(),
    acceptedRules: z.boolean().refine((val) => val === true, {
        message: 'You must accept the rules',
    }),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
    itemId: number;
    groupSlug: string;
    allowsAlcohol: boolean;
}

export default function ReservationForm({
    itemId,
    groupSlug,
    allowsAlcohol,
}: ReservationFormProps) {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ReservationFormData>({
        resolver: zodResolver(reservationSchema),
        defaultValues: {
            servesAlcohol: false,
            acceptedRules: false,
        },
    });

    const createReservation = api.reservation.create.useMutation({
        onSuccess: () => {
            toast({
                title: 'Reservation created',
                description:
                    'Your reservation has been submitted for approval.',
            });
            router.push('/booking');
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: ReservationFormData) => {
        if (!data.startTime || !data.endTime) {
            toast({
                title: 'Error',
                description: 'Please select both start and end date/time',
                variant: 'destructive',
            });
            return;
        }

        createReservation.mutate({
            itemId,
            groupSlug,
            description: data.description,
            servesAlcohol: data.servesAlcohol,
            soberWatch: data.soberWatch || '',
            startTime: data.startTime,
            endTime: data.endTime,
        });
    };

    const servesAlcohol = watch('servesAlcohol');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Create Reservation
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Context Section - Read-only variables */}
                    <div className="rounded-lg border border-muted bg-muted/50 p-4">
                        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                            Booking Context
                        </h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">
                                    Group
                                </Label>
                                <Input
                                    value={groupSlug}
                                    disabled
                                    readOnly
                                    className="h-8 bg-background"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">
                                    Item ID
                                </Label>
                                <Input
                                    value={itemId}
                                    disabled
                                    readOnly
                                    className="h-8 bg-background"
                                />
                            </div>
                            <div className="flex items-end">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="allowsAlcohol"
                                        checked={allowsAlcohol}
                                        disabled
                                    />
                                    <Label
                                        htmlFor="allowsAlcohol"
                                        className="text-xs text-muted-foreground"
                                    >
                                        Item allows alcohol
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Permutable Fields Section */}
                    <div className="space-y-2">
                        <Label htmlFor="startTime">Start Date and Time</Label>
                        <DateTimePicker
                            className="w-full"
                            value={watch('startTime')?.toISOString()}
                            onChange={(e) => {
                                const value = e.target.value as unknown as Date;
                                setValue('startTime', value, {
                                    shouldValidate: true,
                                });
                            }}
                        />
                        {errors.startTime && (
                            <p className="text-sm text-destructive">
                                {errors.startTime.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endTime">End Date and Time</Label>
                        <DateTimePicker
                            className="w-full"
                            value={watch('endTime')?.toISOString()}
                            onChange={(e) => {
                                const value = e.target.value as unknown as Date;
                                setValue('endTime', value, {
                                    shouldValidate: true,
                                });
                            }}
                        />
                        {errors.endTime && (
                            <p className="text-sm text-destructive">
                                {errors.endTime.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the purpose of your reservation..."
                            {...register('description')}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    {allowsAlcohol && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="servesAlcohol"
                                    checked={servesAlcohol}
                                    onCheckedChange={(checked) =>
                                        setValue('servesAlcohol', checked)
                                    }
                                />
                                <Label htmlFor="servesAlcohol">
                                    Will serve alcohol
                                </Label>
                            </div>

                            {servesAlcohol && (
                                <div className="space-y-2">
                                    <Label htmlFor="soberWatch">
                                        Sober Watch Person
                                    </Label>
                                    <Input
                                        id="soberWatch"
                                        placeholder="Name of sober watch person"
                                        {...register('soberWatch')}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="acceptedRules"
                            checked={watch('acceptedRules')}
                            onCheckedChange={(checked) =>
                                setValue('acceptedRules', checked)
                            }
                        />
                        <Label htmlFor="acceptedRules">
                            I accept the booking rules and regulations
                        </Label>
                    </div>
                    {errors.acceptedRules && (
                        <p className="text-sm text-destructive">
                            {errors.acceptedRules.message}
                        </p>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting || createReservation.isPending}
                    >
                        {isSubmitting || createReservation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Reservation'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
