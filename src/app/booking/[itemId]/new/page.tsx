'use client';

import ReservationForm from './ReservationForm';
import { useParams } from 'next/navigation';
import { api } from '@/trpc/react';

export default function NewBookingPage() {
    const params = useParams();
    const itemId = parseInt(params.itemId as string, 10);
    
    const { data: item } = api.bookableItem.getById.useQuery({ itemId });
    
    return (
        <ReservationForm 
            itemId={itemId} 
            itemName={item?.name}
            allowsAlcohol={item?.allowsAlcohol ?? false}
        />
    );
}
