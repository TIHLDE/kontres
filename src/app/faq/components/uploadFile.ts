export async function uploadFile(file: Blob, token: string) {
    if (!file) throw new Error('Invalid file.');

    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${process.env.NEXT_PUBLIC_LEPTON_API_URL}/upload/`, {
        method: 'POST',
        body: formData,
        headers: { 'x-csrf-token': token },
    });
}

export async function getImageUrl(file: Blob, token: string) {
    const response = (await uploadFile(file, token).then((res) =>
        res.json(),
    )) as FileUploadResponse;

    return response.url;
}

type FileUploadResponse = { url: string };
