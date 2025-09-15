'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { api } from '@/trpc/react';
import { CalendarIcon } from 'lucide-react';
import { useMemo } from 'react';
import { isSameDay, isWithinInterval } from 'date-fns';

interface ItemCalendarProps {
    itemId: number;
}

export default function ItemCalendar({ itemId }: ItemCalendarProps) {
    const { data: reservations } = api.reservation.getReservationsByBookableItemId.useQuery({
        bookableItemId: itemId,
    });

    // Create disabled dates based on reservations
    const disabledDates = useMemo(() => {
        if (!reservations?.reservations) return [];
        
        return reservations.reservations.map((reservation) => ({
            from: new Date(reservation.startTime),
            to: new Date(reservation.endTime),
        }));
    }, [reservations]);

    // Custom day renderer to show reservation status
    const modifiers = useMemo(() => {
        if (!reservations?.reservations) return {};
        
        const reservedDates: Date[] = [];
        const today = new Date();
        
        reservations.reservations.forEach((reservation) => {
            const start = new Date(reservation.startTime);
            const end = new Date(reservation.endTime);
            
            // Add all dates in the reservation range
            const current = new Date(start);
            while (current <= end) {
                if (current >= today) {
                    reservedDates.push(new Date(current));
                }
                current.setDate(current.getDate() + 1);
            }
        });
        
        return {
            reserved: reservedDates,
        };
    }, [reservations]);

    const modifiersClassNames = {
        reserved: 'bg-red-100 text-red-800 hover:bg-red-200',
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Availability Calendar
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Calendar
                        mode="single"
                        className="rounded-md border"
                        modifiers={modifiers}
                        modifiersClassNames={modifiersClassNames}
                        disabled={(date) => {
                            // Disable past dates
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (date < today) return true;
                            
                            // Disable dates with reservations
                            return disabledDates.some((range) =>
                                isWithinInterval(date, range)
                            );
                        }}
                    />
                    
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                            <span>Reserved</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                            <span>Available</span>
                        </div>
                    </div>
                    
                    {reservations && reservations.reservations.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-medium mb-2">Upcoming Reservations</h4>
                            <div className="space-y-2">
                                {reservations.reservations
                                    .filter((reservation) => new Date(reservation.startTime) >= new Date())
                                    .slice(0, 3)
                                    .map((reservation, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <span>
                                                {new Date(reservation.startTime).toLocaleDateString('nb-NO')}
                                            </span>
                                            <Badge variant="secondary" className="text-xs">
                                                {new Date(reservation.startTime).toLocaleTimeString('nb-NO', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })} - {new Date(reservation.endTime).toLocaleTimeString('nb-NO', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Badge>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
