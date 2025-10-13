import { Button } from '@/components/ui/button';
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
import AutoSelect, {
    SelectGroupType,
    SelectOptionType,
} from '@/components/ui/select';

import { DetailedItem } from '@/utils/apis/types';

import ApplicantCard from './ApplicantCard';
import UserAutocomplete from './UserAutocomplete';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    from: z.date(),
    to: z.date(),
    item: z.string(),
    // Must be checked
    accepted_rules: z.boolean().refine((val) => val === true, {
        message: 'Du må godta vilkårene for å kunne reservere',
    }),
    application_on_behalf: z.string(),
    description: z.string().min(10, {
        message: 'Beskrivelsen må være mer enn 10 tegn lang',
    }),
    serves_alcohol: z.boolean().optional(),
    sober_watch_id: z.string().optional(),
});

export type ReservationFormValueTypes = z.infer<typeof formSchema>;

type ReservationFormFieldsType = {
    items: DetailedItem[];
    initialData?: Partial<z.infer<typeof formSchema>>;
    onSubmit: (values: ReservationFormValueTypes) => Promise<unknown>;
    groups?: SelectOptionType[] | SelectGroupType[];
    groupChangeCallback: Dispatch<SetStateAction<string>>;
    applicant?: { image: string; label: string };
};

/**
 * Component that contains all the fields that belong to the reservation form.
 */
const ReservationFormFields = ({
    initialData,
    items,
    groups,
    groupChangeCallback,
    onSubmit,
    applicant,
}: ReservationFormFieldsType) => {
    const form = useForm<ReservationFormValueTypes>({
        resolver: zodResolver(formSchema),
        shouldUnregister: false,
        defaultValues: {
            application_on_behalf: '0',
            ...initialData,
        },
    });

    const selectedItemId = form.watch('item');
    const selectedItem = items.find((item) => item.id === selectedItemId);

    return (
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
                                            new Date(e.target.value),
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
                                            new Date(e.target.value),
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
                    name="application_on_behalf"
                    render={({ field }) => (
                        <FormItem className="my-2">
                            <FormLabel>Send inn søknad på vegne av</FormLabel>
                            <FormControl>
                                <AutoSelect
                                    options={groups ?? []}
                                    placeholder="Velg et alternativ"
                                    defaultValue="0"
                                    onValueChange={(e) => {
                                        groupChangeCallback(e);
                                        field.onChange(e);
                                    }}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Du kan kun sende inn forespørsler på vegne av
                                grupper du er medlem av
                            </FormDescription>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="item"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gjenstand</FormLabel>
                            <FormControl>
                                <AutoSelect
                                    options={items.map((item) => ({
                                        label: item.name,
                                        value: item.id,
                                    }))}
                                    placeholder={'Velg en gjenstand'}
                                    defaultValue={initialData?.item as string}
                                    onValueChange={field.onChange}
                                    {...field}
                                    className="w-full"
                                />
                            </FormControl>
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
                {selectedItem?.allows_alcohol && (
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
                                        Vi skal servere alkohol på arrangementet
                                        og har fylt ut{' '}
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
                                                <UserAutocomplete {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </motion.div>
                        )}
                    </>
                )}
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
                                            'accepted_rules',
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
                                    vilkårene for bruk og utlån av TIHLDEs
                                    eiendeler
                                </Link>
                            </FormLabel>
                        </FormItem>
                    )}
                />

                <ApplicantCard
                    image={applicant?.image}
                    label={applicant?.label}
                    className="w-full"
                />

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
    );
};

export { ReservationFormFields };
