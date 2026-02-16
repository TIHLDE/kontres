'use client';

import { GroupInfo } from '@/server/api/routers/groupRouter';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loadingspinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { datetimeParser, groupParser } from './SearchFilters';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import Image from 'next/image';
import Link from 'next/link';
import { parseAsBoolean, parseAsString, useQueryStates } from 'nuqs';
import { useEffect, useState } from 'react';
import MultiItemReservationDialog from './MultiItemReservationDialog';

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
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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

    const handleToggleItem = (itemId: number) => {
        setSelectedItems((prev) => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        if (selectedItems.size === filteredData.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredData.map((item) => item.itemId)));
        }
    };

    const handleReserveSelected = () => {
        if (selectedItems.size === 0) return;
        setIsDialogOpen(true);
    };

    const selectedItemsData = filteredData.filter((item) =>
        selectedItems.has(item.itemId),
    );

    return (
        <Card className={cn('relative', className)}>
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Checkbox
                        checked={
                            filteredData.length > 0 &&
                            selectedItems.size === filteredData.length
                        }
                        onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">
                        {selectedItems.size > 0
                            ? `${selectedItems.size} valgt`
                            : 'Velg alle'}
                    </span>
                </div>
                {selectedItems.size > 0 && (
                    <Button onClick={handleReserveSelected}>
                        Reserver valgte ({selectedItems.size})
                    </Button>
                )}
            </div>
            <div className="relative">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Navn</TableHead>
                            <TableHead>Gruppe</TableHead>
                            <TableHead>Beskrivelse</TableHead>
                            <TableHead>Alkohol</TableHead>
                            <TableHead className="text-right">Handlinger</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center text-muted-foreground py-8"
                                >
                                    Ingen elementer funnet
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => (
                                <TableRow
                                    key={item.itemId}
                                    className={cn(
                                        'cursor-pointer hover:bg-muted/50',
                                        selectedItems.has(item.itemId) &&
                                            'bg-muted',
                                    )}
                                    onClick={() => {
                                        window.location.href = `/booking/${item.itemId}`;
                                    }}
                                >
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedItems.has(
                                                item.itemId,
                                            )}
                                            onCheckedChange={() =>
                                                handleToggleItem(item.itemId)
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {item.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {item.groupSlug}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <div className="flex items-center gap-3">
                                            {item.imageUrl && (
                                                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt=""
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                            )}
                                            <p className="truncate text-sm text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {item.allowsAlcohol ? (
                                            <Badge variant="secondary">Ja</Badge>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                Nei
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <Link
                                            href={`/booking/${item.itemId}`}
                                        >
                                            <Button variant="outline" size="sm">
                                                Se detaljer
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {(isLoading || isFetching) && (
                    <div className="absolute inset-0 backdrop-blur-sm grid place-items-center">
                        <LoadingSpinner />
                    </div>
                )}
            </div>
            <MultiItemReservationDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                items={selectedItemsData}
                onSuccess={() => {
                    setSelectedItems(new Set());
                    setIsDialogOpen(false);
                }}
            />
        </Card>
    );
}
