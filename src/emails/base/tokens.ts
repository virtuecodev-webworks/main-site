/**
 * Virtue & Co. Webworks — Email Design Tokens
 *
 * All email templates import from here so colour / type decisions
 * stay in a single place. Inline-safe hex values only — no CSS variables,
 * which email clients do not reliably support.
 */

/** Brand colours */
export const GOLD = '#DCAA28'
export const GOLD_LIGHT = '#F59E0B'
export const EMERALD = '#14A06C'

/** Dark-mode canvas layers */
export const BG = '#08090C'          // outermost background
export const CARD = '#0F1219'        // card surface
export const WELL = '#141824'        // inner sections / code boxes
export const HEADER_BG = '#0B0E15'  // branded header strip

/** Borders */
export const BORDER = '#1E2534'
export const BORDER_INNER = '#242C3D'

/** Text */
export const TEXT = '#FFFFFF'
export const TEXT_BODY = '#CBD5E1'
export const TEXT_MUTED = '#94A3B8'
export const TEXT_DIM = '#64748B'
export const TEXT_FAINT = '#475569'

/** Typography stack — email-safe */
export const FONT_SANS = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif`
export const FONT_MONO = `'SF Mono',Monaco,Consolas,'Roboto Mono','Courier New',monospace`

/** Hosted brand assets (production CDN) */
export const LOGO_URL = 'https://virtuecowebworks.solutions/brand/logo-mark.png'
export const PHOTO_STUDIO = 'https://virtuecowebworks.solutions/media/photos/studio.jpg'
export const PHOTO_HERO = 'https://virtuecowebworks.solutions/media/photos/hero.jpg'
export const PHOTO_SERVICES = 'https://virtuecowebworks.solutions/media/photos/services.jpg'
export const PHOTO_COLLABORATION = 'https://virtuecowebworks.solutions/media/photos/collaboration.jpg'
export const PHOTO_PROCESS = 'https://virtuecowebworks.solutions/media/photos/process.jpg'

/** Site URLs */
export const SITE = 'https://virtuecowebworks.solutions'
export const PORTAL = `${SITE}/portal`
export const CONTACT = `${SITE}/contact`
export const UNSUBSCRIBE = `${SITE}/unsubscribe`
export const PRIVACY = `${SITE}/privacy`
