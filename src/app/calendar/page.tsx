'use client';

// import Calendar from './_components/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Calendar from '@/components/ui/full-calendar/calendar';
import {
    CalendarEvent,
    Mode,
} from '@/components/ui/full-calendar/calendar-types';

import Filter from './_components/filter';
import {
    addDays,
    addWeeks,
    endOfWeek,
    format,
    startOfWeek,
    subDays,
    subWeeks,
} from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

const initialDate = new Date('2025-09-15T12:00:00Z');

export default function CalendarPage() {
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([
        {
            id: '1',
            color: 'indigo',
            end: new Date(initialDate.getTime() + 1000 * 60 * 60 * 19),
            start: new Date(initialDate.getTime()),
            title: 'Event 1',
        },
    ]);
    const [mode, setMode] = useState<Mode>('week');

    function handleBackward() {
        if (mode === 'day') {
            setDate(subDays(date, 1));
        } else {
            setDate(subWeeks(date, 1));
        }
    }
    function handleForward() {
        if (mode === 'day') {
            setDate(addDays(date, 1));
        } else {
            setDate(addWeeks(date, 1));
        }
    }

    function toggleMode() {
        setMode(mode === 'day' ? 'week' : 'day');
    }

    function addRandomEvent() {
        const randomTime = Math.floor(Math.random() * 1000 * 60 * 60 * 24);

        setEvents([
            ...events,
            {
                id: events.length + 1 + '',
                title: 'Random Event',
                color: 'random',
                start: new Date(Date.now() + randomTime),
                end: new Date(Date.now() + randomTime + 1000 * 60 * 60 * 1),
            },
        ]);
    }

    const dateDisplay = useMemo(() => {
        if (mode === 'day') {
            return format(date, 'dd MMMM, yyyy');
        }
        const weekStart = startOfWeek(date);
        const weekEnd = endOfWeek(date);
        return `${format(weekStart, 'dd MMMM, yyyy')} - ${format(weekEnd, 'dd MMMM, yyyy')}`;
    }, [date, mode]);

    return (
        <div>
            {/* Controls */}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleBackward}
                        className="size-7"
                        variant="outline"
                    >
                        <ChevronLeftIcon />
                    </Button>
                    <span>{dateDisplay}</span>
                    <Button
                        onClick={handleForward}
                        className="size-7"
                        variant="outline"
                    >
                        <ChevronRightIcon />
                    </Button>
                </div>
                <div>
                    <Button onClick={toggleMode}>
                        Change to: {mode === 'day' ? 'Week' : 'Day'}
                    </Button>
                    <Button onClick={addRandomEvent}>Add Random Event</Button>
                </div>
            </div>
            <div>
                <Calendar date={date} events={events} mode={mode} />
            </div>
        </div>
    );
}
