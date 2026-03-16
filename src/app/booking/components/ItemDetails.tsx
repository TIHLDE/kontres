'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

import { Wine, WineOff } from 'lucide-react';
import Link from 'next/link';

interface ItemDetailsProps {
    itemId: number;
    name: string;
    description: string;
    allowsAlcohol: boolean;
    groupSlug: string;
    imageUrl?: string | null;
}

export default function ItemDetails({
    name,
    description,
    allowsAlcohol,
    groupSlug,
    itemId,
    imageUrl,
}: ItemDetailsProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-2xl">{name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{groupSlug}</Badge>
                            <div className="flex items-center gap-1">
                                {allowsAlcohol ? (
                                    <>
                                        <Wine className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-green-600">
                                            Alkohol tillatt
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <WineOff className="h-4 w-4 text-red-600" />
                                        <span className="text-sm text-red-600">
                                            Ingen alkohol
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div>
                        <Button asChild>
                            <Link href={`/booking/${itemId}/new`}>
                                Send inn reservasjon
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Separator className="mb-4" />
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                        <Image
                            src={imageUrl ?? '/placeholder.svg'}
                            alt={name}
                            fill
                            className="object-cover rounded-lg"
                            unoptimized={!!imageUrl}
                        />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Beskrivelse</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {description}
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">
                                Bookinginformasjon
                            </h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>
                                    • Reservasjoner må godkjennes av gruppeledere
                                </li>
                                <li>
                                    • Vennligst legg ved en detaljert beskrivelse av
                                    arrangementet ditt
                                </li>
                                {allowsAlcohol && (
                                    <li>
                                        • Ved servering av alkohol kreves en edruvakt
                                    </li>
                                )}
                                <li>• Følg alle TIHLDEs regler og retningslinjer</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
