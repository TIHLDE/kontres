'use client';

import { GroupInfo } from '@/server/api/routers/groupRouter';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { DateTimeRangePicker } from '@/components/ui/date-time-range-picker';
import Expandable from '@/components/ui/expandable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { cn } from '@/lib/utils';
import {
    ChevronRight,
    Search,
    SlidersHorizontal,
    Users,
    X,
} from 'lucide-react';
import { createParser, parseAsBoolean, useQueryState } from 'nuqs';
import * as React from 'react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

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

    const setDateRange = React.useCallback(
        (range: DateRange | undefined) => {
            setFrom(range?.from ?? null).catch(console.error);
            setTo(range?.to ?? null).catch(console.error);
        },
        [setFrom, setTo],
    );

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
        setDateRange(undefined);
    };

    const [searchFormExpanded, setSearchFormExpanded] = useState(false);

    return (
        <>
            {/* Desktop */}
            <Card className={cn('w-full h-fit hidden lg:block', className)}>
                <CardHeader className="flex flex-row justify-between items-center px-6 py-4">
                    <h2 className="font-semibold">Filtrer</h2>
                    <Button
                        variant={'destructive'}
                        onClick={clearFilters}
                        disabled={!isFiltering}
                        className={cn(
                            '!m-0 scale-[0.7]',
                            !isFiltering && 'invisible',
                        )}
                    >
                        <X />
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
                description="Filtrer arrangementer"
                icon={<SlidersHorizontal className="w-5 h-5 stroke-[1.5px]" />}
                onOpenChange={setSearchFormExpanded}
                open={searchFormExpanded}
                className="lg:hidden"
                title={
                    <div className="flex items-center gap-2">
                        <span>Filter</span>
                        {isFiltering && (
                            <Badge className="ml-1" variant="secondary">
                                Aktiv filter
                            </Badge>
                        )}
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
    const [isOpen, setIsOpen] = useState(true);

    const setDateRange = React.useCallback(
        (range: DateRange | undefined) => {
            setFrom(range?.from ?? null);
            setTo(range?.to ?? null);
        },
        [setFrom, setTo],
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

            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="space-y-2"
            >
                <CollapsibleTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-between space-x w-full"
                    >
                        <h4 className="text-sm font-semibold flex flex-row gap-2">
                            <Users />
                            Grupper
                        </h4>

                        <div>
                            <ChevronRight
                                className={cn(
                                    'transition-transform',
                                    isOpen && 'rotate-90',
                                )}
                            />
                            <span className="sr-only">Toggle</span>
                        </div>
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col gap-1 border-l-2 ml-6 pl-3">
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
                </CollapsibleContent>
            </Collapsible>

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
                <DateTimeRangePicker
                    className="w-full"
                    placeholder="Velg dato"
                    range={{
                        from: from ?? undefined,
                        to: to ?? undefined,
                    }}
                    setRange={(e) => setDateRange(e)}
                />
            </div>
        </>
    );
}
