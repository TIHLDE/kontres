import { Skeleton } from '../skeleton';

const FilterSkeleton = () => {
    return (
        <div className="flex gap-2 items-center">
            <Skeleton className="w-20 h-5" />
            <Skeleton className="w-20 h-5" />
            <Skeleton className="w-20 h-5" />
        </div>
    );
};

export default FilterSkeleton;
