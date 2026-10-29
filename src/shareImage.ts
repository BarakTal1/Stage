// Turns the story card into a PNG and sends it to the phone's share sheet. Web only.

export type ShareResult = 'shared' | 'downloaded' | 'canceled';

/** Loads a picture from a link and waits for the load event. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((done, fail) => {
    const img = new Image();
    img.onload = () => done(img);
    img.onerror = () => fail(new Error('The picture could not be read'));
    img.src = src;
  });
}

export type CardBackground = { uri: string; dim: boolean };

/**
 * Draws the card at its full size (1080 x 1920). A transparent card gives a transparent PNG.
 * With `bg`, the photo is drawn on a canvas first and the card goes on top.
 * The card drawing library leaves out the layer marked data-export-bg. Some phone browsers do not draw a photo inside it, so the PNG came out black in Instagram.
 */
export async function cardToPng(node: HTMLElement, bg?: CardBackground): Promise<Blob> {
  // Wait for the logo and the photo. A card drawn before they load shows empty spaces.
  // Images far off screen can wait for ever when the browser loads them lazily, so ask for them at once and stop waiting after 2 seconds.
  const images = Array.from(node.querySelectorAll('img'));
  await Promise.all(images.map(img => {
    img.loading = 'eager';
    if (img.complete) return null;
    return new Promise(done => { img.onload = img.onerror = () => done(null); setTimeout(() => done(null), 2000); });
  }));
  const { toBlob } = await import('html-to-image');
  const options = {
    pixelRatio: 1, cacheBust: true, width: 1080, height: 1920,
    filter: (n: Node) => !(n as HTMLElement).dataset?.exportBg,
  };
  // Safari draws the images of the first picture empty. The second picture is complete.
  await toBlob(node, options);
  const layer = await toBlob(node, options);
  if (!layer) throw new Error('The card could not be drawn');
  if (!bg) return layer;

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('The canvas is not available');
  const photo = await loadImage(bg.uri);
  // Fill the card and cut the edges, like "cover" does.
  const scale = Math.max(1080 / photo.naturalWidth, 1920 / photo.naturalHeight);
  const w = photo.naturalWidth * scale, h = photo.naturalHeight * scale;
  ctx.drawImage(photo, (1080 - w) / 2, (1920 - h) / 2, w, h);
  if (bg.dim) { ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, 1080, 1920); }
  const url = URL.createObjectURL(layer);
  try { ctx.drawImage(await loadImage(url), 0, 0, 1080, 1920); } finally { URL.revokeObjectURL(url); }
  const out = await new Promise<Blob | null>(done => canvas.toBlob(done, 'image/png'));
  if (!out) throw new Error('The card could not be drawn');
  return out;
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

/**
 * Makes a picked photo smaller and returns it as a data link. Web only.
 * A phone photo can be 12 megapixels, and the card is 1080 x 1920, so 2200 pixels on the long side is enough.
 * The data link matters: the card drawing library cannot read a "blob:" link and fails with an empty error.
 */
export async function shrinkImage(uri: string, maxSide = 2200): Promise<string> {
  const img = new Image();
  // The load event, not decode(): decode() waits for a screen frame and stalls in a background tab.
  await new Promise((done, fail) => { img.onload = () => done(null); img.onerror = () => fail(new Error('The photo could not be read')); img.src = uri; });
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.9);
}
