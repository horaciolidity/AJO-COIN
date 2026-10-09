// Utility to process sprite images and remove solid/checkerboard backgrounds, making character sprites 100% transparent.

const TRANSPARENT_SPRITE_CACHE: Map<string, string> = new Map();

/**
 * Removes background pixels (checkerboards, solid white/black/gray background boxes)
 * from a sprite image and returns a transparent PNG Data URL.
 */
export function getTransparentSpriteDataUrl(imgElement: HTMLImageElement): string {
  if (!imgElement || !imgElement.complete || imgElement.naturalWidth === 0) {
    return imgElement?.src || '';
  }

  const src = imgElement.src;
  if (TRANSPARENT_SPRITE_CACHE.has(src)) {
    return TRANSPARENT_SPRITE_CACHE.get(src)!;
  }

  try {
    const canvas = document.createElement('canvas');
    const width = imgElement.naturalWidth;
    const height = imgElement.naturalHeight;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return src;

    ctx.drawImage(imgElement, 0, 0);
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Analyze corner pixels to identify background color sample
    const cornerSamples = [
      { r: data[0], g: data[1], b: data[2] },
      { r: data[(width - 1) * 4], g: data[(width - 1) * 4 + 1], b: data[(width - 1) * 4 + 2] },
      { r: data[(height - 1) * width * 4], g: data[(height - 1) * width * 4 + 1], b: data[(height - 1) * width * 4 + 2] },
    ];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Check if pixel matches typical background pattern (checkerboard grays/whites or sample corners)
      const isWhiteGrayGrid =
        (r > 200 && g > 200 && b > 200) || // White / light gray
        (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && r > 170 && r < 240); // Checkerboard gray grid

      const matchesCorner = cornerSamples.some(
        (c) => Math.abs(r - c.r) < 25 && Math.abs(g - c.g) < 25 && Math.abs(b - c.b) < 25
      );

      if (isWhiteGrayGrid || (matchesCorner && (r > 150 || g > 150 || b > 150))) {
        data[i + 3] = 0; // Make pixel completely transparent
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const transparentDataUrl = canvas.toDataURL('image/png');
    TRANSPARENT_SPRITE_CACHE.set(src, transparentDataUrl);
    return transparentDataUrl;
  } catch (e) {
    // Return original src on CORS or canvas errors
    return src;
  }
}
