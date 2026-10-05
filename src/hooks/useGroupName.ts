'use client';

import { api } from '@/trpc/react';

export function useGroupName() {
    const { data: groups } = api.group.getAll.useQuery();

    return (groupSlug: string) =>
        groups?.find((g) => g.groupSlug === groupSlug)?.groupName ?? groupSlug;
}
