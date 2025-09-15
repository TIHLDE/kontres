'use client';

import { LoadingSpinner } from '@/components/ui/loadingspinner';

import FaqCard from '@/app/faq/components/faq-card';
import { api } from '@/trpc/react';
import Link from 'next/link';

interface ItemFAQsProps {
    itemId: number;
}

export default function ItemFAQs({ itemId }: ItemFAQsProps) {
    const {
        data: faqs,
        isLoading,
        error,
    } = api.faq.getAll.useInfiniteQuery(
        {
            limit: 6,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );

    // Filter FAQs that are related to this item
    const relatedFAQs =
        faqs?.pages
            .flatMap((page) => page.faqs)
            .filter((faq) =>
                faq.bookableItems.some((item) => item.itemId === itemId),
            ) || [];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">
                    Could not load FAQ items
                </p>
            </div>
        );
    }

    if (relatedFAQs.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">
                    No FAQ items found for this bookable item
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Related FAQ</h2>
                <Link
                    href="/faq"
                    className="text-sm text-primary hover:underline"
                >
                    View all FAQs
                </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedFAQs.map((faq) => (
                    <Link href={`/faq/${faq.questionId}`} key={faq.questionId}>
                        <FaqCard
                            title={faq.question}
                            description={faq.answer}
                            bookableItems={faq.bookableItems}
                            author={faq.author}
                            group={faq.groupSlug ?? ''}
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
}
