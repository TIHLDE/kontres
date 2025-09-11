import { FilterGroup } from '@/components/ui/filters/filters';
import StatusIndicator from '@/components/ui/filters/status-indicator';

import { TimeDirection } from '../../../utils/enums';
import { FilterGroups } from './value-maps';
import { BookableItem, Group, ReservationState } from '@prisma/client';

export default function reservationFilterGroups({
    groups,
    items,
}: {
    groups: Group[];
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
                    name: group.name,
                    value: group.groupId.toString(),
                };
            }),
        },
    ];
}
