import { AppRouter } from '@/server/api/root';

import ItemActions from '@/app/admin/items/components/item-list/item-actions';
import { type ColumnDef } from '@tanstack/react-table';
import { inferProcedureOutput } from '@trpc/server';
import Image from 'next/image';

type GetItemsOutput = inferProcedureOutput<AppRouter['item']['getItems']>;

export const itemColumns: ColumnDef<GetItemsOutput['items'][0], unknown>[] = [
    {
        accessorKey: 'imageUrl',
        header: 'Bilde',
        cell: ({ row }) => {
            const imageUrl = row.original.imageUrl;
            return imageUrl && imageUrl !== '' ? (
                <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                        src={imageUrl}
                        alt={row.original.name}
                        fill
                        className="object-cover rounded"
                    />
                </div>
            ) : (
                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">N/A</span>
                </div>
            );
        },
    },
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
