import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

interface StatusIndicatorProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof StatusIndicatorVariants> {}

const StatusIndicatorVariants = cva('h-3 w-3 rounded-full', {
    variants: {
        variant: {
            approved: 'bg-green-500',
            pending: 'bg-yellow-500',
            rejected: 'bg-red-500',
        },
    },
});
export default function StatusIndicator({
    variant,
    className,
    ...props
}: StatusIndicatorProps) {
    return (
        <div className={cn(StatusIndicatorVariants({ variant }), className)} />
    );
}
