'use client';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { cn } from '@/lib/utils';
import { SelectProps } from '@radix-ui/react-select';

type InputGroup = {
    value: string;
    label: string;
};

interface GroupSelectProps extends SelectProps {
    onChange: (value: string) => void;
    value?: string;
    groups?: InputGroup[];
    className?: string;
}
export default function GroupSelect({
    groups,
    onChange,
    className,
    value,
    ...props
}: GroupSelectProps) {
    return (
        <Select value={value} onValueChange={onChange} {...props}>
            <SelectTrigger className="w-full">
                <SelectValue
                    placeholder="Velg en gruppe"
                    className={cn(className)}
                />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {groups?.map((item, index) => (
                        <SelectItem value={item.value} key={index}>
                            {item.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
