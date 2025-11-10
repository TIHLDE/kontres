'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CalendarBody from '@/components/ui/full-calendar/body/calendar-body';
import CalendarProvider from '@/components/ui/full-calendar/calendar-provider';
import { CalendarEvent } from '@/components/ui/full-calendar/calendar-types';

import { api } from '@/trpc/react';
import { useMediaQuery } from '@uidotdev/usehooks';
import { CalendarIcon } from 'lucide-react';
import { useMemo } from 'react';
import {
    eachDayOfInterval,
    endOfDay,
    isSameDay,
    startOfDay,
} from 'date-fns';

interface ItemCalendarProps {
    itemId: number;
}

export default function ItemCalendar({ itemId }: ItemCalendarProps) {
    const { data: reservations } =
        api.reservation.getReservationsByBookableItemId.useQuery({
            bookableItemId: itemId,
        });

    const today = useMemo(() => {
        return new Date();
    }, []);

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
                    title: res.authorId,
                    start: segmentStart,
                    end: segmentEnd,
                    fullStart: reservationStart,
                    fullEnd: reservationEnd,
                    color: 'red',
                } satisfies CalendarEvent;
            });
        });
    }, [reservations]);

    const isMobile = useMediaQuery('(max-width: 768px)');
    const mode = isMobile ? 'day' : 'week';

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
                        date={today}
                        calendarIconIsToday
                    >
                        <CalendarBody />
                    </CalendarProvider>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
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
