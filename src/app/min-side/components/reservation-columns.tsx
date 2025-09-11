'use client';

import { Button, type ButtonProps } from '@/components/ui/button';

import { cn } from '@/lib/utils';
import type {
    BookableItem,
    Reservation,
    ReservationState,
} from '@prisma/client';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale/nb';
import { ArrowUpDown } from 'lucide-react';

const stateMap: Record<ReservationState, string> = {
    REJECTED: 'Avslått',
    APPROVED: 'Bekreftet',
    PENDING: 'Avventer',
};

const dateSortingFn = (a: Reservation, b: Reservation) =>
    new Date(a.startTime) > new Date(b.startTime) ? 1 : -1;

export const HeaderButton = ({ className, ...props }: ButtonProps) => {
    return (
        <Button
            className={cn('px-0 hover:bg-transparent', className)}
            {...props}
        />
    );
};

export const reservationColumns: ColumnDef<
    Reservation & { bookableItem: BookableItem }
>[] = [
    {
        accessorKey: 'authorId',
        header: 'Bruker',
    },
    {
        accessorKey: 'bookableItemId',
        header: ({ column }) => {
            return (
                <HeaderButton
                    variant={'ghost'}
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() == 'asc')
                    }
                >
                    Gjenstand
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </HeaderButton>
            );
        },
        accessorFn: (data) => data.bookableItem.name,
    },
    {
        accessorKey: 'description',
        header: 'Beskrivelse',
    },
    {
        accessorKey: 'startTime',
        header: ({ column }) => {
            return (
                <HeaderButton
                    variant={'ghost'}
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() == 'asc')
                    }
                >
                    Start
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </HeaderButton>
            );
        },
        accessorFn: (data) =>
            format(data.startTime, 'd. LLLL HH:mm', {
                locale: nb,
            }),
        sortingFn: (a, b) => dateSortingFn(a.original, b.original),
    },

    {
        accessorKey: 'endTime',
        header: ({ column }) => {
            return (
                <HeaderButton
                    variant={'ghost'}
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() == 'asc')
                    }
                >
                    Slutt
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </HeaderButton>
            );
        },
        accessorFn: (data) =>
            format(data.endTime, 'd. LLLL HH:mm', {
                locale: nb,
            }),
        sortingFn: (a, b) => dateSortingFn(a.original, b.original),
    },
    {
        accessorKey: 'status',
        accessorFn: (data) => stateMap[data.status],
        header: ({ column }) => {
            return (
                <HeaderButton
                    variant={'ghost'}
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() == 'asc')
                    }
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </HeaderButton>
            );
        },
    },
];
