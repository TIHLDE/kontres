import { type ReservationWithAuthorAndItem } from '@/server/dtos/reservations';

import { DataTable } from '../../../../components/ui/data-table';
import { columns } from './columns';

interface BookingListProps {
    items: ReservationWithAuthorAndItem[];
}

export default function BookingList({ items }: BookingListProps) {
    return (
        <DataTable
            columns={columns}
            data={items}
            displayPageNavigation={false}
        />
    );
}
