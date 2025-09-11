import StatusIndicator from '@/components/ui/filters/status-indicator';

import { TimeDirection } from '@/app/admin/utils/enums';
import { ReservationState } from '@prisma/client';
import {
    AlertCircleIcon,
    ClockIcon,
    ShapesIcon,
    UsersIcon,
} from 'lucide-react';
import { ReactNode } from 'react';

export const TimeDirectionMap: Record<TimeDirection, string> = {
    BACKWARD: 'Utløpt',
    FORWARD: 'Kommende',
    PRESENT: 'Pågående',
};

export const StateMap: Record<ReservationState, string> = {
    APPROVED: 'Godkjent',
    PENDING: 'Avventer',
    REJECTED: 'Avslått',
};

export const StateIconMap: Record<ReservationState, ReactNode> = {
    APPROVED: <StatusIndicator variant={'approved'} />,
    PENDING: <StatusIndicator variant={'pending'} />,
    REJECTED: <StatusIndicator variant={'rejected'} />,
};

export const TimeDirectionIconMap: Record<TimeDirection, ReactNode> = {
    BACKWARD: <StatusIndicator variant={'rejected'} />,
    FORWARD: <StatusIndicator variant={'approved'} />,
    PRESENT: <StatusIndicator variant={'pending'} />,
};

// Object containing filterLists group values as keys, and an icon as value
export const GroupIcons: Record<FilterGroups, ReactNode> = {
    group: <UsersIcon size={12} />,
    status: <AlertCircleIcon size={12} />,
    item: <ShapesIcon size={12} />,
    time: <ClockIcon size={12} />,
};

export enum FilterGroups {
    GROUP = 'group',
    STATUS = 'status',
    ITEM = 'item',
    TIME = 'time',
}
