'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale/nb';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange, InputProps } from 'react-day-picker';

export function DateTimeRangePicker({
    className,
    timeFormat,
    setRange,
    range,
    ...props
}: InputProps & {
    timeFormat?: string;
    range: DateRange | undefined;
    setRange: (range: DateRange | undefined) => void;
    className?: string;
}) {
    // const [date, setDate] = useState<DateRange | undefined>(props.range);

    // const [startTime, setStartTime] = useState<Date | undefined>(
    //     props.range?.from,
    // );
    // const [endTime, setEndTime] = useState<Date | undefined>(props.range?.to);

    // useEffect(() => {
    //     if (date == undefined) return setRange(undefined);
    //     const from = date.from;
    //     const to = date.to;

    //     if (from && startTime) {
    //         from.setHours(startTime.getHours());
    //         from.setMinutes(startTime.getMinutes());
    //     }

    //     if (to && endTime) {
    //         to.setHours(endTime.getHours());
    //         to.setMinutes(endTime.getMinutes());
    //     }

    //     setRange({ from, to });
    // }, [date, startTime, endTime, setRange]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-[300px] justify-start text-left font-normal',
                        !range && 'text-muted-foreground',
                        className,
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {range?.from ? (
                        range.to ? (
                            <>
                                {format(range.from, timeFormat ?? 'd LLL, y')} -{' '}
                                {format(range.to, timeFormat ?? 'd LLL, y')}
                            </>
                        ) : (
                            format(range.from, timeFormat ?? 'd LLL, y')
                        )
                    ) : (
                        <span>{props.placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    initialFocus
                    mode="range"
                    locale={nb}
                    defaultMonth={range?.from}
                    selected={range}
                    onSelect={setRange}
                    numberOfMonths={2}
                />
                {/* <div className="flex flex-row p-3 border-t border-border">
                    <TimePickerSection
                        setDate={setStartTime}
                        date={startTime}
                    />
                    <TimePickerSection setDate={setEndTime} date={endTime} />
                </div> */}
            </PopoverContent>
        </Popover>
    );
}
