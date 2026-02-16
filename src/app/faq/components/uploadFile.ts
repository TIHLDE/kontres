/**
 * Upload goes through our API route to avoid CORS and to use the server session token.
 */
export async function uploadFile(file: Blob, _token?: string) {
    if (!file) throw new Error('Invalid file.');

    const formData = new FormData();
    formData.append('file', file);

    return fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });
}

export async function getImageUrl(file: Blob, token?: string) {
    const res = await uploadFile(file, token);
    const response = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
        console.error('[uploadFile] Lepton upload failed:', res.status, response);
        throw new Error(
            `Upload failed: ${res.status} ${JSON.stringify(response)}`,
        );
    }

    // Lepton may return url, file, or file_url - support all
    const url =
        typeof response.url === 'string'
            ? response.url
            : typeof response.file === 'string'
              ? response.file
              : typeof (response as { file_url?: string }).file_url === 'string'
                ? (response as { file_url: string }).file_url
                : '';

    console.log('[uploadFile] Lepton response:', JSON.stringify(response));
    console.log('[uploadFile] Image URL we will store:', url || '(empty)');

    return url || undefined;
}
