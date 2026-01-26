'use client';

import ReservationForm from './ReservationForm';
import { useParams } from 'next/navigation';

export default function NewBookingPage() {
    const params = useParams();
    const itemId = parseInt(params.itemId as string, 10);

    return <ReservationForm itemId={itemId} />;
}
