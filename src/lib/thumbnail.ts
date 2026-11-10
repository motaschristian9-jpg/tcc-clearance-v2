/**
 * Compresses an image data URL into a tiny thumbnail for offline embedding in QR payloads
 */
export function createCompressedThumbnail(
  dataUrl: string | null | undefined,
  maxDim = 40,
  quality = 0.45
): Promise<string | null> {
  return new Promise((resolve) => {
    if (!dataUrl) return resolve(null);
    // If it's already an HTTP URL, use it directly (tiny length)
    if (dataUrl.startsWith('http')) return resolve(dataUrl);

    if (typeof window === 'undefined') return resolve(dataUrl);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let w = img.naturalWidth || img.width || 40;
          let h = img.naturalHeight || img.height || 40;

          if (w > h) {
            if (w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            }
          } else {
            if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }

          canvas.width = Math.max(16, w);
          canvas.height = Math.max(16, h);
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(dataUrl);

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const thumb = canvas.toDataURL('image/jpeg', quality);
          resolve(thumb);
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch {
      resolve(dataUrl);
    }
  });
}
