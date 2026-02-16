'use client';

import { AppRouter } from '@/server/api/root';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import ItemDialog from '../item-dialog/item-dialog';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/trpc/react';
import { inferProcedureOutput } from '@trpc/server';
import {
    CornerUpRightIcon,
    MoreHorizontal,
    PencilIcon,
    TrashIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type GetItemsOutput = inferProcedureOutput<
    AppRouter['item']['getItems']
>['items'][0];

const ItemActions = ({ item }: { item: GetItemsOutput }) => {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { mutate: deleteItem, isPending: isDeleting } =
        api.item.deleteItem.useMutation();
    const queryUtils = api.useUtils();

    const onDelete = () => {
        deleteItem(
            {
                groupSlug: item.groupSlug,
                itemId: item.itemId,
            },
            {
                onSuccess: () => {
                    setDeleteOpen(false);
                    queryUtils.item.invalidate();
                    toast({
                        title: 'Gjenstand slettet',
                        description: `${item.name} er fjernet.`,
                    });
                },
                onError: (err) => {
                    toast({
                        title: 'Kunne ikke slette',
                        description: err.message,
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    return (
        <div className="flex gap-3 justify-end place-content-center">
            {/* Item row dropdown menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={'ghost'} className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="sr-only">Vis flere handlinger</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        onClick={(e) => {
                            setEditOpen(!editOpen);
                        }}
                        className="gap-2"
                    >
                        <PencilIcon size={14} />
                        Rediger
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(e) => {
                            router.push(`/booking/${item.itemId}`);
                        }}
                        className="gap-2"
                    >
                        <CornerUpRightIcon size={14} />
                        Gå til gjenstand
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setDeleteOpen(true)}
                        className="gap-2 text-destructive focus:text-destructive"
                    >
                        <TrashIcon size={14} />
                        Slett
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit item dialog */}
            <ItemDialog
                enableTrigger={false}
                item={item}
                open={editOpen}
                setOpen={setEditOpen}
            />
            {/* Delete item dialog */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Det du er i ferd med å gjøre kan ikke angres. Er du
                            helt sikker?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Avbryt
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={onDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Sletter…' : 'Slett'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ItemActions;
