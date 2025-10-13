'use client';

import { type ReservationWithAuthor } from '@/server/dtos/reservations';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ReservationState } from '@prisma/client';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale/nb';
import { Trash2 } from 'lucide-react';
import { api } from '@/trpc/react';
import { toast } from '@/components/ui/use-toast';

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
    {
        id: 'actions',

                header: 'Behandle',
        cell: ({row}) => {
             const reservation = row.original;
            const utils = api.useUtils();

            const handleReservation = api.reservation.updateStatus.useMutation({
                onSuccess: () => {
                    toast({
                        title: 'Status oppdatert',
                        description: 'Reservasjonsstatusen er oppdatert.',
                    });
                    utils.reservation.getReservations.invalidate();
                },
                onError: () => {
                    toast({
                        title: 'Feil',
                        description: 'Kunne ikke oppdatere statusen.',
                        variant: 'destructive',
                    });
                },
                
            });
            return (
                <div className="flex">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            handleReservation.mutate({
                                groupSlug: reservation.groupSlug,
                                reservationId: reservation.reservationId,
                                status:
                                    reservation.status === ReservationState.APPROVED
                                        ? ReservationState.REJECTED
                                        : ReservationState.APPROVED,
                            })
                        }
                        disabled={handleReservation.isPending}
                        className="mr-2"
                    >
                        ✓
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            handleReservation.mutate({
                                groupSlug: reservation.groupSlug,
                                reservationId: reservation.reservationId,
                                status: ReservationState.PENDING,
                            })
                        }
                        disabled={handleReservation.isPending}
                        className="mr-2"
                    >
                        ?
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                            handleReservation.mutate({
                                groupSlug: reservation.groupSlug,
                                reservationId: reservation.reservationId,
                                status: ReservationState.REJECTED,
                            })
                        }
                        disabled={handleReservation.isPending}
                    >
                        X
                    </Button>
                </div>
            );
        },
    },
    {
        id: 'delete',

        header: 'Slett',
        cell: ({ row }) => {
            const reservation = row.original;
            const utils = api.useUtils();
            
            const deleteReservation = api.reservation.delete.useMutation({
                onSuccess: () => {
                    toast({
                        title: 'Reservasjon slettet',
                        description: 'Reservasjonen har blitt slettet.',
                    });
                    // Invalidate and refetch reservations
                    utils.reservation.getReservations.invalidate();
                },
                onError: (error) => {
                    toast({
                        title: 'Feil',
                        description: 'Kunne ikke slette reservasjonen.',
                        variant: 'destructive',
                    });
                },
            });

            const handleDelete = () => {
                if (confirm('Er du sikker på at du vil slette denne reservasjonen?')) {
                    deleteReservation.mutate({ groupSlug: reservation.groupSlug, reservationId: reservation.reservationId });
                }
            };

            return (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleteReservation.isPending}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            );
        },
    },
];
