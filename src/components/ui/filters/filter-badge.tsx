import { Badge, BadgeProps } from '@/components/ui/badge';

interface FilterBadeProps extends BadgeProps {
    label: string;
    icon: React.ReactNode;
    groupIcon?: React.ReactNode;
    parent: string;
}
export default function FilterBadge({
    label,
    icon,
    groupIcon,
    parent,
    ...props
}: FilterBadeProps) {
    return (
        <Badge className="rounded-md gap-1 items-center" variant={'outline'}>
            {groupIcon}
            {icon}
            {label}
        </Badge>
    );
}
