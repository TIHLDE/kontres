'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loadingspinner';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
    from: z.date(),
    to: z.date(),
    onBehalfOf: z.string().min(1, { message: 'Du må velge en gruppe' }),
    description: z
        .string()
        .min(10, { message: 'Beskrivelse må være minst 10 tegn' }),
    acceptedRules: z.boolean(),
});

/**
 * Parent wrapper for the entire reservation form
 */
const ReservationForm = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        shouldUnregister: false,
        defaultValues: {
            from: new Date(),
            to: new Date(Date.now() + 1000 * 60 * 60),
        },
    });

    function onSubmit(data: z.infer<typeof formSchema>) {
        console.log(data);
    }

    return (
        <div className="grid place-items-center pt-20">
            <Card>
                <CardHeader>
                    <CardTitle>
                        Reserver {'{{'}item.name{'}}'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="from"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fra dato</FormLabel>
                                        <FormControl>
                                            <DateTimePicker
                                                className="flex w-full"
                                                {...field}
                                                value={
                                                    field.value
                                                        ? field.value.toISOString()
                                                        : undefined
                                                }
                                                onChange={(e) => {
                                                    form.setValue(
                                                        'from',
                                                        new Date(
                                                            e.target.value,
                                                        ),
                                                        {
                                                            shouldDirty: true,
                                                            shouldTouch: true,
                                                        },
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="to"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Til dato</FormLabel>
                                        <FormControl>
                                            <DateTimePicker
                                                className="flex w-full"
                                                {...field}
                                                value={
                                                    field.value
                                                        ? field.value.toISOString()
                                                        : undefined
                                                }
                                                onChange={(e) => {
                                                    form.setValue(
                                                        'to',
                                                        new Date(
                                                            e.target.value,
                                                        ),
                                                        {
                                                            shouldDirty: true,
                                                            shouldTouch: true,
                                                        },
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="onBehalfOf"
                                render={({ field }) => (
                                    <FormItem className="my-2">
                                        <FormLabel>
                                            Send inn søknad på vegne av
                                        </FormLabel>
                                        <FormControl>
                                            {/* <AutoSelect
                                                options={groups ?? []}
                                                placeholder="Velg et alternativ"
                                                defaultValue="0"
                                                onValueChange={(e) => {
                                                    groupChangeCallback(e);
                                                    field.onChange(e);
                                                }}
                                                {...field}
                                            /> */}
                                        </FormControl>
                                        <FormDescription>
                                            Du kan kun sende inn forespørsler på
                                            vegne av grupper du er medlem av
                                        </FormDescription>
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
                                    </FormItem>
                                )}
                            />
                            {/* {selectedItem?.allows_alcohol && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="serves_alcohol"
                                        render={({ field: { value, ...rest } }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Checkbox
                                                        {...rest}
                                                        checked={value}
                                                        onCheckedChange={(e) =>
                                                            form.setValue(
                                                                'serves_alcohol',
                                                                Boolean(e.valueOf()),
                                                                {
                                                                    shouldDirty: true,
                                                                    shouldTouch: true,
                                                                },
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormLabel className="!my-0">
                                                    Vi skal servere alkohol på
                                                    arrangementet og har fylt ut{' '}
                                                    <Link
                                                        href="https://hjelp.ntnu.no/tas/public/ssp/content/serviceflow?unid=8f090c9e58444762876750db1104178d&from=aef98c8c-3eb9-4e29-8439-e79834d88223&openedFromService=true"
                                                        target="_blank"
                                                        className="font-bold underline"
                                                    >
                                                        søknad hos NTNU
                                                    </Link>
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    {form.watch('serves_alcohol') && (
                                        <motion.div
                                            initial={{
                                                height: 0,
                                                overflow: 'hidden',
                                            }}
                                            animate={{
                                                height: 'fit-content',
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                type: 'spring',
                                                bounce: 0.25,
                                            }}
                                        >
                                            <FormField
                                                control={form.control}
                                                name="sober_watch_id"
                                                render={({ field }) => (
                                                    <FormItem className="mb-4">
                                                        <FormLabel>
                                                            Edruvakt sitt navn
                                                        </FormLabel>
                                                        <FormControl>
                                                            <UserAutocomplete
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </motion.div>
                                    )}
                                </>
                            )} */}
                            <FormField
                                control={form.control}
                                name="accepted_rules"
                                render={({ field: { value, ...rest } }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <Checkbox
                                                {...rest}
                                                checked={value}
                                                onCheckedChange={(e) => {
                                                    form.setValue(
                                                        '',
                                                        Boolean(e.valueOf()),
                                                        {
                                                            shouldDirty: true,
                                                            shouldTouch: true,
                                                        },
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className="!my-0">
                                            Jeg godtar{' '}
                                            <Link
                                                href="https://wiki.tihlde.org/retningslinjer/kontoret"
                                                className="font-bold underline"
                                                target="_blank"
                                            >
                                                vilkårene for bruk og utlån av
                                                TIHLDEs eiendeler
                                            </Link>
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />

                            {/* <ApplicantCard
                                image={applicant?.image}
                                label={applicant?.label}
                                className="w-full"
                            /> */}

                            <div className="mt-5">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? (
                                        <LoadingSpinner />
                                    ) : (
                                        'Reserver'
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
