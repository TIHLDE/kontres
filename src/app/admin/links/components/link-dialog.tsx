import { AppRouter } from '@/server/api/root';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import LinkForm from './link-form';
import { api } from '@/trpc/react';
import { inferProcedureOutput } from '@trpc/server';
import { PlusIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';

type GetLinksOutput = inferProcedureOutput<AppRouter['link']['getLinks']>[0];

type LinkDialogProps = {
    link?: GetLinksOutput;
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

export default function LinkDialog({
    link,
    enableTrigger = true,
    ...props
}: LinkDialogProps) {
    const createMutation = api.link.createLink.useMutation();
    const updateMutation = api.link.updateLink.useMutation();
    const [internalOpen, internalSetOpen] = useState(false);
    const utils = api.useUtils();

    const action = !!link ? 'edit' : 'create';
    const isPending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (values: {
        title: string;
        url: string;
        description?: string;
    }) => {
        if (action === 'edit' && link) {
            updateMutation.mutate(
                {
                    linkId: link.linkId,
                    ...values,
                },
                {
                    onSuccess: () => {
                        utils.link.invalidate();
                        internalSetOpen(false);
                    },
                },
            );
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    utils.link.invalidate();
                    internalSetOpen(false);
                },
            });
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
                        {action === 'create'
                            ? 'Legg til ny lenke'
                            : 'Rediger lenke'}
                    </DialogTitle>
                    <DialogDescription>
                        {action === 'create'
                            ? 'Opprett en lenke som vises for alle brukere, f.eks. til wiki for kamerabestilling'
                            : 'Når endringene lagres oppdateres de umiddelbart for alle brukere'}
                    </DialogDescription>
                </DialogHeader>

                <LinkForm
                    defaultValues={{
                        title: link?.title ?? '',
                        url: link?.url ?? '',
                        description: link?.description ?? '',
                    }}
                    formAction={action}
                    onSubmit={onSubmit}
                    onCancel={() => setOpen?.(false)}
                    isSubmitting={isPending}
                />
            </DialogContent>
        </Dialog>
    );
}
