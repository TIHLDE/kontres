'use client';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { api } from '@/trpc/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ReservationState } from '@prisma/client';
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

const DAY_HEADERS = ['Ma', 'Ti', 'On', 'To', 'Fr', 'Lø', 'Sø'];

function getStatusLabel(status: ReservationState) {
    switch (status) {
        case ReservationState.APPROVED:
            return 'Godkjent';
        case ReservationState.PENDING:
            return 'Avventer';
        case ReservationState.REJECTED:
            return 'Avvist';
        default:
            return status;
    }
}

function getStatusTextClass(status: ReservationState) {
    switch (status) {
        case ReservationState.APPROVED:
            return 'text-green-700 dark:text-green-400';
        case ReservationState.PENDING:
            return 'text-yellow-400';
        case ReservationState.REJECTED:
            return 'text-red-400';
        default:
            return 'text-foreground';
    }
}

export default function AllReservationsCalendar() {
    const [currentMonth, setCurrentMonth] = useState(() => new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const gridDays = useMemo(
        () => eachDayOfInterval({ start: gridStart, end: gridEnd }),
        [gridStart, gridEnd],
    );

    const { data } = api.reservation.getAllReservationsInRange.useQuery(
        {
            startDate: gridStart,
            endDate: gridEnd,
        },
        {
            staleTime: 30000,
            refetchOnWindowFocus: false,
        },
    );

    const reservationsByDay = useMemo(() => {
        const map = new Map<
            string,
            {
                start: Date;
                end: Date;
                title: string;
                status: ReservationState;
                bookedBy: string;
            }[]
        >();
        if (!data?.reservations) return map;

        for (const res of data.reservations) {
            const resStart = new Date(res.startTime);
            const resEnd = new Date(res.endTime);
            const title = res.bookableItem?.name ?? 'Reservasjon';
            const bookedBy = res.author?.first_name
                ? `${res.author.first_name} ${res.author.last_name ?? ''}`.trim()
                : 'Ukjent bruker';

            for (const day of gridDays) {
                const dayStart = new Date(day);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(day);
                dayEnd.setHours(23, 59, 59, 999);

                if (resStart <= dayEnd && resEnd >= dayStart) {
                    const key = format(day, 'yyyy-MM-dd');
                    if (!map.has(key)) map.set(key, []);
                    map.get(key)!.push({
                        start: resStart,
                        end: resEnd,
                        title,
                        status: res.status,
                        bookedBy,
                    });
                }
            }
        }

        return map;
    }, [data, gridDays]);

    const weeks: Date[][] = [];
    for (let i = 0; i < gridDays.length; i += 7) {
        weeks.push(gridDays.slice(i, i + 7));
    }

    return (
        <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Alle reservasjoner</h2>
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
                        <span className="text-sm font-medium w-28 text-center capitalize">
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

                {weeks.map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7">
                        {week.map((day, di) => {
                            const key = format(day, 'yyyy-MM-dd');
                            const dayReservations =
                                reservationsByDay.get(key) ?? [];
                            const inMonth = isSameMonth(day, currentMonth);
                            const today = isToday(day);

                            return (
                                <div
                                    key={di}
                                    className={`min-h-[100px] border-b p-1 ${
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

                                        const startsOnDay = res.start >= dayStart;
                                        const endsOnDay = res.end <= dayEnd;

                                        const startLabel = startsOnDay
                                            ? format(res.start, 'HH:mm')
                                            : '…';
                                        const endLabel = endsOnDay
                                            ? format(res.end, 'HH:mm')
                                            : '…';

                                        return (
                                            <Popover key={i}>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="w-full text-left bg-red-900 text-white text-xs rounded px-1 py-0.5 mb-0.5 truncate cursor-pointer hover:bg-red-800"
                                                    >
                                                        {startLabel}-{endLabel}{' '}
                                                        {res.title}
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    side="top"
                                                    align="start"
                                                    className="max-w-xs p-3"
                                                >
                                                    <div className="text-xs space-y-1.5">
                                                        <p className="font-semibold">
                                                            {res.title}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">
                                                                Tid:
                                                            </span>{' '}
                                                            {format(
                                                                res.start,
                                                                'dd.MM HH:mm',
                                                            )}{' '}
                                                            -{' '}
                                                            {format(
                                                                res.end,
                                                                'dd.MM HH:mm',
                                                            )}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">
                                                                Booker:
                                                            </span>{' '}
                                                            {res.bookedBy}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">
                                                                Status:
                                                            </span>{' '}
                                                            <span className={getStatusTextClass(res.status)}>
                                                                {getStatusLabel(res.status)}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                ))}
        </div>
    );
}
