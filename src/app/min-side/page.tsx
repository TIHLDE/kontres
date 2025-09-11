import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';

import { reservationColumns } from './components/reservation-columns';
import { auth } from '@/auth';
import { api } from '@/trpc/server';
import { redirect } from 'next/navigation';

const Page = async () => {
    const session = await auth();
    if (!session) redirect('/login');
    const reservations = await api.reservation.getUserReservations({
        userId: session.user.id,
    });
    return (
        <div className="max-w-page mx-auto flex flex-col place-content-center">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Min side</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={reservationColumns}
                        data={reservations}
                        search
                        filterProperty="description"
                        searchPlaceholder="Søk etter navn..."
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default Page;
