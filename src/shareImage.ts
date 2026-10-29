// Turns the story card into a PNG and sends it to the phone's share sheet. Web only.

export type ShareResult = 'shared' | 'downloaded' | 'canceled';

/** Draws the card at its full size (1080 x 1920). A transparent card gives a transparent PNG. */
export async function cardToPng(node: HTMLElement): Promise<Blob> {
  // Wait for the logo and the photo. A card drawn before they load shows empty spaces.
  // Images far off screen can wait for ever when the browser loads them lazily, so ask for them at once and stop waiting after 2 seconds.
  const images = Array.from(node.querySelectorAll('img'));
  await Promise.all(images.map(img => {
    img.loading = 'eager';
    if (img.complete) return null;
    return new Promise(done => { img.onload = img.onerror = () => done(null); setTimeout(() => done(null), 2000); });
  }));
  const { toBlob } = await import('html-to-image');
  const blob = await toBlob(node, { pixelRatio: 1, cacheBust: true, width: 1080, height: 1920 });
  if (!blob) throw new Error('The card could not be drawn');
  return blob;
}

export function downloadPng(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Opens the share sheet with the image. The person picks Instagram there.
 * A web page cannot open the Instagram story screen by itself.
 * When the browser has no file sharing (a laptop), the image downloads instead.
 * Call this straight from a tap, with the PNG already made. Some phones refuse a share that starts late.
 */
export async function sharePng(blob: Blob, name: string): Promise<ShareResult> {
  const file = new File([blob], name, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file] });
      return 'shared';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'canceled';
    }
  }
  downloadPng(blob, name);
  return 'downloaded';
}
