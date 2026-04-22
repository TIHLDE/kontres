import { PrismaClient, ReservationState } from '@prisma/client';
import { URLS } from '../src/server/api/urls';

type LeptonBookableItem = {
    id: string;
    name: string;
    description: string;
    allows_alcohol: boolean;
    image?: string;
};

type LeptonReservation = {
    id: string;
    bookable_item: string;
    bookable_item_detail: LeptonBookableItem | null;
    group: string | { slug?: string } | null;
    author: string | { user_id?: string } | null;
    sober_watch?: string;
    approved_by?: string;
    start_time: string;
    end_time: string;
    state: string;
    description: string;
    accepted_rules: boolean;
    serves_alcohol: boolean;
};

type CliOptions = {
    dryRun: boolean;
    apiUrl: string;
    token?: string;
    username?: string;
    password?: string;
    fromDate?: Date;
};

const prisma = new PrismaClient();
const FALLBACK_GROUP_SLUG = 'unknown';
const FALLBACK_AUTHOR_ID = 'unknown';

const parseArgs = (): CliOptions => {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const apiUrl = process.env.LEPTON_API_URL ?? 'https://api.tihlde.org';
    const tokenArg = args.find((arg) => arg.startsWith('--token='));
    const usernameArg = args.find((arg) => arg.startsWith('--username='));
    const passwordArg = args.find((arg) => arg.startsWith('--password='));
    const fromDateArg = args.find((arg) => arg.startsWith('--from-date='));
    const token = tokenArg?.replace('--token=', '') || process.env.TIHLDE_TOKEN;
    const username =
        usernameArg?.replace('--username=', '') || process.env.LEPTON_USERNAME;
    const password =
        passwordArg?.replace('--password=', '') || process.env.LEPTON_PASSWORD;
    const fromDateInput =
        fromDateArg?.replace('--from-date=', '') || process.env.IMPORT_FROM_DATE;
    const parsedFromDate = fromDateInput ? new Date(fromDateInput) : undefined;
    const fromDate =
        parsedFromDate && !Number.isNaN(parsedFromDate.getTime())
            ? parsedFromDate
            : undefined;

    return { dryRun, apiUrl, token, username, password, fromDate };
};

const buildHeaders = (token?: string): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['x-csrf-token'] = token;
    }

    return headers;
};

const getTokenCandidates = (token?: string): string[] => {
    if (!token) return [];
    const trimmed = token.trim();
    const decoded = decodeURIComponent(trimmed);
    return [...new Set([trimmed, decoded])];
};

const fetchReservations = async (options: CliOptions): Promise<LeptonReservation[]> => {
    const reservationsUrl = `${options.apiUrl.replace(/\/$/, '')}/${URLS.RESERVATIONS}/`;
    const tokenCandidates = getTokenCandidates(options.token);
    const headersToTry: HeadersInit[] = [
        buildHeaders(undefined),
        ...tokenCandidates.flatMap((token) => [
            buildHeaders(token),
            { ...buildHeaders(token), Authorization: `Token ${token}` },
            { ...buildHeaders(token), Authorization: `Bearer ${token}` },
        ]),
    ];

    let lastStatus = 'unknown';

    for (const headers of headersToTry) {
        const response = await fetch(reservationsUrl, { headers });
        lastStatus = `${response.status} ${response.statusText}`;

        if (!response.ok) {
            continue;
        }

        const payload = (await response.json()) as
            | LeptonReservation[]
            | { results?: LeptonReservation[] };

        if (Array.isArray(payload)) {
            return payload;
        }

        if (payload.results && Array.isArray(payload.results)) {
            return payload.results;
        }

        throw new Error('API returned an unexpected reservation payload shape');
    }

    throw new Error(
        `Failed fetching reservations (${lastStatus}). Tried x-csrf-token and Authorization headers with provided token.`,
    );
};

const loginToTihlde = async (
    apiUrl: string,
    username: string,
    password: string,
): Promise<string | null> => {
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/auth/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: username,
            password,
        }),
    });

    if (!response.ok) {
        return null;
    }

    const payload = (await response.json()) as { token?: string };
    return payload.token ?? null;
};

const buildReservationFingerprint = (
    data: Pick<
        LeptonReservation,
        | 'author'
        | 'group'
        | 'start_time'
        | 'end_time'
        | 'description'
        | 'accepted_rules'
        | 'serves_alcohol'
        | 'state'
    > & { localBookableItemId: number },
): string => {
    return [
        data.author,
        data.group,
        data.localBookableItemId,
        new Date(data.start_time).toISOString(),
        new Date(data.end_time).toISOString(),
        data.description.trim(),
        data.accepted_rules ? '1' : '0',
        data.serves_alcohol ? '1' : '0',
        data.state,
    ].join('|');
};

