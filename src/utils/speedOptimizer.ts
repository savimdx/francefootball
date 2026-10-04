import { loadedImageGlobalCache } from '../components/OptimizedImage';

// In-memory cache to keep decoded image instances alive and hot in browser RAM
const imageMemoryCache = new Map<string, HTMLImageElement>();

export const PRIORITY_IMAGES = [
  '/images/hero_pack.webp',
  '/images/sample_1.webp',
  '/images/sample_2.webp',
  '/images/bono_zidane.webp',
  '/images/bono_neymar.webp',
  '/images/bono_prep_physique.webp'
];

export const SECONDARY_IMAGES = [
  '/images/sample_3.webp',
  '/images/sample_4.webp',
  '/images/sample_5.webp',
  '/images/bono_mourinho.webp',
  '/images/bono_guardiola.webp',
  '/images/bono_250_fiches.webp',
  '/images/bono_50_physique.webp',
  '/images/bono_100_vitesse.webp',
  '/images/bono_gardiens.webp',
  '/images/bono_petit_materiel.webp',
  '/images/bono_videos_football.webp',
  '/images/bono_10_semaines_sans_fond.webp',
  '/images/bono_10_semaines.webp',
  '/images/bono_pre_saison.webp',
  '/images/bono_entraineur_elite.webp',
  '/images/testimonial_1.webp',
  '/images/testimonial_2.webp',
  '/images/testimonial_3.webp',
  '/images/author.webp'
];

export const ALL_IMAGES = [...PRIORITY_IMAGES, ...SECONDARY_IMAGES];

/**
 * Preload and hardware-decode an image into browser memory
 */
export function preloadImage(src: string): Promise<void> {
  if (!src || typeof window === 'undefined') return Promise.resolve();

  if (imageMemoryCache.has(src) || loadedImageGlobalCache.has(src)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.decoding = 'async';

      const onDone = () => {
        loadedImageGlobalCache.add(src);
        imageMemoryCache.set(src, img);
        if ('decode' in img && typeof img.decode === 'function') {
          img.decode().then(() => resolve()).catch(() => resolve());
        } else {
          resolve();
        }
      };

      img.onload = onDone;
      img.onerror = () => resolve();
      img.src = src;

      if (img.complete && img.naturalWidth > 0) {
        onDone();
      }
    } catch {
      resolve();
    }
  });
}

/**
 * Ultra-fast non-blocking background preloader with parallel HTTP pipeline
 */
export function initSpeedOptimizer(): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Immediately preload top critical images
    PRIORITY_IMAGES.forEach((src) => {
      preloadImage(src);
    });

    // 2. Preload remaining images quickly in parallel
    const preloadRest = () => {
      SECONDARY_IMAGES.forEach((src) => {
        preloadImage(src);
      });
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preloadRest, { timeout: 200 });
    } else {
      setTimeout(preloadRest, 30);
    }
  } catch {
    // Fail gracefully
  }
}
