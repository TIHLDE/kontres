import { Button } from '@/components/ui/button';

import ItemCalendar from '../components/ItemCalendar';
import ItemDetails from '../components/ItemDetails';
import ItemFAQs from '../components/ItemFAQs';
import { api } from '@/trpc/server';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ itemId: string }>;
}

export default async function Page(props: PageProps) {
    const params = await props.params;
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
            <div className="flex flex-col gap-4">
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

            {/* Item Details and Calendar */}
            <div className="lg:col-span-2 space-y-6">
                <ItemDetails
                    itemId={item.itemId}
                    name={item.name}
                    description={item.description}
                    allowsAlcohol={item.allowsAlcohol}
                    groupSlug={item.groupSlug}
                />

                <ItemCalendar itemId={item.itemId} />
            </div>
            {/* FAQ Section */}
            <div className="space-y-6">
                <ItemFAQs itemId={item.itemId} />
            </div>
        </div>
    );
}
