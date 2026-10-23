'use client';

import { Button } from './button';
import { Label } from './label';
import { toWebpDataUrl } from '@/lib/to-webp';
import { useRef, useState } from 'react';

interface SoberWatchImageInputProps {
    value?: string;
    onChange: (value: string | undefined) => void;
}

export default function SoberWatchImageInput({
    value,
    onChange,
}: SoberWatchImageInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string>();

    const handleFile = async (file?: File) => {
        if (!file) return;
        setError(undefined);
        try {
            onChange(await toWebpDataUrl(file));
        } catch {
            setError('Kunne ikke lese bildet. Prøv et annet bilde.');
        }
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="soberWatchImage">
                Last opp bilde av edruvakt (anbefalt)
            </Label>
            <input
                id="soberWatchImage"
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    void handleFile(e.target.files?.[0]);
                    e.target.value = '';
                }}
            />
            {value ? (
                <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={value}
                        alt="Bilde av edruvakt"
                        className="h-24 w-24 rounded-md border object-cover"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onChange(undefined)}
                    >
                        Fjern bilde
                    </Button>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => inputRef.current?.click()}
                >
                    Velg bilde
                </Button>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-sm text-muted-foreground">
                Bildet brukes kun til å identifisere edruvakten, er bare synlig
                for de som behandler reservasjoner, og slettes når reservasjonen
                er godkjent eller avvist. Edruvakten må være informert om og
                samtykke til at bildet lastes opp.
            </p>
        </div>
    );
}
