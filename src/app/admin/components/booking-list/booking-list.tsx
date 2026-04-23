import { type ReservationWithAuthorAndItem } from '@/server/dtos/reservations';
import { type GroupInfo } from '@/server/api/routers/groupRouter';

import { DataTable } from '../../../../components/ui/data-table';
import { getColumns } from './columns';

interface BookingListProps {
    items: ReservationWithAuthorAndItem[];
    groups: GroupInfo[];
}

export default function BookingList({ items, groups }: BookingListProps) {
    return (
        <DataTable
            columns={getColumns(groups)}
            data={items}
            initialSorting={[{ id: 'status', desc: false }]}
            pageSize={30}
        />
    );
}
