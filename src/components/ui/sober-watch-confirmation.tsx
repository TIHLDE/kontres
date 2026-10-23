'use client';

import { Checkbox } from './checkbox';
import { Label } from './label';
import { useId } from 'react';

interface SoberWatchConfirmationProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    error?: string;
}

export default function SoberWatchConfirmation({
    checked,
    onCheckedChange,
    error,
}: SoberWatchConfirmationProps) {
    const id = useId();
    return (
        <div className="space-y-2 rounded-md border p-4">
            <div className="flex items-start gap-3">
                <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(value) => onCheckedChange(value === true)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                />
                <Label htmlFor={id} className="cursor-pointer leading-relaxed">
                    Jeg forstår at bytte av edruvakt må avklares med NTNU i god
                    tid før bookingen.
                </Label>
            </div>
            {error && (
                <p id={`${id}-error`} className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}
