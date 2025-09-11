import { Skeleton } from '@/components/ui/skeleton';

export default function FAQListSkeleton() {
    return (
        <div className="grid md:grid-cols-3 grid-cols-1 gap-5">
            {new Array(9).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-64" />
            ))}
        </div>
    );
}