const normalizeGroupSlug = (
    group: LeptonReservation['group'],
): { groupSlug: string; usedFallback: boolean } => {
    if (typeof group === 'string') {
        const slug = group.trim();
        if (slug) {
            return { groupSlug: slug, usedFallback: false };
        }
    }

    if (group && typeof group === 'object' && typeof group.slug === 'string') {
        const slug = group.slug.trim();
        if (slug) {
            return { groupSlug: slug, usedFallback: false };
        }
    }

    return { groupSlug: FALLBACK_GROUP_SLUG, usedFallback: true };
};

const normalizeAuthorId = (
    author: LeptonReservation['author'],
): { authorId: string; usedFallback: boolean } => {
    if (typeof author === 'string') {
        const authorId = author.trim();
        if (authorId) {
            return { authorId, usedFallback: false };
        }
    }

    if (author && typeof author === 'object' && typeof author.user_id === 'string') {
        const authorId = author.user_id.trim();
        if (authorId) {
            return { authorId, usedFallback: false };
        }
    }

    return { authorId: FALLBACK_AUTHOR_ID, usedFallback: true };
};

const normalizeReservationState = (
    state: string,
): { status: ReservationState; usedFallback: boolean } => {
    if (state === 'PENDING') {
        return { status: ReservationState.PENDING, usedFallback: false };
    }

    if (state === 'APPROVED' || state === 'CONFIRMED') {
        return { status: ReservationState.APPROVED, usedFallback: false };
    }

    if (state === 'REJECTED') {
        return { status: ReservationState.REJECTED, usedFallback: false };
    }

    return { status: ReservationState.PENDING, usedFallback: true };
};

