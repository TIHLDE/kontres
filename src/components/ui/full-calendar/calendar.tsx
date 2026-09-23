import CalendarBody from './body/calendar-body';
import CalendarProvider from './calendar-provider';
import type { CalendarProps } from './calendar-types';

export default function Calendar({
    events,
    mode,
    setMode,
    date,
    calendarIconIsToday = true,
}: CalendarProps) {
    return (
        <CalendarProvider
            events={events}
            mode={mode}
            setMode={setMode}
            date={date}
            calendarIconIsToday={calendarIconIsToday}
        >
            <CalendarBody />
        </CalendarProvider>
    );
}
