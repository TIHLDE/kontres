import { AppRouter } from '@/server/api/root';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import ItemForm from './item-form';
import { api } from '@/trpc/react';
import { inferProcedureOutput } from '@trpc/server';
import { PlusIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';

type GetItemsOutput = inferProcedureOutput<
    AppRouter['item']['getItems']
>['items'][0];

type ItemDialogProps = {
    item?: GetItemsOutput;
} & (
    | {
          enableTrigger: true;
          label: string;
      }
    | {
          enableTrigger: false;
          open?: boolean;
          setOpen?: Dispatch<SetStateAction<boolean>>;
      }
);

export default function ItemDialog({
    item,
    enableTrigger = true,
    ...props
}: ItemDialogProps) {
    const { mutate, isPending } = api.item.createItem.useMutation();
    const [internalOpen, internalSetOpen] = useState(false);
    const utils = api.useUtils();

    const action = !!item ? 'edit' : 'create';

    const onSubmit = (values: {
        name: string;
        groupSlug: string;
        description: string;
        allowsAlcohol: boolean;
    }) => {
        mutate(
            {
                name: values.name,
                description: values.description,
                allowsAlcohol: values.allowsAlcohol,
                groupSlug: values.groupSlug,
            },
            {
                onSuccess: () => {
                    // Invalidate existing items
                    utils.item.invalidate();

                    // Close the dialog
                    internalSetOpen(false);
                },
            },
        );
    };

    const open = useMemo(() => {
        if (!enableTrigger && 'open' in props) {
            return props.open;
        }
        return internalOpen;
    }, [enableTrigger, internalOpen, props]);

    const setOpen = useMemo(() => {
        if (!enableTrigger && 'setOpen' in props) {
            return props.setOpen;
        }
        return internalSetOpen;
    }, [enableTrigger, internalSetOpen, props]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {enableTrigger && (
                <DialogTrigger asChild>
                    <Button size={'sm'} variant={'outline'} className="gap-2.5">
                        <PlusIcon size={20} />
                        {'label' in props ? props.label : ''}
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {action == 'create'
                            ? 'Legg til ny gjenstand'
                            : 'Rediger gjenstand'}
                    </DialogTitle>
                    <DialogDescription>
                        {action == 'create'
                            ? 'Opprett en gjenstand som kan reserveres av alle TIHLDEs medlemmer'
                            : 'Når endringene lagres oppdateres de umiddelbart for alle brukere'}
                    </DialogDescription>
                </DialogHeader>

                <ItemForm
                    defaultValues={{
                        name: item?.name ?? '',
                        description: item?.description ?? '',
                        group: item?.groupSlug ?? '',
                    }}
                    formAction={action}
                    onSubmit={(values) =>
                        onSubmit({
                            ...values,
                            groupSlug: values.group,
                            allowsAlcohol: false,
                        })
                    }
                    isSubmitting={isPending}
                />
            </DialogContent>
        </Dialog>
    );
}
