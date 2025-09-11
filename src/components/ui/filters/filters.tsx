import { Button } from '@/components/ui/button';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';

import FilterBadge from './filter-badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ListFilterIcon } from 'lucide-react';
import {
    Dispatch,
    HTMLAttributes,
    ReactNode,
    SetStateAction,
    useEffect,
    useState,
} from 'react';

export type Filter = {
    name: string;
    value: string;
    icon?: ReactNode;
};

export type FilterGroup = {
    header: string;
    value: string;
    filters: Filter[];
};

export type FilterCallbackType = {
    /**
     * The filter that was selected in the menu.
     */
    filter: Filter;
    /**
     * Used to define what filter category this filter belongs to.
     */
    parentValue: string;
};

interface FiltersProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Whether or not to display the filter modal.
     */
    open?: boolean;
    /**
     * Callback to set the open state of the filter modal.
     */
    setOpen?: Dispatch<SetStateAction<boolean>>;
    /**
     * Whether or not to display icons in each filter group header.
     */
    displayGroupIcons?: boolean;
    /**
     * Default values for the filters.
     */
    defaultValues?: FilterCallbackType[];
    /**
     * Object containing icons for each filter group header.
     * The key is the group value and the value is the icon (ReactNode).
     */
    groupIcons?: Record<string, ReactNode>;
    /**
     * Function that is called when a filter is selected.
     */
    onFilterChange?: (value: FilterCallbackType[]) => void;
    /**
     * List of filter groups to display. Each group contains a header and a list of filters.
     */
    filterGroups: FilterGroup[];
}

/**
 * To use this component, you need to pass in a list of filter groups, which contains a header and a list of filters.
 * Remember to define the filters and setFilters props
 *
 * @returns
 */
export default function Filters({
    open,
    setOpen,
    defaultValues,
    filterGroups,
    onFilterChange,
    groupIcons,
    displayGroupIcons = true,
    className,
    ...props
}: FiltersProps) {
    const [filters, setFilters] = useState<FilterCallbackType[]>([]);

    useEffect(() => {
        if (defaultValues) {
            setFilters(defaultValues);
        }
    }, []);

    useEffect(() => {
        console.log(filters);
    }, [filters]);

    // Function for adding a filter if it is not already in the filters list
    const addFilter = (filter: FilterCallbackType) => {
        setFilters((prev) => {
            let updatedFilters;
            if (!isInFilters(filter, prev)) {
                // Add the filter
                updatedFilters = [...prev, filter];
            } else {
                // Remove the filter
                updatedFilters = prev.filter(
                    (f) =>
                        f.filter.value !== filter.filter.value ||
                        f.parentValue !== filter.parentValue,
                );
            }

            // Call the callback with the updated filters
            onFilterChange?.(updatedFilters);

            return updatedFilters;
        });
    };

    // Updated isInFilters to accept the current filters as an argument
    const isInFilters = (
        filter: FilterCallbackType,
        currentFilters = filters,
    ) =>
        currentFilters.some(
            (f) =>
                f.filter.value === filter.filter.value &&
                f.parentValue === filter.parentValue,
        );

    const removeFilter = (filter: FilterCallbackType) => {
        setFilters((prev) => {
            // Remove the filter
            const updatedFilters = prev.filter(
                (f) =>
                    f.filter.value !== filter.filter.value ||
                    f.parentValue !== filter.parentValue,
            );

            // Call the callback with the updated filters
            onFilterChange?.(updatedFilters);

            return updatedFilters;
        });
    };

    return (
        <div
            className={cn('flex gap-2 items-center flex-wrap', className)}
            {...props}
        >
            <div className="flex gap-1 max-w-full flex-wrap items-center">
                {filters?.map((filter, index) => (
                    <motion.div
                        key={filter.filter.value + index}
                        initial={{ opacity: 0, translateX: -10 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        exit={{ opacity: 0, translateX: -10 }}
                        transition={{ duration: 0.2 }}
                        className="items-center flex"
                    >
                        <Button
                            variant={'ghost'}
                            className="p-0 hover:bg-transparent h-fit"
                            onClick={() => {
                                removeFilter(filter);
                            }}
                        >
                            <FilterBadge
                                groupIcon={
                                    displayGroupIcons &&
                                    groupIcons?.[filter.parentValue]
                                }
                                icon={filter.filter.icon}
                                label={filter.filter.name}
                                parent={filter.parentValue}
                            />
                        </Button>
                    </motion.div>
                ))}
            </div>
            <Button
                onClick={() => setOpen?.(true)}
                variant={'ghost'}
                size={'sm'}
                className="gap-2"
            >
                <ListFilterIcon size={16} />
                Filtre
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Søk etter filtre..." />
                <CommandList>
                    <CommandEmpty>Ingen resultater funnet</CommandEmpty>
                    <CommandGroup
                        heading={
                            <div>
                                <p className="flex items-center">
                                    <kbd className="me-2 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                                        Ctrl+K
                                    </kbd>
                                    Åpner også denne menyen!
                                </p>
                            </div>
                        }
                    ></CommandGroup>
                    {filterGroups.map((group, index) => (
                        <CommandGroup
                            heading={
                                <span className="flex items-center gap-2">
                                    {displayGroupIcons &&
                                        groupIcons?.[group.value]}
                                    {group.header}
                                </span>
                            }
                            key={group.header + index}
                        >
                            {group.filters.map((filter, index) => (
                                <CommandItem
                                    className="gap-2"
                                    key={filter.value + index + group.header}
                                    onSelect={() => {
                                        addFilter({
                                            filter,
                                            parentValue: group.value,
                                        });
                                    }}
                                >
                                    {filter.icon}
                                    {filter.name}
                                    {isInFilters({
                                        filter: filter,
                                        parentValue: group.value,
                                    }) ? (
                                        <span className="opacity-50">
                                            (valgt)
                                        </span>
                                    ) : (
                                        ''
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ))}
                </CommandList>
            </CommandDialog>
        </div>
    );
}
