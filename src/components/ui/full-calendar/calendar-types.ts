export type CalendarProps = {
    events: CalendarEvent[];
    mode: Mode;
    date: Date;
    calendarIconIsToday?: boolean;
};

export type CalendarContextType = CalendarProps;

export type CalendarEvent = {
    id: string;
    title: string;
    color: string;
    start: Date;
    end: Date;
};

export const calendarModes = ['day', 'week'] as const;

export type Mode = (typeof calendarModes)[number];
