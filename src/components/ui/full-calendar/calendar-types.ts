export type CalendarProps = {
    events: CalendarEvent[];
    mode: Mode;
    setMode?: (mode: Mode) => void;
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
    fullStart?: Date;
    fullEnd?: Date;
};

export const calendarModes = ['day', 'week'] as const;

export type Mode = (typeof calendarModes)[number];
