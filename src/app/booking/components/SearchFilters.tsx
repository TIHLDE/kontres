'use client';

import { GroupInfo } from '@/server/api/routers/groupRouter';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import Expandable from '@/components/ui/expandable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

import { cn } from '@/lib/utils';
import {
    ChevronDown,
    ChevronRight,
    FunnelX,
    Search,
    SlidersHorizontal,
    Users,
} from 'lucide-react';
import { createParser, parseAsBoolean, useQueryState } from 'nuqs';
import * as React from 'react';
import { useState } from 'react';

export const groupParser = createParser<string[]>({
    parse(value) {
        if (value == null) return [];
        if (value == '') return [];
        return value.split(',');
    },

    serialize(value) {
        return value.join(',');
    },

    eq(a, b) {
        if (a.length !== b.length) return false;
        if (a.length === 0) return true;
        return a.every((v) => b.includes(v));
    },
});

export const datetimeParser = createParser<Date | null>({
    parse(value) {
        if (value == null || value == '') return null;
        if (Number.isNaN(parseInt(value))) return null;
        return new Date(+value);
    },

    serialize(value) {
        if (value == null) return '';
        return value.getTime().toString();
    },
});

type SearchFiltersProps = {
    groups: GroupInfo[];
    className?: string;
};

export default function SearchFilters({
    groups: groupsDict,
    className,
}: SearchFiltersProps) {
    const [query, setQuery] = useQueryState('q');
    const [groups, setGroups] = useQueryState(
        'groups',
        groupParser.withDefault([]),
    );
    const [isAlcoholAllowed, setIsAlcoholAllowed] = useQueryState(
        'alcohol',
        parseAsBoolean.withDefault(false),
    );

    const [from, setFrom] = useQueryState('from', datetimeParser);
    const [to, setTo] = useQueryState('to', datetimeParser);

    const isFiltering =
        query != null ||
        groups.length > 0 ||
        isAlcoholAllowed ||
        from != null ||
        to != null;

    const clearFilters = () => {
        setQuery(null).catch(console.error);
        setGroups([]).catch(console.error);
        setIsAlcoholAllowed(false).catch(console.error);
        setFrom(null).catch(console.error);
        setTo(null).catch(console.error);
    };

    const [searchFormExpanded, setSearchFormExpanded] = useState(false);

    return (
        <>
            {/* Desktop */}
            <Card className={cn('w-full h-fit hidden lg:block', className)}>
                <CardHeader className="flex flex-row justify-between items-center px-6 py-4">
                    <h2 className="font-semibold">Filtrer</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        disabled={!isFiltering}
                        className={cn('gap-2', !isFiltering && 'invisible')}
                    >
                        <FunnelX className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <Separator />
                <CardContent className="w-full flex gap-3 flex-col mt-6">
                    <Filters
                        query={query}
                        setQuery={setQuery}
                        groups={groups}
                        setGroups={setGroups}
                        isAlcoholAllowed={isAlcoholAllowed}
                        setIsAlcoholAllowed={setIsAlcoholAllowed}
                        from={from}
                        setFrom={setFrom}
                        to={to}
                        setTo={setTo}
                        groupsDict={groupsDict}
                    />
                </CardContent>
            </Card>
            {/* Mobile */}
            <Expandable
                icon={<SlidersHorizontal className="w-5 h-5 stroke-[1.5px]" />}
                onOpenChange={setSearchFormExpanded}
                open={searchFormExpanded}
                className="lg:hidden"
                title={
                    <div className="flex items-center gap-3">
                        <span>Filter</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            disabled={!isFiltering}
                            className={cn(
                                'gap-2 -mr-2',
                                !isFiltering && 'invisible',
                            )}
                        >
                            <FunnelX className="h-4 w-4" />
                        </Button>
                    </div>
                }
            >
                <div className="flex gap-3 flex-col">
                    <Filters
                        query={query}
                        setQuery={setQuery}
                        groups={groups}
                        setGroups={setGroups}
                        isAlcoholAllowed={isAlcoholAllowed}
                        setIsAlcoholAllowed={setIsAlcoholAllowed}
                        from={from}
                        setFrom={setFrom}
                        to={to}
                        setTo={setTo}
                        groupsDict={groupsDict}
                    />
                </div>
            </Expandable>
        </>
    );
}

