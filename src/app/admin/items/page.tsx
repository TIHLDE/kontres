'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loadingspinner';

import FilterHeader from './components/filter-header/filter-header';
import ItemList from './components/item-list/item-list';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs';

export default function Page() {
    const [filters] = useQueryStates({
        groups: parseAsArrayOf<string>(parseAsString).withDefault([]),
        items: parseAsArrayOf<string>(parseAsString).withDefault([]),
    });

    const {
        data: items,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
    } = api.item.getItems.useInfiniteQuery(
        {
            limit: 5,
            filters: {
                groupIds:
                    filters.groups.length > 0 ? filters.groups : undefined,
                items:
                    filters.items.length > 0
                        ? filters.items.map((i) => parseInt(i))
                        : undefined,
            },
        },
        { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );
    return (
        <>
            <CardHeader>
                <CardTitle>Gjenstander</CardTitle>
            </CardHeader>
            <CardContent className="gap-2.5 flex flex-col">
                <FilterHeader />
                <div
                    className={cn(
                        'flex flex-col gap-2.5',
                        isFetching && 'blur-sm',
                    )}
                >
                    <ItemList
                        items={items?.pages.flatMap((page) => page.items) ?? []}
                    />
                </div>
                {hasNextPage && (
                    <Button
                        className="ml-auto gap-2.5 items-center"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? (
                            <>
                                <LoadingSpinner /> Henter mer
                            </>
                        ) : (
                            'Last inn mer'
                        )}
                    </Button>
                )}
            </CardContent>
        </>
    );
}
