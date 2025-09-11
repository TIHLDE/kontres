'use client';

import FilterSkeleton from '@/components/ui/filters/filter-skeleton';
import Filters, { FilterCallbackType } from '@/components/ui/filters/filters';

import reservationFilterGroups from './filter-list';
import {
    FilterGroups,
    GroupIcons,
    StateIconMap,
    StateMap,
    TimeDirectionIconMap,
    TimeDirectionMap,
} from './value-maps';
import { TimeDirection } from '@/app/admin/utils/enums';
import { groupParser } from '@/app/booking/components/SearchFilters';
import { api } from '@/trpc/react';
import { ReservationState } from '@prisma/client';
import {
    parseAsArrayOf,
    parseAsString,
    parseAsStringEnum,
    useQueryStates,
} from 'nuqs';
import { useEffect, useMemo, useState } from 'react';

export const reservationStateParser = parseAsArrayOf<ReservationState>(
    parseAsStringEnum(Object.values(ReservationState)),
);

export const timeDirectionParser = parseAsArrayOf<TimeDirection>(
    parseAsStringEnum(Object.values(TimeDirection)),
);

export default function AdminBookingFilters() {
    const [open, setOpen] = useState(false);

    // Get groups and items, as they are used in the filters
    const { data: existingGroups } = api.group.getAll.useQuery();
    const { data: existingItems } = api.item.getItems.useQuery({});

    const [filterQueries, setFilterQueries] = useQueryStates({
        groups: groupParser.withDefault([]),
        states: reservationStateParser.withDefault([]),
        items: parseAsArrayOf<string>(parseAsString),
        time: timeDirectionParser.withDefault([]),
    });

    useEffect(() => {}, [existingItems]);

    const filters = useMemo<FilterCallbackType[]>(() => {
        return [
            ...(filterQueries.groups ?? []).map(
                (group) =>
                    ({
                        parentValue: FilterGroups.GROUP,
                        filter: {
                            name:
                                existingGroups?.find((g) => g.groupId === group)
                                    ?.name ?? 'Ukjent gruppe',
                            value: group,
                            icon: GroupIcons['group'],
                        },
                    }) as FilterCallbackType,
            ),
            ...(filterQueries?.items ?? []).map((item) => {
                return {
                    parentValue: FilterGroups.ITEM,
                    filter: {
                        name:
                            existingItems?.items?.find(
                                (i) => i.itemId === parseInt(item),
                            )?.name ?? 'Ukjent gjenstand',
                        value: item,
                    },
                } as FilterCallbackType;
            }),
            ...filterQueries?.time.map((time) => {
                return {
                    parentValue: FilterGroups.TIME,
                    filter: {
                        name: TimeDirectionMap[time],
                        value: time,
                        icon: TimeDirectionIconMap[time],
                    },
                } as FilterCallbackType;
            }),
            ...filterQueries?.states.map((state) => {
                return {
                    parentValue: FilterGroups.STATUS,
                    filter: {
                        name: StateMap[state],
                        value: state,
                        icon: StateIconMap[state],
                    },
                } as FilterCallbackType;
            }),
        ];
    }, [filterQueries, existingGroups, existingItems]);

    // Register shortcut listener
    useEffect(() => {
        const callback = (e: KeyboardEvent) => {
            if (!(e.ctrlKey && e.key === 'k')) return;
            setOpen((prev) => {
                return !prev;
            });
        };

        const ignore = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', ignore);
        window.addEventListener('keydown', callback);

        return () => {
            window.removeEventListener('keydown', callback);
            window.removeEventListener('keydown', ignore);
        };
    }, []);

    const onFilterChange = (filters: FilterCallbackType[]) => {
        setFilterQueries({
            groups: filters
                .filter((f) => f.parentValue === 'group')
                .map((f) => f.filter.value),
            items: filters
                .filter((f) => f.parentValue === 'item')
                .map((f) => f.filter.value),
            time: filters
                .filter((f) => f.parentValue === 'time')
                .map((f) => f.filter.value as TimeDirection),
            states: filters
                .filter((f) => f.parentValue === 'status')
                .map((f) => f.filter.value as ReservationState),
        });
    };

    if (!existingGroups || !existingItems || !filters)
        return <FilterSkeleton />;

    return (
        <Filters
            open={open}
            defaultValues={filters}
            setOpen={setOpen}
            groupIcons={GroupIcons}
            displayGroupIcons={true}
            filterGroups={reservationFilterGroups({
                groups: existingGroups ?? [],
                items: existingItems?.items ?? [],
            })}
            onFilterChange={(value) => {
                onFilterChange(value);
                setOpen(false);
            }}
        />
    );
}
