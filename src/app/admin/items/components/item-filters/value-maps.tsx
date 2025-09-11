import { FilterGroups } from '@/app/admin/reservations/components/booking-filters/value-maps';
import {
    AlertCircleIcon,
    ClockIcon,
    ShapesIcon,
    UsersIcon,
} from 'lucide-react';
import { ReactNode } from 'react';

// Object containing filterLists group values as keys, and an icon as value
export const GroupIcons: Record<FilterGroups, ReactNode> = {
    group: <UsersIcon size={12} />,
    status: <AlertCircleIcon size={12} />,
    item: <ShapesIcon size={12} />,
    time: <ClockIcon size={12} />,
};
