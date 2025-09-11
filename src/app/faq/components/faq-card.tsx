import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { BookableItem } from '@prisma/client';

type FaqCardProps = {
    title: string;
    description: string;
    bookableItems: BookableItem[];
    author: string;
    group: string;
};

export default function FaqCard({
    description,
    title,
    bookableItems,
    author,
    group,
}: FaqCardProps) {
    return (
        <div className="bg-border rounded-md h-full">
            <Card className="w-100 h-full flex flex-col hover:-translate-y-1 hover:translate-x-1 transition-transform">
                <CardHeader className="pb-3">
                    <CardTitle className="text-left">{title}</CardTitle>
                    <span className="text-xs text-muted-foreground ">
                        Postet av {author}, {group}
                    </span>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 ">
                    <a className="line-clamp-2">{description}</a>
                    {bookableItems ? (
                        <span className="mt-auto ">
                            {bookableItems.map((item) => (
                                <Badge key={item.itemId} className="m-1 ml-0">
                                    {item.name}
                                </Badge>
                            ))}
                        </span>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
