import type { GroupInfo } from '@/server/api/routers/groupRouter';

import { FilterGroup } from '@/components/ui/filters/filters';

import { FilterGroups } from '@/app/admin/components/booking-filters/value-maps';
import { BookableItem } from '@prisma/client';
import {
    AlertCircleIcon,
    ClockIcon,
    ShapesIcon,
    UsersIcon,
} from 'lucide-react';
import { ReactNode } from 'react';

export default function itemFilterGroups({
    groups,
    items,
}: {
    groups: GroupInfo[];
    items: BookableItem[];
}): FilterGroup[] {
    return [
        {
            header: 'Gruppe',
            value: FilterGroups.GROUP,
            filters: groups.map((group) => ({
                name: group.groupName,
                value: group.groupSlug,
            })),
        },
        {
            header: 'Gjenstand',
            value: FilterGroups.ITEM,
            filters: items.map((item) => ({
                name: item.name,
                value: item.itemId.toString(),
            })),
        },
    ];
}

// Object containing filterLists group values as keys, and an icon as value
export const GroupIcons: Record<string, ReactNode> = {
    group: <UsersIcon size={12} />,
    status: <AlertCircleIcon size={12} />,
    item: <ShapesIcon size={12} />,
    time: <ClockIcon size={12} />,
};
