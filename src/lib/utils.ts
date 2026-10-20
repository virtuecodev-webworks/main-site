import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency without pulling in a heavyweight i18n runtime.
 *
 * Pass `decimals: false` for published round prices (from $100 rather than
 * $100.00). Receipts and ledgers keep the default so amounts are explicit.
 */
export function formatMoney(
  amount: number,
  currency: string,
  locale = 'en-US',
  options: { decimals?: boolean } = {},
) {
  const decimals = options.decimals ?? true
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals ? undefined : 0,
      maximumFractionDigits: decimals ? 2 : 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

/** Short, human-readable transaction reference: VCW-2026-4F9A2C. */
export function createReference(prefix = 'VCW') {
  const year = new Date().getFullYear()
  const rand = globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
  return `${prefix}-${year}-${rand}`
}

export function absoluteUrl(path = '/') {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://virtuecowebworks.solutions'
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function truncate(value: string, length = 120) {
  if (value.length <= length) return value
  return `${value.slice(0, length).trimEnd()}…`
}
