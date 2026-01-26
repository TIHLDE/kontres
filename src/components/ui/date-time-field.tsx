'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale/nb';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';

export type DateTimeFieldProps = {
    value: Date | null;
    onChange: (value: Date) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    dateButtonClassName?: string;
    timeInputClassName?: string;
};

export function DateTimeField({
    value,
    onChange,
    placeholder = 'Velg dato',
    disabled = false,
    className,
    dateButtonClassName,
    timeInputClassName,
}: DateTimeFieldProps) {
    const [open, setOpen] = React.useState(false);

    const formattedDate = value
        ? format(value, 'PPP', { locale: nb })
        : placeholder;

    const timeValue = value ? format(value, 'HH:mm') : '';

    const handleDateSelect = React.useCallback(
        (selected: Date | undefined) => {
            if (!selected) {
                return;
            }

            const nextDate = new Date(selected);
            if (value) {
                nextDate.setHours(
                    value.getHours(),
                    value.getMinutes(),
                    value.getSeconds(),
                    0,
                );
            }

            onChange(nextDate);
            setOpen(false);
        },
        [onChange, value],
    );

    const handleTimeChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const timeString = event.target.value;
            if (!timeString) {
                return;
            }

            const [hoursString, minutesString] = timeString.split(':');
            const hours = Number(hoursString ?? '0');
            const minutes = Number(minutesString ?? '0');

            const baseDate = value ?? new Date();
            const nextDate = new Date(baseDate);
            nextDate.setHours(hours, minutes, 0, 0);
            onChange(nextDate);
        },
        [onChange, value],
    );

    return (
        <div className={cn('flex flex-wrap gap-3', className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={disabled}
                        className={cn(
                            'h-10 w-full justify-between font-normal md:w-48',
                            !value && 'text-muted-foreground',
                            dateButtonClassName,
                        )}
                    >
                        <span className="truncate">{formattedDate}</span>
                        <ChevronDown className="h-4 w-4 shrink-0" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                    sideOffset={8}
                >
                    <Calendar
                        mode="single"
                        locale={nb}
                        selected={value ?? undefined}
                        onSelect={handleDateSelect}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            <Input
                type="time"
                step={60}
                disabled={disabled}
                value={timeValue}
                onChange={handleTimeChange}
                className={cn(
                    'h-10 w-full md:w-36',
                    'bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none',
                    timeInputClassName,
                )}
            />
        </div>
    );
}
