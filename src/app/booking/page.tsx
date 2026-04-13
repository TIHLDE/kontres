import BookingTabs from './components/BookingTabs';
import { api } from '@/trpc/server';

export default async function Page() {
    const groups = await api.group.getAll();

    return (
        <div className="max-w-screen-2xl w-full px-12 mx-auto">
            <h1 className="text-5xl font-semibold mb-2">Booking</h1>
            <p className="text-sm text-muted-foreground mb-5">
                Bla gjennom det TIHLDE har å tilby av kontor og utstyr
            </p>
            <BookingTabs groups={groups} />
        </div>
    );
}
