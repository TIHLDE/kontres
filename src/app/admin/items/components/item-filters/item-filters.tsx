'use client';

import FilterSkeleton from '@/components/ui/filters/filter-skeleton';
import Filters, { FilterCallbackType } from '@/components/ui/filters/filters';

import itemFilterGroups, { GroupIcons } from './filter-list';
import { FilterGroups } from '@/app/admin/reservations/components/booking-filters/value-maps';
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

export default function AdminItemFilters() {
    const [open, setOpen] = useState(false);
    const [filterQueries, setFilterQueries] = useQueryStates({
        groups: groupParser.withDefault([]),
        items: parseAsArrayOf<string>(parseAsString).withDefault([]),
    });
    const { data: existingGroups } = api.group.getAll.useQuery();
    const { data: existingItems } = api.item.getItems.useQuery({});

    const filters = useMemo<FilterCallbackType[]>(() => {
        return [
            ...filterQueries.groups.map(
                (group) =>
                    ({
                        parentValue: FilterGroups.GROUP,
                        filter: {
                            name:
                                existingGroups?.find((g) => g.groupId === group)
                                    ?.name ?? 'Ukjent gruppe',
                            value: group,
                        },
                    }) as FilterCallbackType,
            ),
            ...filterQueries.items.map((item) => {
                return {
                    parentValue: FilterGroups.ITEM,
                    filter: {
                        name:
                            existingItems?.items.find(
                                (i) => i.itemId === parseInt(item),
                            )?.name ?? 'Ukjent gjenstand',
                        value: item,
                    },
                } as FilterCallbackType;
            }),
        ] as FilterCallbackType[];
    }, [filterQueries, existingGroups, existingItems]);

    // Register shortcut listener
    useEffect(() => {
        const callback = (e: KeyboardEvent) => {
            if (!(e.ctrlKey && e.key === 'k')) return;

            setOpen((prev) => {
                console.log('Setting open to', !prev);
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

        // Calculate the initial filter values

        return () => {
            window.removeEventListener('keydown', callback);
            window.removeEventListener('keydown', ignore);
        };
    }, []);

    const onFilterChange = (filters: FilterCallbackType[]) => {
        setFilterQueries({
            groups: filters
                .filter((f) => f.parentValue === FilterGroups.GROUP)
                .map((f) => f.filter.value),
            items: filters
                .filter((f) => f.parentValue === FilterGroups.ITEM)
                .map((f) => f.filter.value),
        });
    };

    if (!existingGroups || !existingItems) return <FilterSkeleton />;
    return (
        <Filters
            open={open}
            setOpen={setOpen}
            defaultValues={filters}
            groupIcons={GroupIcons}
            filterGroups={itemFilterGroups({
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
