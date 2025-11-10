import { useCalendarContext } from './calendar-provider';
import { CalendarEvent as CalendarEventType } from './calendar-types';
import { cn } from '@/lib/utils';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';

interface EventPosition {
    left: string;
    width: string;
    top: string;
    height: string;
}

function getOverlappingEvents(
    currentEvent: CalendarEventType,
    events: CalendarEventType[],
): CalendarEventType[] {
    return events.filter((event) => {
        if (event.id === currentEvent.id) return false;
        return (
            currentEvent.start < event.end &&
            currentEvent.end > event.start &&
            isSameDay(currentEvent.start, event.start)
        );
    });
}

function calculateEventPosition(
    event: CalendarEventType,
    allEvents: CalendarEventType[],
): EventPosition {
    const overlappingEvents = getOverlappingEvents(event, allEvents);
    const group = [event, ...overlappingEvents].sort(
        (a, b) => a.start.getTime() - b.start.getTime(),
    );
    const position = group.indexOf(event);
    const width = `${100 / (overlappingEvents.length + 1)}%`;
    const left = `${(position * 100) / (overlappingEvents.length + 1)}%`;

    const startHour = event.start.getHours();
    const startMinutes = event.start.getMinutes();

    let endHour = event.end.getHours();
    let endMinutes = event.end.getMinutes();

    if (!isSameDay(event.start, event.end)) {
        endHour = 23;
        endMinutes = 59;
    }

    const SIZE_CONSTANT = 40;

    const topPosition =
        startHour * SIZE_CONSTANT + (startMinutes / 60) * SIZE_CONSTANT;
    const duration =
        endHour * 60 + endMinutes - (startHour * 60 + startMinutes);
    const height = (duration / 60) * SIZE_CONSTANT;

    return {
        left,
        width,
        top: `${topPosition}px`,
        height: `${height}px`,
    };
}

export default function CalendarEvent({
    event,
    month = false,
    className,
}: {
    event: CalendarEventType;
    month?: boolean;
    className?: string;
}) {
    const { events, date } = useCalendarContext();
    const style = month ? {} : calculateEventPosition(event, events);

    const displayStart = event.fullStart ?? event.start;
    const displayEnd = event.fullEnd ?? event.end;

    // Generate a unique key that includes the current month to prevent animation conflicts
    const isEventInCurrentMonth = isSameMonth(event.start, date);
    const animationKey = `${event.id}-${
        isEventInCurrentMonth ? 'current' : 'adjacent'
    }`;

    return (
        <MotionConfig reducedMotion="user">
            <AnimatePresence mode="wait">
                <motion.div
                    className={cn(
                        `px-3 py-1.5 rounded-md truncate cursor-pointer transition-all duration-300 bg-${event.color}-500/10 hover:bg-${event.color}-500/20 border border-${event.color}-500`,
                        !month && 'absolute',
                        className,
                    )}
                    style={style}
                    onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Add event click handler
                    }}
                    initial={{
                        opacity: 0,
                        y: -3,
                        scale: 0.98,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.98,
                        transition: {
                            duration: 0.15,
                            ease: 'easeOut',
                        },
                    }}
                    transition={{
                        duration: 0.2,
                        ease: [0.25, 0.1, 0.25, 1],
                        opacity: {
                            duration: 0.2,
                            ease: 'linear',
                        },
                        layout: {
                            duration: 0.2,
                            ease: 'easeOut',
                        },
                    }}
                    layoutId={`event-${animationKey}-${month ? 'month' : 'day'}`}
                >
                    <motion.div
                        className={cn(
                            `flex flex-col w-full text-${event.color}-500`,
                            month && 'flex-row items-center justify-between',
                        )}
                        layout="position"
                    >
                        <p
                            className={cn(
                                'font-bold truncate',
                                month && 'text-xs',
                            )}
                        >
                            {event.title}
                        </p>
                        <p className={cn('text-sm', month && 'text-xs')}>
                            <span>{format(displayStart, 'HH:mm')}</span>
                            <span className={cn('mx-1', month && 'hidden')}>
                                -
                            </span>
                            <span className={cn(month && 'hidden')}>
                                {format(displayEnd, 'HH:mm')}
                            </span>
                        </p>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </MotionConfig>
    );
}
