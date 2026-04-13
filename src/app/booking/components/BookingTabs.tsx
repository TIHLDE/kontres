'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { GroupInfo } from '@/server/api/routers/groupRouter';

import AllReservationsCalendar from './AllReservationsCalendar';
import BookableItemsView from './BookableItemsView';
import SearchFilters from './SearchFilters';

type Props = {
    groups: GroupInfo[];
};

export default function BookingTabs({ groups }: Props) {
    return (
        <Tabs defaultValue="booking" className="w-full">
            <TabsList>
                <TabsTrigger value="booking">Booking</TabsTrigger>
                <TabsTrigger value="calendar">Kalender</TabsTrigger>
            </TabsList>
            <TabsContent value="booking">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6 w-full min-h-full">
                    <SearchFilters
                        groups={groups}
                        className="max-w-[400px] w-full"
                    />
                    <BookableItemsView groups={groups} className="w-full" />
                </div>
            </TabsContent>
            <TabsContent value="calendar">
                <Card className="p-4">
                    <AllReservationsCalendar />
                </Card>
            </TabsContent>
        </Tabs>
    );
}
