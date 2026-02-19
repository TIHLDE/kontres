import { auth } from '@/auth';
import { env } from '@/env';
import { NextResponse } from 'next/server';

const LEPTON_UPLOAD = `${env.LEPTON_API_URL}/upload/`;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const session = await auth();
    const token = (session?.user as { TIHLDE_Token?: string } | undefined)
        ?.TIHLDE_Token;

    if (!token) {
        return NextResponse.json(
            { error: 'Du må være logget inn for å laste opp' },
            { status: 401 },
        );
    }

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
        return NextResponse.json(
            { error: 'Mangler fil' },
            { status: 400 },
        );
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const leptonRes = await fetch(LEPTON_UPLOAD, {
        method: 'POST',
        body: uploadFormData,
        headers: {
            'x-csrf-token': token,
        },
    });

    const body = await leptonRes.json().catch(() => ({}));

    if (!leptonRes.ok) {
        console.error('[upload] Lepton error:', leptonRes.status, body);
        return NextResponse.json(
            { error: 'Opplasting feilet', details: body },
            { status: leptonRes.status },
        );
    }

    return NextResponse.json(body);
}
