import { useCalendarContext } from '../calendar-provider';
import { CalendarBodyDay } from './calendar-body-day';
import { CalendarBodyWeek } from './calendar-body-week';

export default function CalendarBody() {
    const { mode } = useCalendarContext();

    return (
        <>
            {mode === 'day' && <CalendarBodyDay />}
            {mode === 'week' && <CalendarBodyWeek />}
        </>
    );
}
