'use client';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loadingspinner';

import FaqCard from './faq-card';
import FAQListSkeleton from './faq-list-skeleton';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';

const FaqList = () => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage,
        error,
    } = api.faq.getAll.useInfiniteQuery(
        {
            limit: 9,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );
    return (
        <>
            <div className="grid md:grid-cols-3 grid-cols-1 gap-5 ">
                {data?.pages.map((page) =>
                    page.faqs.map((object) => (
                        <Link
                            href={`faq/${object.questionId}`}
                            key={object.questionId}
                        >
                            <FaqCard
                                description={object.answer}
                                title={object.question}
                                bookableItems={object.bookableItems}
                                author={object.author}
                                group={object.group ?? ''}
                            />
                        </Link>
                    )),
                )}
            </div>
            {isLoading && !error && <FAQListSkeleton />}
            <div className="max-w-page mx-auto flex gap-5">
                {hasNextPage && (
                    <Button onClick={() => fetchNextPage()} className='gap-2.5'>
                        {isFetchingNextPage && <LoadingSpinner />}
                        {!isFetchingNextPage && (
                            <>
                                <ArrowDown size={16} strokeWidth={2.5}/>
                                Last inn mer
                            </>
                            )}
                    </Button>
                )}
                {error && <text>Noe gikk galt</text>}
            </div>
        </>
    );
};

export default FaqList;
