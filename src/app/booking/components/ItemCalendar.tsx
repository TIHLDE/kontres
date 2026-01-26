'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CalendarBody from '@/components/ui/full-calendar/body/calendar-body';
import CalendarProvider from '@/components/ui/full-calendar/calendar-provider';
import { CalendarEvent } from '@/components/ui/full-calendar/calendar-types';

import { api } from '@/trpc/react';
import { useMediaQuery } from '@uidotdev/usehooks';
import {
    addDays,
    eachDayOfInterval,
    endOfDay,
    format,
    isSameDay,
    startOfDay,
} from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ItemCalendarProps {
    itemId: number;
}

export default function ItemCalendar({ itemId }: ItemCalendarProps) {
    const [currentDate, setCurrentDate] = useState(() => new Date());

    const isMobile = useMediaQuery('(max-width: 768px)');
    const mode = isMobile ? 'day' : 'week';

    // Calculate date range based on current view (show 2 weeks before/after for context)
    const viewStartDate = useMemo(() => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - (mode === 'day' ? 7 : 14));
        return date;
    }, [currentDate, mode]);

    const viewEndDate = useMemo(() => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + (mode === 'day' ? 7 : 14));
        return date;
    }, [currentDate, mode]);

    const { data: reservations } =
        api.reservation.getReservationsByBookableItemId.useQuery(
            {
                bookableItemId: itemId,
                startDate: viewStartDate,
                endDate: viewEndDate,
            },
            {
                staleTime: 30000, // Cache for 30 seconds
                refetchOnWindowFocus: false,
            },
        );

    const events = useMemo<CalendarEvent[]>(() => {
        if (!reservations?.reservations) return [];

        return reservations.reservations.flatMap((res) => {
            const reservationStart = new Date(res.startTime);
            const reservationEnd = new Date(res.endTime);

            const days = eachDayOfInterval({
                start: startOfDay(reservationStart),
                end: startOfDay(reservationEnd),
            });

            return days.map((day) => {
                const segmentStart = isSameDay(day, reservationStart)
                    ? reservationStart
                    : startOfDay(day);
                const segmentEnd = isSameDay(day, reservationEnd)
                    ? reservationEnd
                    : endOfDay(day);

                return {
                    id: `${res.reservationId}-${day.toISOString()}`,
                    title: res.groupSlug.toUpperCase() ?? 'Enkelt person',
                    start: segmentStart,
                    end: segmentEnd,
                    fullStart: reservationStart,
                    fullEnd: reservationEnd,
                    color: 'red',
                } satisfies CalendarEvent;
            });
        });
    }, [reservations]);

    const handleNavigate = (direction: 'previous' | 'next') => {
        const delta = mode === 'day' ? 1 : 7;
        setCurrentDate((prev) =>
            addDays(prev, direction === 'next' ? delta : -delta),
        );
    };

    const handleResetToday = () => {
        setCurrentDate(new Date());
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Availability Calendar
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <CalendarProvider
                        events={events}
                        mode={mode}
                        date={currentDate}
                        calendarIconIsToday
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>
                                    {format(
                                        currentDate,
                                        mode === 'day'
                                            ? 'PPP'
                                            : "wo 'uke' yyyy",
                                    )}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetToday}
                                >
                                    I dag
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            handleNavigate('previous')
                                        }
                                        aria-label={
                                            mode === 'day'
                                                ? 'Forrige dag'
                                                : 'Forrige uke'
                                        }
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleNavigate('next')}
                                        aria-label={
                                            mode === 'day'
                                                ? 'Neste dag'
                                                : 'Neste uke'
                                        }
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <CalendarBody />
                    </CalendarProvider>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-100 border bg-red-200 border-red-300 rounded"></div>
                            <span>Reserved</span>
                        </div>
                    </div>

                    {reservations && reservations.reservations.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-medium mb-2">
                                Upcoming Reservations
                            </h4>
                            <div className="space-y-2">
                                {reservations.reservations
                                    .filter(
                                        (reservation) =>
                                            new Date(reservation.startTime) >=
                                            new Date(),
                                    )
                                    .slice(0, 3)
                                    .map((reservation, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span>
                                                {new Date(
                                                    reservation.startTime,
                                                ).toLocaleDateString('nb-NO')}
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {new Date(
                                                    reservation.startTime,
                                                ).toLocaleTimeString('nb-NO', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}{' '}
                                                -{' '}
                                                {new Date(
                                                    reservation.endTime,
                                                ).toLocaleTimeString('nb-NO', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </Badge>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
