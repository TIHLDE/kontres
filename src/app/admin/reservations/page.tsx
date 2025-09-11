'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loadingspinner';

import BookingList from '../components/booking-list/booking-list';
import AdminBookingFilters, {
    reservationStateParser,
    timeDirectionParser,
} from './components/booking-filters/booking-filters';
import { groupParser } from '@/app/booking/components/SearchFilters';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs';

export default function Page() {
    const [filters] = useQueryStates({
        q: parseAsString,
        groups: groupParser.withDefault([]),
        fromDate: parseAsString,
        toDate: parseAsString,
        time: timeDirectionParser.withDefault([]),
        states: reservationStateParser.withDefault([]),
        items: parseAsArrayOf<string>(parseAsString).withDefault([]),
    });

    // Fetch the reservations based on filter params
    const {
        data,
        isLoading,
        hasNextPage,
        hasPreviousPage,
        fetchNextPage,
        isFetchingNextPage,
    } = api.reservation.getReservations.useInfiniteQuery(
        {
            filters: {
                group: filters.groups.length > 0 ? filters.groups : undefined,
                state:
                    filters.states && filters?.states?.length > 0
                        ? filters.states
                        : undefined,
                bookableItem:
                    filters.items && filters.items.length > 0
                        ? filters.items.map(Number)
                        : undefined,
                timeDirection: filters.time,
            },
            limit: 5,
        },
        { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

    return (
        <>
            <CardHeader>
                <CardTitle>Reservasjoner</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="gap-5 flex flex-col">
                    <AdminBookingFilters />
                    <div
                        className={cn(
                            'w-full h-full transition-all gap-5 flex flex-col',
                            isLoading ? 'blur-sm' : '',
                        )}
                    >
                        <BookingList
                            items={
                                data?.pages.flatMap(
                                    (page) => page.reservations,
                                ) ?? []
                            }
                        />
                        {hasNextPage && (
                            <Button
                                className="ml-auto gap-2.5 items-center"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage ? (
                                    <>
                                        <LoadingSpinner /> Henter mer
                                    </>
                                ) : (
                                    'Last inn mer'
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </>
    );
}
