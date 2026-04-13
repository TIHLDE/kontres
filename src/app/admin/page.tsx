'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loadingspinner';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';

import AllReservationsCalendar from '@/app/booking/components/AllReservationsCalendar';
import BookingList from './components/booking-list/booking-list';
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

    const {
        data,
        isLoading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = api.reservation.getReservations.useInfiniteQuery(
        {
            filters: {
                groupSlugs:
                    filters.groups.length > 0 ? filters.groups : undefined,
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
            limit: 30,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            staleTime: 10000,
            refetchOnWindowFocus: false,
        },
    );

    const { data: groups = [] } = api.group.getAll.useQuery();

    return (
        <Tabs defaultValue="list">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Reservasjoner</CardTitle>
                <TabsList>
                    <TabsTrigger value="list">Liste</TabsTrigger>
                    <TabsTrigger value="calendar">Kalender</TabsTrigger>
                </TabsList>
            </CardHeader>
            <CardContent>
                <TabsContent value="list" className="mt-0">
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
                                groups={groups}
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
                </TabsContent>
                <TabsContent value="calendar" className="mt-0">
                    <AllReservationsCalendar />
                </TabsContent>
            </CardContent>
        </Tabs>
    );
}
