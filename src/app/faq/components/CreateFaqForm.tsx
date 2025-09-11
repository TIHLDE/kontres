'use client';

import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
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
import { getImageUrl } from './uploadFile';
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

    const [file, setFile] = useState<File>();

    const router = useRouter();

    const { data: session } = useSession();
    const { data: allGroups } = api.group.getAll.useQuery();
    const [token, groups, admin] = useMemo(() => {
        return [
            session?.user.TIHLDE_Token,
            session?.user.groups,
            session?.user.role === 'ADMIN',
        ];
    }, [session]);

    const { toast } = useToast();

    const form = useForm<FaqFormValueTypes>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            question: '',
            answer: '',
            bookableItemIds: [],
            group: groups ? groups[0] : '',
            imageUrl: '',
        },
    });

    useEffect(() => {
        if (question) {
            form.reset({
                question: question?.question || '',
                answer: question?.answer || '',
                bookableItemIds: question.bookableItemIds || [],
                group: question?.group || (groups ? groups[0] : ''),
                imageUrl: question?.imageUrl || '',
            });
        }
    }, [question, groups, form]);

    async function onSubmit(formData: FaqFormValueTypes) {
        try {
            const imageUrl =
                file && token ? await getImageUrl(file, token) : '';
            form.setValue('imageUrl', imageUrl);

            const faqData = {
                question: formData.question,
                answer: formData.answer,
                bookableItemIds: formData.bookableItemIds,
                author: `${session?.user?.firstName} ${session?.user?.lastName}`,
                group: formData.group || session?.user.leaderOf[0],
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
                    groupId: '1', //må finne ut hva groupId skal være
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

    function handleFileUpload(file: File): void {
        setFile(file);
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
                                    Gjelder spørsmålet noen
                                    gjenstander?
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
                    {(groups ? groups.length > 1 : false) && (
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
                                                    ? allGroups?.map((g) => ({
                                                          label: g.name,
                                                          value: g.groupId,
                                                      }))
                                                    : allGroups
                                                          ?.filter((g) =>
                                                              groups?.includes(
                                                                  g.groupId,
                                                              ),
                                                          )
                                                          .map((g) => ({
                                                              label: g.name,
                                                              value: g.groupId,
                                                          }))
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

                <FileUpload
                    accept="image/*"
                    onChange={(files) => {
                        files[0] && handleFileUpload(files[0]);
                    }}
                />

                <Button type="submit">
                    {questionId ? 'Oppdater' : 'Opprett'}
                </Button>
            </form>
        </Form>
    );
}
