import { CalendarEvent, Mode } from './calendar-types';
import type { CalendarContextType } from './calendar-types';
import { createContext, useContext } from 'react';

const CalendarContext = createContext<CalendarContextType | undefined>(
    undefined,
);

export default function CalendarProvider({
    events,
    mode,
    date,
    calendarIconIsToday = true,
    children,
}: {
    events: CalendarEvent[];
    mode: Mode;
    date: Date;
    calendarIconIsToday: boolean;
    children: React.ReactNode;
}) {
    return (
        <CalendarContext.Provider
            value={{
                events,
                mode,
                date,
                calendarIconIsToday,
            }}
        >
            {children}
        </CalendarContext.Provider>
    );
}

export function useCalendarContext() {
    const context = useContext(CalendarContext);
    if (!context) {
        throw new Error(
            'useCalendarContext must be used within a CalendarProvider',
        );
    }
    return context;
}