type FiltersProps = {
    query: string | null;
    setQuery: (value: string | null) => unknown;

    groups: string[];
    setGroups: (value: string[]) => unknown;

    isAlcoholAllowed: boolean;
    setIsAlcoholAllowed: (value: boolean) => unknown;

    from: Date | null;
    setFrom: (value: Date | null) => unknown;

    to: Date | null;
    setTo: (value: Date | null) => unknown;

    groupsDict: GroupInfo[];
};
function Filters({
    query,
    setQuery,
    groups,
    setGroups,
    isAlcoholAllowed,
    setIsAlcoholAllowed,
    from,
    setFrom,
    to,
    setTo,
    groupsDict,
}: FiltersProps) {
    const [isGroupSectionOpen, setIsGroupSectionOpen] = useState(false);

    const handleFromChange = React.useCallback(
        (value: Date | null) => {
            void setFrom(value);
        },
        [setFrom],
    );

    const handleToChange = React.useCallback(
        (value: Date | null) => {
            void setTo(value);
        },
        [setTo],
    );
    return (
        <>
            <Label className="space-y-3">
                <span>Søk</span>
                <div className="relative">
                    <Search className="absolute top-[50%] -translate-y-[50%] left-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Søkeord..."
                        value={query ?? ''}
                        onChange={(e) =>
                            setQuery(
                                e.target.value == '' ? null : e.target.value,
                            )
                        }
                        className="pl-8"
                        aria-label="Søk"
                    />
                </div>
            </Label>

            <div className="space-y-2">
                <Button
                    variant="outline"
                    size="default"
                    type="button"
                    className="flex h-10 items-center justify-between w-full"
                    onClick={() =>
                        setIsGroupSectionOpen((previous) => !previous)
                    }
                >
                    <h4 className="text-sm font-semibold flex flex-row gap-2">
                        <Users />
                        Grupper
                    </h4>

                    <div>
                        <ChevronRight
                            className={cn(
                                'transition-transform',
                                isGroupSectionOpen && 'rotate-90',
                            )}
                        />
                        <span className="sr-only">Toggle</span>
                    </div>
                </Button>
                {isGroupSectionOpen && (
                    <div className="flex flex-col gap-1 border-l-2 ml-6 pl-3 md:w-80">
                        {groupsDict.map((group) => (
                            <Label
                                key={group.groupSlug}
                                className="flex gap-2 items-center"
                            >
                                <Checkbox
                                    checked={groups.includes(group.groupSlug)}
                                    onCheckedChange={async (e) => {
                                        if (!!e) {
                                            await setGroups([
                                                ...groups,
                                                group.groupSlug,
                                            ]);
                                        } else {
                                            await setGroups(
                                                groups.filter(
                                                    (g) => g !== group.groupSlug,
                                                ),
                                            );
                                        }
                                    }}
                                />
                                <span>{group.groupName}</span>
                            </Label>
                        ))}
                    </div>
                )}
            </div>

            <Label className="flex gap-2 items-center">
                <Checkbox
                    checked={isAlcoholAllowed}
                    onCheckedChange={(e) => setIsAlcoholAllowed(!!e)}
                />
                <span>Alkohol er lov</span>
            </Label>

            <div className="mt-2">
                <Label>
                    <span>Tilgengelig mellom</span>
                </Label>
                <div className="mt-3 flex flex-col gap-4">
                    <DateTimeSelector
                        label="Fra"
                        value={from}
                        onChange={handleFromChange}
                    />
                    <DateTimeSelector
                        label="Til"
                        value={to}
                        onChange={handleToChange}
                    />
                </div>
            </div>
        </>
    );
}

type DateTimeSelectorProps = {
    label: string;
    value: Date | null;
    onChange: (value: Date | null) => void;
};

function DateTimeSelector({ label, value, onChange }: DateTimeSelectorProps) {
    const [open, setOpen] = useState(false);

    const formattedDate = value
        ? value.toLocaleDateString('nb-NO')
        : 'Velg dato';

    const timeValue = value
        ? `${value.getHours().toString().padStart(2, '0')}:${value
              .getMinutes()
              .toString()
              .padStart(2, '0')}`
        : '';

    const handleDateSelect = React.useCallback(
        (selected: Date | undefined) => {
            if (!selected) {
                onChange(null);
                setOpen(false);
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
        [onChange, setOpen, value],
    );

    const handleTimeChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const timeString = event.target.value;
            if (!timeString) {
                onChange(value);
                return;
            }

            const [hoursString, minutesString, secondsString] =
                timeString.split(':');
            const hours = Number(hoursString ?? '0');
            const minutes = Number(minutesString ?? '0');
            const seconds = Number(secondsString ?? '0');

            const baseDate = value ?? new Date();
            const nextDate = new Date(baseDate);
            nextDate.setHours(hours, minutes, seconds, 0);
            onChange(nextDate);
        },
        [onChange, value],
    );

    return (
        <div className="flex flex-col gap-2">
            <Label className="px-1">{label}</Label>
            <div className="flex flex-wrap gap-3">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="default"
                            type="button"
                            className="md:w-48 w-full justify-between font-normal h-10"
                        >
                            {formattedDate}
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                    >
                        <Calendar
                            mode="single"
                            selected={value ?? undefined}
                            onSelect={handleDateSelect}
                            initialFocus
                            showOutsideDays
                        />
                    </PopoverContent>
                </Popover>
                <Input
                    type="time"
                    value={timeValue}
                    onChange={handleTimeChange}
                    disabled={!value}
                    className={cn(
                        'md:w-36 w-full h-10',
                        'bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none',
                    )}
                />
            </div>
        </div>
    );
}
