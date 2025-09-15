import CalendarEvent from '../calendar-event';
import { useCalendarContext } from '../calendar-provider';
import CalendarBodyHeader from './calendar-body-header';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { isSameDay } from 'date-fns';

export function CalendarBodyDay() {
    const { date } = useCalendarContext();
    return (
        <div className="flex flex-col flex-grow divide-y overflow-hidden">
            <div className="flex flex-col flex-1 overflow-y-auto">
                <div className="relative flex flex-1 divide-x">
                    <CalendarBodyMarginDayMargin />
                    <CalendarBodyDayContent date={date} />
                </div>
            </div>
        </div>
    );
}

export const hours = Array.from({ length: 24 }, (_, i) => i);

export function CalendarBodyMarginDayMargin({
    className,
}: {
    className?: string;
}) {
    return (
        <div
            className={cn(
                'sticky left-0 w-12 bg-background z-10 flex flex-col',
                className,
            )}
        >
            <div className="sticky top-0 left-0 h-[33px] bg-background z-20 border-b" />
            <div className="sticky left-0 w-12 bg-background z-10 flex flex-col">
                {hours.map((hour) => (
                    <div key={hour} className="relative h-10 first:mt-0">
                        {hour !== 0 && (
                            <span className="absolute text-xs text-muted-foreground -top-2.5 left-2">
                                {format(
                                    new Date().setHours(hour, 0, 0, 0),
                                    'HH:mm',
                                )}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CalendarBodyDayEvents() {
    const { events, date } = useCalendarContext();
    const dayEvents = events.filter((event) => isSameDay(event.start, date));

    return !!dayEvents.length ? (
        <div className="flex flex-col gap-2">
            <p className="font-medium p-2 pb-0 font-heading">Events</p>
            <div className="flex flex-col gap-2">
                {dayEvents.map((event) => (
                    <div
                        key={event.id}
                        className="flex items-center gap-2 px-2 cursor-pointer"
                        onClick={() => {
                            // TODO: Add event click handler
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className={`size-2 rounded-full bg-${event.color}-500`}
                            />
                            <p className="text-muted-foreground text-sm font-medium">
                                {event.title}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ) : (
        <div className="p-2 text-muted-foreground">No events today...</div>
    );
}

export function CalendarBodyDayContent({ date }: { date: Date }) {
    const { events } = useCalendarContext();

    const dayEvents = events.filter((event) => isSameDay(event.start, date));

    return (
        <div className="flex flex-col flex-grow">
            <CalendarBodyHeader date={date} />

            <div className="flex-1 relative">
                {hours.map((hour) => (
                    <div
                        key={hour}
                        className="h-10 border-b border-border/50 group"
                    />
                ))}

                {dayEvents.map((event) => (
                    <CalendarEvent key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
}
