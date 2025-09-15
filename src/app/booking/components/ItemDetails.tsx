'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { Wine, WineOff } from 'lucide-react';

interface ItemDetailsProps {
    name: string;
    description: string;
    allowsAlcohol: boolean;
    groupSlug: string;
}

export default function ItemDetails({
    name,
    description,
    allowsAlcohol,
    groupSlug,
}: ItemDetailsProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl">{name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{groupSlug}</Badge>
                            <div className="flex items-center gap-1">
                                {allowsAlcohol ? (
                                    <>
                                        <Wine className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-green-600">
                                            Alcohol allowed
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <WineOff className="h-4 w-4 text-red-600" />
                                        <span className="text-sm text-red-600">
                                            No alcohol
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Separator className="mb-4" />
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">
                            Booking Information
                        </h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                                • Reservations must be approved by group leaders
                            </li>
                            <li>
                                • Please provide detailed description of your
                                event
                            </li>
                            {allowsAlcohol && (
                                <li>
                                    • If serving alcohol, a sober watch person
                                    is required
                                </li>
                            )}
                            <li>• Follow all TIHLDE rules and regulations</li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
