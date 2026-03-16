'use client';

import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameMonth,
    isToday,
    startOfMonth,
    startOfWeek,
} from 'date-fns';
import { nb } from 'date-fns/locale';

interface ItemCalendarProps {
    itemId: number;
}

const DAY_HEADERS = ['Ma', 'Ti', 'On', 'To', 'Fr', 'Lø', 'Sø'];

export default function ItemCalendar({ itemId }: ItemCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(() => new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const gridDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

    const { data: reservations } =
        api.reservation.getReservationsByBookableItemId.useQuery(
            {
                bookableItemId: itemId,
                startDate: gridStart,
                endDate: gridEnd,
            },
            {
                staleTime: 30000,
                refetchOnWindowFocus: false,
            },
        );

    const reservationsByDay = useMemo(() => {
        const map = new Map<string, { start: Date; end: Date }[]>();
        if (!reservations?.reservations) return map;

        for (const res of reservations.reservations) {
            const resStart = new Date(res.startTime);
            const resEnd = new Date(res.endTime);

            for (const day of gridDays) {
                const dayStart = new Date(day);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(day);
                dayEnd.setHours(23, 59, 59, 999);

                if (resStart <= dayEnd && resEnd >= dayStart) {
                    const key = format(day, 'yyyy-MM-dd');
                    if (!map.has(key)) map.set(key, []);
                    map.get(key)!.push({ start: resStart, end: resEnd });
                }
            }
        }

        return map;
    }, [reservations, gridDays]);

    const weeks: Date[][] = [];
    for (let i = 0; i < gridDays.length; i += 7) {
        weeks.push(gridDays.slice(i, i + 7));
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Tilgjengelighet</h2>
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            setCurrentMonth((prev) => addMonths(prev, -1))
                        }
                        aria-label="Forrige måned"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium w-28 text-center">
                        {format(currentMonth, 'MMMM yyyy', { locale: nb })}
                    </span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            setCurrentMonth((prev) => addMonths(prev, 1))
                        }
                        aria-label="Neste måned"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 border-b">
                {DAY_HEADERS.map((d) => (
                    <div
                        key={d}
                        className="py-2 text-center text-sm text-muted-foreground"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7">
                    {week.map((day, di) => {
                        const key = format(day, 'yyyy-MM-dd');
                        const dayReservations = reservationsByDay.get(key) ?? [];
                        const inMonth = isSameMonth(day, currentMonth);
                        const today = isToday(day);

                        return (
                            <div
                                key={di}
                                className={`min-h-[80px] border-b p-1 ${
                                    di < 6 ? 'border-r' : ''
                                } ${today ? 'bg-muted/50' : ''}`}
                            >
                                <span
                                    className={`block text-sm mb-1 ${
                                        inMonth
                                            ? 'text-foreground'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    {format(day, 'd')}
                                </span>

                                {dayReservations.map((res, i) => {
                                    const dayStart = new Date(day);
                                    dayStart.setHours(0, 0, 0, 0);
                                    const dayEnd = new Date(day);
                                    dayEnd.setHours(23, 59, 59, 999);

                                    const segStart =
                                        res.start < dayStart
                                            ? dayStart
                                            : res.start;
                                    const segEnd =
                                        res.end > dayEnd ? dayEnd : res.end;

                                    return (
                                        <div
                                            key={i}
                                            className="bg-red-900 text-white text-xs rounded px-1 py-0.5 mb-0.5 truncate"
                                        >
                                            {format(segStart, 'HH:mm')}-
                                            {format(segEnd, 'HH:mm')}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Valgt periode</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-900" />
                    <span>Utilgjengelig</span>
                </div>
            </div>
        </div>
    );
}
