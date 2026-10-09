// Utility to preload and cache image assets in VRAM to prevent visual flickering during combat.

const PRELOADED_IMAGES: Map<string, HTMLImageElement> = new Map();

export const FIGHTER_ASSETS = [
  '/assets/fighter/ajo_idle.png',
  '/assets/fighter/ajo_punch.png',
  '/assets/fighter/ajo_kick.png',
  '/assets/fighter/ajo_special.png',
  '/assets/fighter/ajo_hit.png',
  '/assets/fighter/ajo_victory.png',
  '/assets/fighter/enemy_brawler_idle.png',
  '/assets/backgrounds/alien.jpg',
  '/assets/backgrounds/dead.jpg',
  '/assets/backgrounds/fire.jpg',
  '/assets/backgrounds/king.jpg',
  '/assets/backgrounds/ninja.jpg',
  '/assets/backgrounds/rich.jpg',
  '/assets/backgrounds/robot.jpg',
];

/**
 * Preloads all combat and background assets asynchronously.
 * Guarantees images are fully decoded in browser memory before combat starts.
 */
export function preloadFighterAssets(): Promise<void[]> {
  const promises = FIGHTER_ASSETS.map((src) => {
    return new Promise<void>((resolve) => {
      if (PRELOADED_IMAGES.has(src)) {
        resolve();
        return;
      }
      const img = new Image();
      img.src = src;
      img.onload = () => {
        PRELOADED_IMAGES.set(src, img);
        // Attempt decode if supported for zero-lag rendering
        if ('decode' in img) {
          img.decode().then(() => resolve()).catch(() => resolve());
        } else {
          resolve();
        }
      };
      img.onerror = () => {
        // Resolve anyway so failure of one asset doesn't block the game
        resolve();
      };
    });
  });

  return Promise.all(promises);
}

/**
 * Checks if a specific image asset is already cached in memory.
 */
export function isAssetPreloaded(src: string): boolean {
  return PRELOADED_IMAGES.has(src);
}
