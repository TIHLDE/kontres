import { LoadingSpinner } from '@/components/ui/loadingspinner';

export default function Loading() {
    return (
        <div className="max-w-page mx-auto h-screen -mt-24 flex flex-col justify-center items-center gap-5">
            <LoadingSpinner className="m-auto size-16" />
        </div>
    );
}
