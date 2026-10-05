import CalendarBody from './body/calendar-body';
import CalendarProvider from './calendar-provider';
import type { CalendarProps } from './calendar-types';

export default function Calendar({
    events,
    mode,
    date,
    calendarIconIsToday = true,
}: CalendarProps) {
    return (
        <CalendarProvider
            events={events}
            mode={mode}
            date={date}
            calendarIconIsToday={calendarIconIsToday}
        >
            <CalendarBody />
        </CalendarProvider>
    );
}
