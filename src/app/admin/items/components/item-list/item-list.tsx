'use client';

import { AppRouter } from '@/server/api/root';

import { DataTable } from '@/components/ui/data-table';

import { itemColumns } from './item-columns';
import { inferProcedureOutput } from '@trpc/server';
import { useRouter } from 'next/navigation';

type GetItemsOutput = inferProcedureOutput<
    AppRouter['item']['getItems']
>['items'][0];

interface ItemListProps {
    items: GetItemsOutput[];
}

export default function ItemList({ items }: ItemListProps) {
    const router = useRouter();

    const handleRowClick = (item: GetItemsOutput) => {
        router.push(`/booking/${item.itemId}`);
    };

    //NOE ER FEIL MED PAGINATION; FIKS DET
    return (
        <DataTable
            columns={itemColumns}
            data={items}
            displayPageNavigation={false}
        />
    );
}
