import BookableItemsView from './components/BookableItemsView';
import SearchFilters from './components/SearchFilters';
import { api } from '@/trpc/server';

export default async function Page() {
    const groups = (await api.group.getAll()).map(
        (g: { groupSlug: string; groupName: string; type: string }) =>
            [g.groupSlug, g.groupName] as [string, string],
    );

    return (
        <div className="container max-w-page">
            <h1 className="text-3xl font-semibold">Booking</h1>
            <p className="text-sm text-muted-foreground mb-5">
                Bla gjennom det TIHLDE har å tilby av kontor og utstyr
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SearchFilters groups={groups} />
                <BookableItemsView className="lg:col-span-3" />
            </div>
        </div>
    );
}
