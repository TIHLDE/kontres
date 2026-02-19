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

    // Convert blob to buffer for more reliable transmission in production
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file instanceof File && file.name 
        ? file.name 
        : `upload.${file.type.split('/')[1] || 'bin'}`;
    
    // Create a new Blob with the buffer to ensure consistent behavior
    const fileBlob = new Blob([buffer], { type: file.type });

    const uploadFormData = new FormData();
    uploadFormData.append('file', fileBlob, fileName);

    console.log('[upload] Uploading to:', LEPTON_UPLOAD);
    console.log('[upload] File name:', fileName);
    console.log('[upload] File type:', file.type);
    console.log('[upload] File size:', buffer.length);
    console.log('[upload] Has token:', !!token);
    console.log('[upload] Token preview:', token?.substring(0, 20) + '...');

    const leptonRes = await fetch(LEPTON_UPLOAD, {
        method: 'POST',
        body: uploadFormData,
        headers: {
            'x-csrf-token': token,
        },
    });

    console.log('[upload] Lepton response status:', leptonRes.status);
    console.log('[upload] Lepton response headers:', Object.fromEntries(leptonRes.headers.entries()));

    const responseText = await leptonRes.text();
    console.log('[upload] Lepton raw response:', responseText);

    let body;
    try {
        body = JSON.parse(responseText);
    } catch {
        body = { rawResponse: responseText };
    }

    if (!leptonRes.ok) {
        console.error('[upload] Lepton error:', leptonRes.status, body);
        return NextResponse.json(
            { error: 'Opplasting feilet', details: body },
            { status: leptonRes.status },
        );
    }

    return NextResponse.json(body);
}
