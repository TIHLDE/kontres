'use client';

import { useFileInput } from '../hooks/use-file-input';
import { Button } from './button';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface FileInputProps extends HTMLAttributes<HTMLDivElement> {
    maxSize?: number;
    accept?: string;
    label?: string;
    disabled?: boolean;
}
export default function FileInput({
    maxSize = 5,
    accept,
    label,
    disabled,
    className,
    ...props
}: FileInputProps) {
    const { fileName, error, fileInputRef, handleFileSelect, clearFile } =
        useFileInput({
            maxSize,
            accept,
        });
    return (
        <div className={cn('flex flex-col', className)} {...props}>
            <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
            >
                {label ?? 'Velg fil'}
            </Button>
            <input
                className="hidden"
                type={'file'}
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={disabled}
                accept={accept}
            />
            <p className="text-sm text-muted-foreground">{fileName}</p>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