const run = async () => {
    const options = parseArgs();

    const summary = {
        dryRun: options.dryRun,
        fetchedReservations: 0,
        consideredReservations: 0,
        filteredOutBeforeFromDate: 0,
        uniqueSourceItems: 0,
        createdBookableItems: 0,
        reusedBookableItems: 0,
        unresolvedReservations: 0,
        missingBookableItemDetails: 0,
        fallbackGroupSlugCount: 0,
        fallbackAuthorIdCount: 0,
        fallbackStatusCount: 0,
        skippedDuplicates: 0,
        createdReservations: 0,
    };

    console.log(
        `[import] starting ${options.dryRun ? '(dry-run)' : '(live)'} using API ${
            options.apiUrl
        }`,
    );

    if (options.username && options.password) {
        console.log(
            '[import] credentials supplied; attempting login to fetch fresh token',
        );
        const loggedInToken = await loginToTihlde(
            options.apiUrl,
            options.username,
            options.password,
        );
        if (loggedInToken) {
            options.token = loggedInToken;
            console.log('[import] login succeeded; using fresh token from API');
        } else {
            console.log(
                '[import] login failed; falling back to existing TIHLDE_TOKEN if present',
            );
        }
    } else if (!options.token) {
        console.log(
            '[import] no token supplied; set TIHLDE_TOKEN or LEPTON_USERNAME/LEPTON_PASSWORD',
        );
    }

    const sourceReservations = await fetchReservations(options);
    summary.fetchedReservations = sourceReservations.length;
    const reservationsToImport = options.fromDate
        ? sourceReservations.filter((reservation) => {
              const start = new Date(reservation.start_time);
              if (Number.isNaN(start.getTime())) {
                  return true;
              }
              return start >= options.fromDate!;
          })
        : sourceReservations;
    summary.consideredReservations = reservationsToImport.length;
    summary.filteredOutBeforeFromDate =
        summary.fetchedReservations - summary.consideredReservations;

    if (reservationsToImport.length === 0) {
        console.log('[import] no reservations returned by source API');
        console.log(summary);
        return;
    }

    const sourceItemByUuid = new Map<string, LeptonBookableItem>();
    for (const reservation of reservationsToImport) {
        if (reservation.bookable_item_detail) {
            sourceItemByUuid.set(
                reservation.bookable_item,
                reservation.bookable_item_detail,
            );
        } else {
            summary.missingBookableItemDetails += 1;
        }
    }
    summary.uniqueSourceItems = sourceItemByUuid.size;

    const allLocalItems = await prisma.bookableItem.findMany({
        select: {
            itemId: true,
            name: true,
            groupSlug: true,
        },
    });

    const itemKeyToLocal = new Map<string, number>();
    for (const item of allLocalItems) {
        itemKeyToLocal.set(`${item.name.toLowerCase()}|${item.groupSlug}`, item.itemId);
    }

    const sourceItemToLocalItemId = new Map<string, number>();
    const reservationIdsWithFallbackGroup = new Set<string>();
    const reservationIdsWithFallbackAuthor = new Set<string>();
    const reservationIdsWithFallbackState = new Set<string>();

    for (const reservation of reservationsToImport) {
        const sourceItem = reservation.bookable_item_detail;
        if (!sourceItem) {
            continue;
        }
        const { groupSlug, usedFallback } = normalizeGroupSlug(reservation.group);
        if (usedFallback) {
            reservationIdsWithFallbackGroup.add(reservation.id);
        }
        const key = `${sourceItem.name.toLowerCase()}|${groupSlug}`;
        let localItemId = itemKeyToLocal.get(key);

        if (!localItemId) {
            if (options.dryRun) {
                summary.createdBookableItems += 1;
                localItemId = -summary.createdBookableItems;
            } else {
                const created = await prisma.bookableItem.create({
                    data: {
                        name: sourceItem.name,
                        description: sourceItem.description,
                        allowsAlcohol: sourceItem.allows_alcohol,
                        groupSlug,
                        imageUrl: sourceItem.image ?? null,
                    },
                    select: {
                        itemId: true,
                    },
                });
                localItemId = created.itemId;
                summary.createdBookableItems += 1;
            }
            itemKeyToLocal.set(key, localItemId);
        } else {
            summary.reusedBookableItems += 1;
        }

        sourceItemToLocalItemId.set(reservation.bookable_item, localItemId);
    }

    const allExistingReservations = await prisma.reservation.findMany({
        select: {
            authorId: true,
            groupSlug: true,
            bookableItemId: true,
            startTime: true,
            endTime: true,
            description: true,
            acceptedRules: true,
            servesAlcohol: true,
            status: true,
        },
    });

    const existingFingerprints = new Set(
        allExistingReservations.map((reservation) =>
            [
                reservation.authorId,
                reservation.groupSlug,
                reservation.bookableItemId,
                reservation.startTime.toISOString(),
                reservation.endTime.toISOString(),
                reservation.description.trim(),
                reservation.acceptedRules ? '1' : '0',
                reservation.servesAlcohol ? '1' : '0',
                reservation.status,
            ].join('|'),
        ),
    );

    for (const sourceReservation of reservationsToImport) {
        const { groupSlug, usedFallback } = normalizeGroupSlug(sourceReservation.group);
        if (usedFallback) {
            reservationIdsWithFallbackGroup.add(sourceReservation.id);
        }
        const { authorId, usedFallback: usedAuthorFallback } = normalizeAuthorId(
            sourceReservation.author,
        );
        if (usedAuthorFallback) {
            reservationIdsWithFallbackAuthor.add(sourceReservation.id);
        }
        const { status, usedFallback: usedStatusFallback } = normalizeReservationState(
            sourceReservation.state,
        );
        if (usedStatusFallback) {
            reservationIdsWithFallbackState.add(sourceReservation.id);
        }
        const localBookableItemId = sourceItemToLocalItemId.get(
            sourceReservation.bookable_item,
        );

        if (localBookableItemId === undefined) {
            summary.unresolvedReservations += 1;
            continue;
        }

        const fingerprint = buildReservationFingerprint({
            ...sourceReservation,
            author: authorId,
            group: groupSlug,
            state: status,
            localBookableItemId,
        });

        if (existingFingerprints.has(fingerprint)) {
            summary.skippedDuplicates += 1;
            continue;
        }

        if (options.dryRun) {
            summary.createdReservations += 1;
            existingFingerprints.add(fingerprint);
            continue;
        }

        await prisma.reservation.create({
            data: {
                authorId,
                bookableItemId: localBookableItemId,
                startTime: new Date(sourceReservation.start_time),
                endTime: new Date(sourceReservation.end_time),
                status,
                description: sourceReservation.description,
                acceptedRules: sourceReservation.accepted_rules,
                groupSlug,
                servesAlcohol: sourceReservation.serves_alcohol,
                soberWatch: sourceReservation.sober_watch ?? null,
                approvedById: sourceReservation.approved_by ?? null,
            },
        });

        summary.createdReservations += 1;
        existingFingerprints.add(fingerprint);
    }

    summary.fallbackGroupSlugCount = reservationIdsWithFallbackGroup.size;
    summary.fallbackAuthorIdCount = reservationIdsWithFallbackAuthor.size;
    summary.fallbackStatusCount = reservationIdsWithFallbackState.size;

    console.log('[import] completed');
    console.log(summary);
};

run()
    .catch((error) => {
        console.error('[import] failed', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
