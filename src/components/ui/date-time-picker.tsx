'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { type InputProps } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { TimePickerSection } from '@/components/ui/time-picker-section';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale/nb';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';

export function DateTimePicker({
    className,
    initialDate,
    value,
    ...props
}: InputProps) {
    const [date, setDate] = React.useState<Date | null>(
        initialDate ??
            (typeof value !== 'undefined' ? new Date(value as string) : null),
    );
    const handleDateChange = (newDate?: Date) => {
        if (!newDate) return;
        setDate(newDate);
        if (props.onChange) {
            const event = {
                target: {
                    value: newDate,
                },
                bubbles: true,
                cancelable: true,
                currentTarget: undefined,
                defaultPrevented: false,
            } as unknown as React.ChangeEvent<HTMLInputElement>;

            props.onChange(event);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-[280px] justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                        className,
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                        format(date, 'PPP HH:mm:ss', {
                            locale: nb,
                        })
                    ) : (
                        <span>Velg dato og klokkeslett</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    {...props}
                    mode="single"
                    locale={nb}
                    selected={date ?? new Date()}
                    onSelect={handleDateChange}
                    initialFocus
                />
                <div className="p-3 border-t border-border">
                    <TimePickerSection
                        setDate={handleDateChange}
                        date={date ?? new Date()}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}
