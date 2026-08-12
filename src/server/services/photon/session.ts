import 'server-only';

import { db } from '@/server/db';

import { refreshPhotonTokens } from './oauth';

/**
 * Photon-tokenene for en innlogget økt, holdt i basen i stedet for i JWT-en.
 *
 * Grunnen står i `prisma/schema.prisma`: refresh-tokens roteres, og to
 * forespørsler som bærer den samme informasjonskapselen ville brukt det samme
 * tokenet to ganger. Photon leser det som tyveri og sletter hele kjeden, så
 * brukeren blir kastet ut omtrent hver time. Med tokenene ett sted ser den
 * andre forespørselen resultatet av den førstes fornyelse.
 */

/** Fornyer litt før utløp, så et oppslag ikke rekker å treffe det. */
const RENEW_BEFORE_MS = 60_000;

/**
 * Hvor lenge en ubrukt rad blir liggende. Photons refresh-token varer 30 dager;
 * etter det er raden verdiløs uansett.
 */
const SESSION_MAX_IDLE_MS = 30 * 24 * 60 * 60 * 1000;

/** Sjanse per oppslag for også å rydde bort utgåtte rader. */
const SWEEP_PROBABILITY = 0.01;

export type PhotonSessionTokens = {
    accessToken: string;
    subject: string;
};

export async function createPhotonSession(opts: {
    subject: string;
    accessToken: string;
    refreshToken: string | null;
    expiresAt: Date;
}): Promise<string> {
    const row = await db.photonSession.create({
        data: {
            subject: opts.subject,
            accessToken: opts.accessToken,
            refreshToken: opts.refreshToken,
            expiresAt: opts.expiresAt,
        },
        select: { id: true },
    });

    return row.id;
}

export async function deletePhotonSession(id: string): Promise<void> {
    await db.photonSession.deleteMany({ where: { id } });
}

/**
 * Fornyelser som er i gang, etter økt-id.
 *
 * Flere server-komponenter på samme side spør om tokenet samtidig. Uten dette
 * ville de startet hver sin fornyelse med det samme refresh-tokenet — akkurat
 * det raden over er ment å hindre.
 */
const inFlight = new Map<string, Promise<PhotonSessionTokens | null>>();

/**
 * Et gyldig access-token for økta, fornyet om nødvendig.
 *
 * `null` betyr at økta er ugyldig og brukeren må logge inn på nytt.
 */
export async function getValidAccessToken(
    id: string,
): Promise<PhotonSessionTokens | null> {
    if (Math.random() < SWEEP_PROBABILITY) void sweepStaleSessions();

    const existing = inFlight.get(id);
    if (existing) return existing;

    const row = await db.photonSession.findUnique({ where: { id } });
    if (!row) return null;

    if (row.expiresAt.getTime() - RENEW_BEFORE_MS > Date.now()) {
        return { accessToken: row.accessToken, subject: row.subject };
    }

    if (!row.refreshToken) return null;

    const request = renew(id, row.refreshToken, row.subject).finally(() => {
        inFlight.delete(id);
    });

    inFlight.set(id, request);
    return request;
}

async function renew(
    id: string,
    refreshToken: string,
    subject: string,
): Promise<PhotonSessionTokens | null> {
    const renewed = await refreshPhotonTokens(refreshToken);

    if (!renewed) {
        // Photon nektet. Raden er verdiløs nå, og å la den ligge betyr bare at
        // hver eneste forespørsel prøver det samme igjen.
        await deletePhotonSession(id);
        return null;
    }

    await db.photonSession.update({
        where: { id },
        data: {
            accessToken: renewed.accessToken,
            refreshToken: renewed.refreshToken,
            expiresAt: new Date(renewed.expiresAt * 1000),
        },
    });

    return { accessToken: renewed.accessToken, subject };
}

/** Rader ingen har rørt på lenge. Best effort — stopper aldri en forespørsel. */
async function sweepStaleSessions(): Promise<void> {
    try {
        await db.photonSession.deleteMany({
            where: { updatedAt: { lt: new Date(Date.now() - SESSION_MAX_IDLE_MS) } },
        });
    } catch (err) {
        console.error('[photon] opprydding av økter feilet', err);
    }
}
