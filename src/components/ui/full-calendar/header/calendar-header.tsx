import { useCalendarContext } from '../calendar-provider';
import { format, isSameMonth } from 'date-fns';

export function CalendarHeader({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex lg:flex-row flex-col lg:items-center justify-between p-4 gap-4 border-b">
            {children}
        </div>
    );
}

export function CalendarHeaderDateIcon() {
    const { calendarIconIsToday, date: calendarDate } = useCalendarContext();
    const date = calendarIconIsToday ? new Date() : calendarDate;
    return (
        <div className="flex size-14 flex-col items-start overflow-hidden rounded-lg border">
            <p className="flex h-6 w-full items-center justify-center bg-primary text-center text-xs font-semibold text-background uppercase">
                {format(date, 'MMM')}
            </p>
            <p className="flex w-full items-center justify-center text-lg font-bold">
                {format(date, 'dd')}
            </p>
        </div>
    );
}

export function CalendarHeaderDateBadge() {
    const { events, date } = useCalendarContext();
    const monthEvents = events.filter((event) =>
        isSameMonth(event.start, date),
    );

    if (!monthEvents.length) return null;
    return (
        <div className="whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-xs">
            {monthEvents.length} events
        </div>
    );
}
