const MAX_SIDE = 1024;
const QUALITY = 0.7;

// Redrawing on a canvas also strips EXIF data such as GPS location.
export async function toWebpDataUrl(file: File): Promise<string> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const webp = canvas.toDataURL('image/webp', QUALITY);
    // Safari can't encode webp and falls back to PNG.
    return webp.startsWith('data:image/webp')
        ? webp
        : canvas.toDataURL('image/jpeg', QUALITY);
}
