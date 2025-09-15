import { Button } from '@/components/ui/button';

import ItemCalendar from '../components/ItemCalendar';
import ItemDetails from '../components/ItemDetails';
import ItemFAQs from '../components/ItemFAQs';
import ReservationForm from '../components/ReservationForm';
import { api } from '@/trpc/server';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
    params: { itemId: string };
}

export default async function Page({ params }: PageProps) {
    const itemId = parseInt(params.itemId);

    if (isNaN(itemId)) {
        notFound();
    }

    let item;
    try {
        item = await api.bookableItem.getById({ itemId });
    } catch (error) {
        notFound();
    }

    return (
        <div className="container max-w-page space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/booking">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Booking
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-semibold">{item.name}</h1>
                    <p className="text-sm text-muted-foreground">
                        Book this item for your event or activity
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Item Details and Calendar */}
                <div className="lg:col-span-2 space-y-6">
                    <ItemDetails
                        name={item.name}
                        description={item.description}
                        allowsAlcohol={item.allowsAlcohol}
                        groupSlug={item.groupSlug}
                    />

                    <ItemCalendar itemId={item.itemId} />
                </div>

                {/* Right Column - Reservation Form */}
                <div className="space-y-6">
                    <ReservationForm
                        itemId={item.itemId}
                        groupSlug={item.groupSlug}
                        allowsAlcohol={item.allowsAlcohol}
                    />
                </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-6">
                <ItemFAQs itemId={item.itemId} />
            </div>
        </div>
    );
}
