'use client';

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
                filters.groups.includes(v.groupId),
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
                <Card key={item.itemId} className="overflow-hidden">
                    <img
                        className="aspect-video object-cover"
                        src="https://images.unsplash.com/photo-1737251043885-1fa62cb12933?q=80&w=2573&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="cover image"
                    />
                    <CardTitle className="p-3">{item.name}</CardTitle>
                    <CardDescription className="pl-3 mb-2">
                        <Badge className="select-none">{item.group.name}</Badge>
                    </CardDescription>
                    <CardContent>{item.description}</CardContent>
                    <CardFooter className="flex justify-end">
                        <Button asChild>
                            <Link href={`/booking/${item.itemId}`}>Åpne</Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}

            {(isLoading || isFetching) && (
                <div className="absolute inset-0 backdrop-blur-sm grid place-items-center">
                    <LoadingSpinner />
                </div>
            )}
        </Card>
    );
}
