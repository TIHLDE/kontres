'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import CreateFaqForm from '../../components/CreateFaqForm';
import { type FaqFormValueTypes } from '../../components/faqSchema';
import { api } from '@/trpc/react';
import { SessionProvider } from 'next-auth/react';
import { useParams } from 'next/navigation';

export default function Page() {
    const params = useParams();
    const questionId = params.id as string;
    const { data: updateQuestion, isLoading } = api.faq.getById.useQuery({
        questionId: parseInt(questionId),
    });

    const question = {
        question: updateQuestion?.question,
        answer: updateQuestion?.answer,
        bookableItemIds: updateQuestion?.bookableItems?.map(
            (item) => item.itemId,
        ),
        group: updateQuestion?.group,
        imageUrl: updateQuestion?.imageUrl,
    } as FaqFormValueTypes;

    return (
        <SessionProvider>
            <div className="max-w-2xl mx-auto min-h-screen gap-5 justify-center">
                <Card className="p-4 h-fit max-w-2xl">
                    <CardHeader>
                        <CardTitle>Rediger FAQ</CardTitle>
                        <CardDescription>
                            Rediger en eksisterende FAQ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CreateFaqForm
                            question={question}
                            questionId={questionId}
                        />
                    </CardContent>
                </Card>
            </div>
        </SessionProvider>
    );
}
