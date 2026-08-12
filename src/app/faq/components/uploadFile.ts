/**
 * Upload goes through our API route to avoid CORS and to use the server session
 * token. The route hands the file to Photon and claims it, so the URL below
 * keeps working; see `src/app/api/upload/route.ts`.
 */
export async function uploadFile(file: Blob) {
    if (!file) throw new Error('Invalid file.');

    const formData = new FormData();
    formData.append('file', file);

    return fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });
}

export async function getImageUrl(file: Blob) {
    const res = await uploadFile(file);
    const response = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
        console.error('[uploadFile] Photon upload failed:', res.status, response);
        throw new Error(
            `Upload failed: ${res.status} ${JSON.stringify(response)}`,
        );
    }

    return typeof response.url === 'string' && response.url.length > 0
        ? response.url
        : undefined;
}
