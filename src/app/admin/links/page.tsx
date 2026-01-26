'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loadingspinner';

import LinkDialog from './components/link-dialog';
import { api } from '@/trpc/react';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function LinksPage() {
    const { data: links, isLoading } = api.link.getLinks.useQuery();
    const deleteMutation = api.link.deleteLink.useMutation();
    const utils = api.useUtils();
    const [editingLink, setEditingLink] = useState<number | null>(null);

    const handleDelete = (linkId: number) => {
        deleteMutation.mutate(
            { linkId },
            {
                onSuccess: () => {
                    utils.link.invalidate();
                },
            },
        );
    };

    return (
        <>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Lenker</CardTitle>
                        <CardDescription className="mt-2">
                            Administrer lenker som vises for brukere, f.eks. til
                            wiki for kamerabestilling
                        </CardDescription>
                    </div>
                    <LinkDialog enableTrigger label="Ny lenke" />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <LoadingSpinner />
                    </div>
                ) : links && links.length > 0 ? (
                    <div className="space-y-3">
                        {links.map((link) => (
                            <Card key={link.linkId}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">
                                                    {link.title}
                                                </h3>
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>
                                            </div>
                                            <p className="text-sm text-muted-foreground break-all mt-1">
                                                {link.url}
                                            </p>
                                            {link.description && (
                                                <p className="text-sm mt-2">
                                                    {link.description}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Opprettet:{' '}
                                                {new Date(
                                                    link.createdAt,
                                                ).toLocaleDateString('nb-NO', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <LinkDialog
                                                link={link}
                                                enableTrigger={false}
                                                open={
                                                    editingLink === link.linkId
                                                }
                                                setOpen={(open) =>
                                                    setEditingLink(
                                                        open
                                                            ? link.linkId
                                                            : null,
                                                    )
                                                }
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    setEditingLink(link.linkId)
                                                }
                                            >
                                                <Pencil size={16} />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Er du sikker?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Dette vil permanent
                                                            slette lenken "
                                                            {link.title}". Denne
                                                            handlingen kan ikke
                                                            angres.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            Avbryt
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                handleDelete(
                                                                    link.linkId,
                                                                )
                                                            }
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Slett
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Ingen lenker lagt til ennå.</p>
                        <p className="text-sm mt-1">
                            Klikk på "Ny lenke" for å legge til en lenke.
                        </p>
                    </div>
                )}
            </CardContent>
        </>
    );
}
