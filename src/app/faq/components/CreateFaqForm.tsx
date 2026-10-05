'use client';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import GroupSelect from '@/components/ui/group-select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

import BookableItemsSelect from './bookableItemsSelect';
import { FaqFormValueTypes, formSchema } from './faqSchema';

import { CACHE_TAGS } from '@/lib/cache_tags';
import { api } from '@/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function CreateFaqForm({
    question,
    questionId,
}: {
    question?: FaqFormValueTypes;
    questionId?: string;
}) {
    const { mutateAsync: createFaq } = api.faq.create.useMutation();
    const { mutateAsync: updateFaq } = api.faq.update.useMutation();
    const queryClient = useQueryClient();

  

    const router = useRouter();

    const { data: session } = useSession();
    const { data: allGroups } = api.group.getAll.useQuery();
    // FAQ-mutasjonene krever lederverv, ikke bare medlemskap. Index/HS leder
    // sjelden en gruppe, så de faller tilbake på en gruppe de er medlem av.
    const [leaderOfGroups, admin, fallbackGroup] = useMemo(() => {
        const isAdmin = session?.user.role === 'ADMIN';
        return [
            session?.user.leaderOf,
            isAdmin,
            session?.user.leaderOf[0] ??
                (isAdmin ? session?.user.groups[0] : undefined),
        ] as const;
    }, [session]);

    const { toast } = useToast();

    const form = useForm<FaqFormValueTypes>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            question: '',
            answer: '',
            bookableItemIds: [],
            group: fallbackGroup ?? '',
            imageUrl: '',
        },
    });

    useEffect(() => {
        if (question) {
            form.reset({
                question: question?.question || '',
                answer: question?.answer || '',
                bookableItemIds: question.bookableItemIds ?? [],
                // `group` er valgfri i skjemaet og kan stå som tom streng, ikke
                // bare mangle, så `??` ville sluppet tomheten igjennom.
                group:
                    question.group === undefined || question.group === ''
                        ? (fallbackGroup ?? '')
                        : question.group,
                imageUrl: question?.imageUrl ?? '',
            });
        }
    }, [question, fallbackGroup, form]);

    async function onSubmit(formData: FaqFormValueTypes) {
        try {
            const imageUrl = '';

            // Samme grunn som i `form.reset` over: feltet kan stå tomt.
            const group =
                formData.group === undefined || formData.group === ''
                    ? fallbackGroup
                    : formData.group;

            const faqData = {
                question: formData.question,
                answer: formData.answer,
                bookableItemIds: formData.bookableItemIds,
                author: `${session?.user?.firstName} ${session?.user?.lastName}`,
                group,
                imageUrl,
            };

            if (questionId) {
                await updateFaq({
                    ...faqData,
                    questionId: parseInt(questionId),
                });
            } else {
                await createFaq({
                    ...faqData,
                    groupSlug: group ?? '',
                });
            }

            toast({
                description: questionId
                    ? '✅ FAQ oppdatert!'
                    : '🎉 FAQ opprettet!',
                duration: 5000,
                action: (
                    <ToastAction
                        altText="Til FAQ-siden"
                        className="border-black"
                    >
                        <Link href={`/faq`} onClick={() => toast}>
                            Til FAQ-siden
                        </Link>
                    </ToastAction>
                ),
            });

            await queryClient.invalidateQueries({
                queryKey: [CACHE_TAGS.FAQS],
            });
            router.back();
        } catch (error) {
            console.error('Error i oppretting  av FAQ: ', error);
            toast({ variant: 'destructive', description: 'Noe gikk galt 😢' });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tittel</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder={
                                        'Hvilket spørsmål skal besvares?'
                                    }
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                ></FormField>

                <FormField
                    control={form.control}
                    name="answer"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Svar</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={'Skriv et svar på spørsmålet.'}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                ></FormField>

                <div className="w-full grid gap-10 grid-cols-2">
                    <FormField
                        control={form.control}
                        name="bookableItemIds"
                        render={({ field }) => (
                            <FormItem className="flex flex-col mt-5">
                                <FormLabel>
                                    Gjelder spørsmålet noen gjenstander?
                                </FormLabel>
                                <FormControl>
                                    <BookableItemsSelect
                                        field={field}
                                        form={form}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Velg ingen, én, eller flere gjenstander
                                </FormDescription>
                            </FormItem>
                        )}
                    ></FormField>
                    {(admin || (leaderOfGroups?.length ?? 0) > 1) && (
                        <FormField
                            control={form.control}
                            name="group"
                            render={({ field: { onChange, value } }) => (
                                <FormItem className="flex flex-col mt-5">
                                    <FormLabel>
                                        Hvilke grupper gjelder dette spørsmålet?
                                    </FormLabel>
                                    <FormControl>
                                        <GroupSelect
                                            onChange={onChange}
                                            value={value}
                                            groups={
                                                admin
                                                    ? allGroups?.map(
                                                          (g: {
                                                              groupSlug: string;
                                                              groupName: string;
                                                              type: string;
                                                          }) => ({
                                                              label: g.groupName,
                                                              value: g.groupSlug,
                                                          }),
                                                      )
                                                    : allGroups
                                                          ?.filter(
                                                              (g: {
                                                                  groupSlug: string;
                                                                  groupName: string;
                                                                  type: string;
                                                              }) =>
                                                                  leaderOfGroups?.includes(
                                                                      g.groupSlug,
                                                                  ),
                                                          )
                                                          .map(
                                                              (g: {
                                                                  groupSlug: string;
                                                                  groupName: string;
                                                                  type: string;
                                                              }) => ({
                                                                  label: g.groupName,
                                                                  value: g.groupSlug,
                                                              }),
                                                          )
                                            }
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Velg en gruppe
                                    </FormDescription>
                                </FormItem>
                            )}
                        ></FormField>
                    )}
                </div>

                <Button type="submit">
                    {questionId ? 'Oppdater' : 'Opprett'}
                </Button>
            </form>
        </Form>
    );
}
