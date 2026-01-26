import type { GroupInfo } from '@/server/api/routers/groupRouter';

import { FilterGroup } from '@/components/ui/filters/filters';
import StatusIndicator from '@/components/ui/filters/status-indicator';

import { FilterGroups } from './value-maps';
import { TimeDirection } from '@/app/admin/utils/enums';
import { BookableItem, ReservationState } from '@prisma/client';

export default function reservationFilterGroups({
    groups,
    items,
}: {
    groups: GroupInfo[];
    items: BookableItem[];
}): FilterGroup[] {
    return [
        {
            header: 'Tidsrom',
            value: FilterGroups.TIME,
            filters: [
                {
                    icon: <StatusIndicator variant={'approved'} />,
                    name: 'Kommende',
                    value: TimeDirection.FORWARD,
                },

                {
                    icon: <StatusIndicator variant={'rejected'} />,
                    name: 'Utløpt',
                    value: TimeDirection.BACKWARD,
                },
            ],
        },
        {
            header: 'Status',
            value: FilterGroups.STATUS,
            filters: [
                {
                    icon: <StatusIndicator variant={'approved'} />,
                    name: 'Godkjent',
                    value: ReservationState.APPROVED,
                },
                {
                    icon: <StatusIndicator variant={'pending'} />,
                    name: 'Avventer',
                    value: ReservationState.PENDING,
                },
                {
                    icon: <StatusIndicator variant={'rejected'} />,
                    name: 'Avslått',
                    value: ReservationState.REJECTED,
                },
            ],
        },
        {
            header: 'Gjenstand',
            value: FilterGroups.ITEM,
            filters: items.map((item) => {
                return {
                    name: item.name,
                    value: item.itemId.toString(),
                };
            }),
        },
        {
            header: 'Gruppe',
            value: FilterGroups.GROUP,
            filters: groups.map((group) => {
                return {
                    name: group.groupName,
                    value: group.groupSlug,
                };
            }),
        },
    ];
}
