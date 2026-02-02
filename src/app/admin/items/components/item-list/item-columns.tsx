import { AppRouter } from '@/server/api/root';

import ItemActions from '@/app/admin/items/components/item-list/item-actions';
import { type ColumnDef } from '@tanstack/react-table';
import { inferProcedureOutput } from '@trpc/server';

type GetItemsOutput = inferProcedureOutput<AppRouter['item']['getItems']>;

export const itemColumns: ColumnDef<GetItemsOutput['items'][0], unknown>[] = [
    {
        accessorKey: 'name',
        header: 'Gjenstand',
    },
    {
        accessorKey: 'description',
        header: 'Beskrivelse',
    },
    {
        accessorKey: 'groupSlug',
        header: 'Gruppe',
        accessorFn: ({ groupSlug }) => groupSlug,
    },
    {
        id: 'actions',
        header: '',
        enableHiding: false,
        cell: ({ row }) => <ItemActions item={row.original} />,
    },
];
