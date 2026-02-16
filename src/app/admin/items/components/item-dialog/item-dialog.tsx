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
import { useToast } from '@/components/ui/use-toast';
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
    const { toast } = useToast();
    const { mutate: createItem, isPending: isCreatePending } =
        api.item.createItem.useMutation();
    const { mutate: updateItem, isPending: isUpdatePending } =
        api.item.updateItem.useMutation();
    const [internalOpen, internalSetOpen] = useState(false);
    const utils = api.useUtils();

    const action = !!item ? 'edit' : 'create';
    const isPending = isCreatePending || isUpdatePending;

    const onSuccess = () => {
        utils.item.invalidate();
        internalSetOpen(false);
        toast({
            title: item ? 'Gjenstand oppdatert' : 'Gjenstand opprettet',
            description: item
                ? 'Endringene er lagret.'
                : 'Den nye gjenstanden er lagt til.',
        });
    };

    const onError = (err: { message: string }) => {
        toast({
            title: item ? 'Kunne ikke oppdatere' : 'Kunne ikke opprette',
            description: err.message,
            variant: 'destructive',
        });
    };

    const onSubmit = (values: {
        name: string;
        groupSlug: string;
        description: string;
        allowsAlcohol: boolean;
        imageUrl?: string;
    }) => {
        if (item) {
            updateItem(
                {
                    itemId: item.itemId,
                    groupSlug: values.groupSlug,
                    data: {
                        name: values.name,
                        description: values.description,
                        allowsAlcohol: values.allowsAlcohol,
                        imageUrl: values.imageUrl,
                    },
                },
                { onSuccess, onError },
            );
        } else {
            createItem(
                {
                    name: values.name,
                    description: values.description,
                    allowsAlcohol: values.allowsAlcohol,
                    groupSlug: values.groupSlug,
                    imageUrl: values.imageUrl,
                },
                { onSuccess, onError },
            );
        }
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
                    key={item?.itemId ?? 'new'}
                    defaultValues={{
                        name: item?.name ?? '',
                        description: item?.description ?? '',
                        group: item?.groupSlug ?? '',
                        allowsAlcohol: item?.allowsAlcohol ?? false,
                    }}
                    existingImageUrl={
                        item && 'imageUrl' in item
                            ? (item as { imageUrl?: string | null }).imageUrl
                            : undefined
                    }
                    formAction={action}
                    onCancel={() => setOpen?.(false)}
                    onSubmit={(values) =>
                        onSubmit({
                            ...values,
                            groupSlug: values.group,
                            imageUrl: values.imageUrl,
                        })
                    }
                    isSubmitting={isPending}
                />
            </DialogContent>
        </Dialog>
    );
}
