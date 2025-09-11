'use client';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { LoadingSpinner } from '@/components/ui/loadingspinner';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useMemo } from 'react';

export default function BookableItemsSelect({
    field,
    form,
}: {
    field: { value: number[] | undefined };
    form: any;
}) {
    const { data: bookableItems, isLoading } =
        api.bookableItem.getAll.useQuery();

    const selectedItems = useMemo(() => {
        if (!bookableItems) return [];

        return bookableItems.filter((v) =>
            (field.value ?? []).includes(v.itemId),
        );
    }, [field, bookableItems]);

    if (isLoading) return <LoadingSpinner />;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                        'w-full justify-between',
                        !field.value && 'text-muted-foreground',
                    )}
                >
                    {selectedItems.length > 0
                        ? selectedItems.map((v) => v.name).slice(0,3).join(', ')
                        : 'Velg gjenstander'}
                        {selectedItems.length > 3 && " ..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Søk etter gjenstander..." />
                    <CommandList>
                        <CommandEmpty>Ingen gjenstander funnet</CommandEmpty>
                        <CommandGroup>
                            {bookableItems?.map((item) => (
                                <CommandItem
                                    value={item.name.toString()}
                                    key={item.name}
                                    onSelect={() => {
                                        let newItems = field.value ?? [];
                                        let index = newItems.findIndex(
                                            (v: number) => v == item.itemId,
                                        );

                                        if (index != -1) {
                                            newItems.splice(index, 1);
                                        } else {
                                            newItems.push(item.itemId);
                                        }

                                        form.setValue(
                                            'bookableItemIds',
                                            newItems,
                                        );
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            (field.value ?? []).includes(
                                                item.itemId,
                                            )
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                    {item.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
