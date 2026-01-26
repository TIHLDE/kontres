'use client';

import { type ReservationWithAuthorAndItem } from '@/server/dtos/reservations';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { ReservationState } from '@prisma/client';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale/nb';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Package,
    Shield,
    Trash2,
    User,
    Wine,
    XCircle,
} from 'lucide-react';

const StatusConfig = {
    [ReservationState.APPROVED]: {
        label: 'Godkjent',
        icon: CheckCircle2,
        className: 'bg-green-100 text-green-800 border-green-200',
        iconColor: 'text-green-600',
    },
    [ReservationState.PENDING]: {
        label: 'Avventer',
        icon: AlertCircle,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        iconColor: 'text-yellow-600',
    },
    [ReservationState.REJECTED]: {
        label: 'Avvist',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200',
        iconColor: 'text-red-600',
    },
};

interface ReservationCardProps {
    reservation: ReservationWithAuthorAndItem;
    onUpdate?: () => void;
}

export default function ReservationCard({
    reservation,
    onUpdate,
}: ReservationCardProps) {
    const utils = api.useUtils();
    const statusConfig = StatusConfig[reservation.status];
    const StatusIcon = statusConfig.icon;

    const updateStatus = api.reservation.updateStatus.useMutation({
        onSuccess: () => {
            toast({
                title: 'Status oppdatert',
                description: 'Reservasjonsstatusen er oppdatert.',
            });
            utils.reservation.getReservations.invalidate();
            onUpdate?.();
        },
        onError: (error) => {
            toast({
                title: 'Feil',
                description: error.message || 'Kunne ikke oppdatere statusen.',
                variant: 'destructive',
            });
        },
    });

    const deleteReservation = api.reservation.delete.useMutation({
        onSuccess: () => {
            toast({
                title: 'Reservasjon slettet',
                description: 'Reservasjonen har blitt slettet.',
            });
            utils.reservation.getReservations.invalidate();
            onUpdate?.();
        },
        onError: (error) => {
            toast({
                title: 'Feil',
                description:
                    error.message || 'Kunne ikke slette reservasjonen.',
                variant: 'destructive',
            });
        },
    });

    const handleStatusChange = (status: ReservationState) => {
        updateStatus.mutate({
            groupSlug: reservation.groupSlug,
            reservationId: reservation.reservationId,
            status,
        });
    };

    const handleDelete = () => {
        if (confirm('Er du sikker på at du vil slette denne reservasjonen?')) {
            deleteReservation.mutate({
                groupSlug: reservation.groupSlug,
                reservationId: reservation.reservationId,
            });
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Package className="h-6 w-6" />
                            {reservation.bookableItem?.name ||
                                'Ukjent gjenstand'}
                        </CardTitle>
                        <CardDescription>
                            Reservasjons-ID: #{reservation.reservationId}
                        </CardDescription>
                    </div>
                    <Badge
                        variant="outline"
                        className={cn('gap-1.5', statusConfig.className)}
                    >
                        <StatusIcon className="h-4 w-4" />
                        {statusConfig.label}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Author Information */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <User className="h-4 w-4" />
                        Bruker
                    </div>
                    <div className="pl-6 space-y-1">
                        <p className="font-medium">
                            {reservation.author?.first_name}{' '}
                            {reservation.author?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {reservation.author?.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Bruker-ID: {reservation.authorId}
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Date and Time Information */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Tidsperiode
                    </div>
                    <div className="pl-6 space-y-2">
                        <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Start</p>
                                <p className="text-sm">
                                    {format(
                                        new Date(reservation.startTime),
                                        "EEEE d. MMMM yyyy 'kl.' HH:mm",
                                        { locale: nb },
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Slutt</p>
                                <p className="text-sm">
                                    {format(
                                        new Date(reservation.endTime),
                                        "EEEE d. MMMM yyyy 'kl.' HH:mm",
                                        { locale: nb },
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Description */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        Beskrivelse
                    </div>
                    <p className="pl-6 text-sm whitespace-pre-wrap">
                        {reservation.description}
                    </p>
                </div>

                <Separator />

                {/* Additional Information */}
                <div className="space-y-3">
                    <div className="text-sm font-semibold text-muted-foreground">
                        Tilleggsinformasjon
                    </div>
                    <div className="pl-6 space-y-2">
                        {/* Alcohol Information */}
                        <div className="flex items-center gap-2">
                            <Wine
                                className={cn(
                                    'h-4 w-4',
                                    reservation.servesAlcohol
                                        ? 'text-orange-600'
                                        : 'text-muted-foreground',
                                )}
                            />
                            <span className="text-sm">
                                Serverer alkohol:{' '}
                                <span
                                    className={cn(
                                        'font-medium',
                                        reservation.servesAlcohol
                                            ? 'text-orange-600'
                                            : '',
                                    )}
                                >
                                    {reservation.servesAlcohol ? 'Ja' : 'Nei'}
                                </span>
                            </span>
                        </div>

                        {/* Sober Watch */}
                        {reservation.servesAlcohol &&
                            reservation.soberWatch && (
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm">
                                        Edru vakt:{' '}
                                        <span className="font-medium">
                                            {reservation.soberWatch}
                                        </span>
                                    </span>
                                </div>
                            )}

                        {/* Rules Accepted */}
                        <div className="flex items-center gap-2">
                            <CheckCircle2
                                className={cn(
                                    'h-4 w-4',
                                    reservation.acceptedRules
                                        ? 'text-green-600'
                                        : 'text-red-600',
                                )}
                            />
                            <span className="text-sm">
                                Regler akseptert:{' '}
                                <span className="font-medium">
                                    {reservation.acceptedRules ? 'Ja' : 'Nei'}
                                </span>
                            </span>
                        </div>

                        {/* Group */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm">
                                Gruppe:{' '}
                                <span className="font-medium">
                                    {reservation.groupSlug}
                                </span>
                            </span>
                        </div>

                        {/* Approved By */}
                        {reservation.approvedById && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm">
                                    Godkjent av:{' '}
                                    <span className="font-medium">
                                        {reservation.approvedById}
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2 flex-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            handleStatusChange(ReservationState.APPROVED)
                        }
                        disabled={
                            updateStatus.isPending ||
                            reservation.status === ReservationState.APPROVED
                        }
                        className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                    >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Godkjenn
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            handleStatusChange(ReservationState.PENDING)
                        }
                        disabled={
                            updateStatus.isPending ||
                            reservation.status === ReservationState.PENDING
                        }
                        className="flex-1 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                    >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Avventer
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            handleStatusChange(ReservationState.REJECTED)
                        }
                        disabled={
                            updateStatus.isPending ||
                            reservation.status === ReservationState.REJECTED
                        }
                        className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                    >
                        <XCircle className="h-4 w-4 mr-1" />
                        Avvis
                    </Button>
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleteReservation.isPending}
                    className="sm:w-auto w-full"
                >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Slett
                </Button>
            </CardFooter>
        </Card>
    );
}
