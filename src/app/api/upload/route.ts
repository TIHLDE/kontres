import { auth } from '@/auth';
import { photonFetch, photonUrl } from '@/server/services/photon/client';
import { getValidAccessToken } from '@/server/services/photon/session';
import { NextResponse } from 'next/server';

/**
 * Filopplasting via Photon.
 *
 * Går gjennom vår egen rute for å slippe CORS og for å bruke tokenet fra
 * server-sesjonen i stedet for å gi det til nettleseren.
 *
 * To ting skiller Photon fra Lepton her. Tokenet er en vanlig bearer, ikke
 * `x-csrf-token`. Og en opplasting ligger som «staged»: Photon sletter den
 * etter to døgn med mindre noen sier fra at den er tatt i bruk. Denne appen
 * lagrer URL-en i sin egen base, som Photon ikke kan se inn i, så vi må
 * promotere selv — ellers forsvinner bildet et par dager etter at det ble lagt
 * inn, uten spor noe sted.
 */

export async function POST(req: Request) {
    const session = await auth();
    const tokens = session?.photonSessionId
        ? await getValidAccessToken(session.photonSessionId)
        : null;

    if (!tokens) {
        return NextResponse.json(
            { error: 'Du må være logget inn for å laste opp' },
            { status: 401 },
        );
    }

    const accessToken = tokens.accessToken;

    let formData: FormData;
    try {
        formData = await req.formData();
    } catch {
        return NextResponse.json(
            { error: 'Ugyldig forespørsel' },
            { status: 400 },
        );
    }

    const file = formData.get('file');
    if (!file || !(file instanceof Blob)) {
        return NextResponse.json({ error: 'Mangler fil' }, { status: 400 });
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const uploadRes = await photonFetch(photonUrl('/api/assets'), {
        method: 'POST',
        body: uploadFormData,
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    const body = (await uploadRes.json().catch(() => ({}))) as {
        key?: string;
    };

    if (!uploadRes.ok) {
        console.error('[upload] Photon error:', uploadRes.status, body);
        return NextResponse.json(
            { error: 'Opplasting feilet', details: body },
            { status: uploadRes.status },
        );
    }

    if (!body.key) {
        console.error('[upload] Photon returned no key:', body);
        return NextResponse.json(
            { error: 'Opplasting feilet' },
            { status: 502 },
        );
    }

    // Uten dette rydder Photons opprydningsjobb bort filen om to døgn.
    const promoteRes = await photonFetch(
        photonUrl(`/api/assets/promote/${body.key}`),
        {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
        },
    );

    if (!promoteRes.ok) {
        console.error(
            '[upload] promote failed:',
            promoteRes.status,
            await promoteRes.text().catch(() => ''),
        );
        return NextResponse.json(
            {
                error: 'Bildet ble lastet opp, men kunne ikke lagres permanent. Prøv igjen.',
            },
            { status: 502 },
        );
    }

    return NextResponse.json({
        key: body.key,
        url: photonUrl(`/api/assets/${body.key}`),
    });
}
