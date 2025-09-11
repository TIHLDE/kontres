import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { auth } from '@/auth';
import { api } from '@/trpc/server';
import { PencilIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type QuestionPageParams = {
    params: { id: string };
};

export default async function Page({ params: { id } }: QuestionPageParams) {
    const data = await api.faq.getById({ questionId: +id });
    const session = await auth();
    const isAdmin = session?.user.role === 'ADMIN';

    return (
        <div>
            <div className="max-w-4xl mx-auto h-screen -mt-24 flex flex-col justify-center gap-2.5">
                <Card className="w-100">
                    <CardContent className="flex gap-6 pt-6">
                        {data.imageUrl != '' && (
                            <Image
                                className="rounded-lg h-fit"
                                src={data.imageUrl}
                                width={300}
                                height={500}
                                alt=""
                            />
                        )}
                        <div className="h-full">
                            <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight flex flex-col">
                                {data.question}
                                <span className="text-xs text-muted-foreground ">
                                    Postet av {data?.author}, {data?.group}
                                </span>
                            </h3>
                            <div className="flex gap-1 mt-1">
                                    {data?.bookableItems.map(
                                        (bookableItem, index) => (
                                            <Link href={`./${''}`}>
                                                <Badge key={index}>
                                                    {bookableItem.name}
                                                </Badge>
                                            </Link>
                                        ),
                                    )}
                                </div>
                            <p className="mt-3">{data?.answer}</p>
                        </div>
                    </CardContent>
                </Card>
                {isAdmin && (
                    <Link href={`./edit/${id}`} className="w-fit">
                        <Button className="flex gap-2.5 items-center">
                            <PencilIcon size={16} />
                            Rediger
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
