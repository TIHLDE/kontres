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
import { useEffect, useMemo, useState } from 'react';

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

    const [currentCursor, setCurrentCursor] = useState<number | null>(null);
    const [cursorHistory, setCursorHistory] = useState<(number | null)[]>([]);

    const filterKey = useMemo(
        () =>
            JSON.stringify({
                groups: filters.groups,
                states: filters.states,
                items: filters.items,
                time: filters.time,
            }),
        [filters.groups, filters.states, filters.items, filters.time],
    );

    useEffect(() => {
        setCurrentCursor(null);
        setCursorHistory([]);
    }, [filterKey]);

    const {
        data,
        isLoading,
        isFetching,
    } = api.reservation.getReservations.useQuery(
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
            cursor: currentCursor,
        },
        {
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
                                items={data?.reservations ?? []}
                                groups={groups}
                            />
                            <div className="ml-auto flex items-center gap-2.5">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const previousCursor =
                                            cursorHistory[
                                                cursorHistory.length - 1
                                            ];
                                        setCursorHistory((prev) =>
                                            prev.slice(0, -1),
                                        );
                                        setCurrentCursor(previousCursor ?? null);
                                    }}
                                    disabled={isFetching || cursorHistory.length === 0}
                                >
                                    Forrige
                                </Button>
                                <Button
                                    className="gap-2.5 items-center"
                                    onClick={() => {
                                        if (!data?.nextCursor) return;
                                        setCursorHistory((prev) => [
                                            ...prev,
                                            currentCursor,
                                        ]);
                                        setCurrentCursor(data.nextCursor);
                                    }}
                                    disabled={isFetching || !data?.nextCursor}
                                >
                                    {isFetching ? (
                                        <>
                                            <LoadingSpinner /> Henter
                                        </>
                                    ) : (
                                        'Neste'
                                    )}
                                </Button>
                            </div>
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
