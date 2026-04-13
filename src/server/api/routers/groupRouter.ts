import { createTRPCRouter, memberProcedure } from '@/server/api/trpc';
import { getTIHLDEGroups } from '@/server/services/lepton/get-groups';

const ALLOWED_GROUP_TYPES = [
    'BOARD',
    'COMMITTEE',
    'SUBGROUP',
    'INTERESTGROUP',
] as const;
export type AllowedGroupType = (typeof ALLOWED_GROUP_TYPES)[number];
export type GroupInfo = {
    groupSlug: string;
    groupName: string;
    type: AllowedGroupType;
};

export const groupRouter = createTRPCRouter({
    getAll: memberProcedure.query(async ({ ctx }) => {
        const leptonGroups = await getTIHLDEGroups(
            ctx.session.user.TIHLDE_Token,
        );

        const groups = leptonGroups
            .filter((g) =>
                ALLOWED_GROUP_TYPES.includes(g.type as AllowedGroupType),
            )
            .map<GroupInfo>((g) => ({
                groupSlug: g.slug,
                groupName: g.name,
                type: g.type as AllowedGroupType,
            }));

        return groups;
    }),

    getRegisteredGroups: memberProcedure.query(async ({ ctx }) => {
        const registeredGroupItems = new Set<string>();

        (
            await ctx.db.bookableItem.findMany({
                select: {
                    groupSlug: true,
                },
            })
        ).forEach((item) => registeredGroupItems.add(item.groupSlug));

        const list = [...registeredGroupItems];
        list.sort();

        return list;
    }),

    getUserGroups: memberProcedure.query(async ({ ctx }) => {
        return ctx.session.user.groups;
    }),
});
