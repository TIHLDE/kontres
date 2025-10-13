'use client';

import { GroupInfo } from '@/server/api/routers/groupRouter';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardTitle,
} from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loadingspinner';

import { datetimeParser, groupParser } from './SearchFilters';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { parseAsBoolean, parseAsString, useQueryStates } from 'nuqs';
import { useEffect, useState } from 'react';

type BookableItemsViewProps = {
    groups: GroupInfo[];
    className?: string;
};

export default function BookableItemsView({
    className,
}: BookableItemsViewProps) {
    const [filters] = useQueryStates({
        q: parseAsString,
        groups: groupParser.withDefault([]),
        alcohol: parseAsBoolean.withDefault(false),
        from: datetimeParser,
        to: datetimeParser,
    });

    const { data, isLoading, isFetching } =
        api.bookableItem.getFilterableList.useQuery();

    const [filteredData, setFilteredData] = useState(data ?? []);

    useEffect(() => {
        if (!data) return;
        if (filters == null) return setFilteredData(data);

        let filtered = data;

        if (filters.groups.length > 0) {
            filtered = filtered.filter((v) =>
                filters.groups.includes(v.groupSlug),
            );
        }

        if (filters.alcohol === true) {
            filtered = filtered.filter((v) => v.allowsAlcohol);
        }

        if (!!filters.q) {
            const query = filters.q.toLowerCase();
            filtered = filtered.filter(
                (v) =>
                    v.name.toLowerCase().includes(query) ||
                    v.description.toLowerCase().includes(query),
            );
        }

        setFilteredData(filtered);
    }, [filters, setFilteredData, data]);

    return (
        <Card
            className={cn(
                'relative grid grid-cols-1 lg:grid-cols-2 gap-3 p-4',
                className,
            )}
        >
            {filteredData.map((item) => (
                <Link
                    key={item.itemId}
                    href={`/booking/${item.itemId}`}
                    className="h-fit"
                >
                    <Card className="overflow-hidden">
                        <img
                            className="aspect-video object-cover opacity-30"
                            src="/placeholder.svg"
                            alt="cover image"
                        />
                        <div className="p-3 space-y-2">
                            <CardTitle className="m-0">{item.name}</CardTitle>
                            <Badge className="w-fit">
                                {item.groupSlug}
                            </Badge>
                            <CardDescription className="m-0">
                                {item.description}
                            </CardDescription>
                        </div>
                    </Card>
                </Link>
            ))}

            {(isLoading || isFetching) && (
                <div className="absolute inset-0 backdrop-blur-sm grid place-items-center">
                    <LoadingSpinner />
                </div>
            )}
        </Card>
    );
}
