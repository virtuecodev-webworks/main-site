/**
 * Photography manifest.
 *
 * Every image is a real, locally-stored file under `public/media/photos`, so
 * `next/image` can optimise it at build/request time with no third-party
 * dependency at runtime. Paths are centralised here so a photo can be swapped
 * in one place instead of scattered across components.
 *
 * Alt text lives in the message catalogue (`src/messages/*.json`) because it is
 * copy; this file only owns the asset locations.
 */
export const PHOTOS = {
  hero: '/media/photos/hero.jpg',
  studio: '/media/photos/studio.jpg',
  collaboration: '/media/photos/collaboration.jpg',
  services: '/media/photos/services.jpg',
  workBand: '/media/photos/work-band.jpg',
  contact: '/media/photos/workstation.jpg',
  process: '/media/photos/process.jpg',
  heroAlt: '/media/photos/hero-alt.jpg',
  blog: {
    performance: '/media/photos/blog-performance.jpg',
    payments: '/media/photos/blog-payments.jpg',
    cms: '/media/photos/blog-cms.jpg',
    studio: '/media/photos/blog-studio.jpg',
  },
} as const
