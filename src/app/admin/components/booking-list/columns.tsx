'use client';

import { type ReservationWithAuthor } from '@/server/dtos/reservations';

import { cn } from '@/lib/utils';
import { ReservationState } from '@prisma/client';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale/nb';

const StatusMap = {
    [ReservationState.APPROVED]: 'Godkjent',
    [ReservationState.PENDING]: 'Avventer',
    [ReservationState.REJECTED]: 'Avvist',
};

export const columns: ColumnDef<ReservationWithAuthor>[] = [
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({
            row: {
                original: { status },
            },
        }) => (
            <div
                className={cn(
                    'w-20 h-2.5 rounded-full font-bold',
                    status === ReservationState.APPROVED && 'text-green-400',
                    status === ReservationState.PENDING && 'text-yellow-400',
                    status === ReservationState.REJECTED && 'text-red-400',
                )}
            >
                {StatusMap[status]}
            </div>
        ),
    },
    {
        accessorKey: 'author',
        header: 'Author',
        accessorFn: (row) => {
            if (!row.author?.first_name) return 'Ukjent bruker';
            return `${row.author.first_name} ${row.author.last_name}`;
        },
    },
    {
        accessorKey: 'startTime',
        header: 'Tidsrom',
        accessorFn: (row) =>
            `${format(row.startTime, 'd. LLLL HH:mm', {
                locale: nb,
            })} - ${format(row.endTime, 'd. LLLL HH:mm', {
                locale: nb,
            })}`,
    },
    {
        accessorKey: 'bookableItemId',
        header: 'Gjenstand',
    },
];
