import 'server-only'

import type { DiscoveredBusiness, SiteEvaluationResult, SiteIssue } from './types'

export interface SiteEvaluatorOptions {
  fetchFn?: typeof fetch
  now?: () => number
  currentYear?: number
  timeoutMs?: number
  checkContactFallback?: boolean
}

const DEFAULT_TIMEOUT_MS = 8_000
const MAX_HTML_BYTES = 512 * 1024
const SLOW_TTFB_THRESHOLD_MS = 2_500
const THIN_CONTENT_MIN_CHARS = 120
const PLACEHOLDER_CONTENT_MAX_CHARS = 300

const EMAIL_VALIDATION_REGEX = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/
const EMAIL_SCAN_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}/g

const BLOCKED_EMAIL_DOMAINS = new Set([
  'sentry.io',
  'wixpress.com',
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'domain.com',
  'email.com',
  'yoursite.com',
  'yourdomain.com',
  'w3.org',
  'schema.org',
  'googleapis.com',
  'googleusercontent.com',
  'gstatic.com',
  'gravatar.com',
])

const BLOCKED_ASSET_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.avif',
  '.ico',
  '.css',
  '.js',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.map',
  '.mp4',
]

const BLOCKED_LOCAL_PARTS = new Set([
  'noreply',
  'no-reply',
  'donotreply',
  'do-not-reply',
  'mailer-daemon',
  'postmaster',
  'bounce',
  'notifications',
])

const PREFERRED_LOCAL_PREFIXES = [
  'info',
  'hello',
  'contact',
  'sales',
  'office',
  'support',
  'admin',
]

const LEGACY_BUILDER_HOSTS = [
  'wixsite.com',
  'weebly.com',
  'blogspot.com',
  'sites.google.com',
]

function sanitizeCandidateEmail(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string') return null
  const cleaned = raw.trim().toLowerCase()
  if (!cleaned || cleaned.length > 180 || cleaned.includes('\0')) return null
  if (!EMAIL_VALIDATION_REGEX.test(cleaned)) return null
  if (isNoiseEmail(cleaned)) return null
  return cleaned
}

function isNoiseEmail(email: string): boolean {
  const atIdx = email.indexOf('@')
  if (atIdx <= 0) return true

  const localPart = email.slice(0, atIdx)
  const domain = email.slice(atIdx + 1)

  if (BLOCKED_LOCAL_PARTS.has(localPart)) return true
  if (/^[0-9a-f]{24,}$/i.test(localPart)) return true
  if (BLOCKED_ASSET_EXTENSIONS.some((ext) => domain.endsWith(ext))) return true

  for (const blocked of BLOCKED_EMAIL_DOMAINS) {
    if (domain === blocked || domain.endsWith(`.${blocked}`)) {
      return true
    }
  }

  return false
}

export function normalizeWebsiteUrl(rawUrl: string | null | undefined): string | null {
  if (typeof rawUrl !== 'string') return null
  const trimmed = rawUrl.trim()
  if (!trimmed || /\s/.test(trimmed)) return null

  if (/^(mailto|tel|sms|javascript|data|about|file):/i.test(trimmed)) {
    return null
  }

  let candidate: string
  if (trimmed.startsWith('//')) {
    candidate = `https:${trimmed}`
  } else if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    if (!/^https?:\/\//i.test(trimmed)) return null
    candidate = trimmed
  } else {
    if (!trimmed.includes('.')) return null
    candidate = `https://${trimmed}`
  }

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    const host = parsed.hostname.toLowerCase()
    if (!host || !host.includes('.')) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function registrableBase(host: string): string {
  const clean = host.toLowerCase().replace(/^www\./, '')
  const parts = clean.split('.')
  if (parts.length <= 2) return clean
  return parts.slice(-2).join('.')
}

export function extractPublicEmails(html: string, siteHostname?: string | null): string[] {
  if (!html) return []

  const candidates = new Set<string>()

  // 1. mailto: links
  const mailtoRegex = /href\s*=\s*["']mailto:([^"'?#\s]+)["']/gi
  let match: RegExpExecArray | null
  while ((match = mailtoRegex.exec(html)) !== null) {
    const decoded = safeDecode(match[1]).trim().toLowerCase()
    const clean = sanitizeCandidateEmail(decoded)
    if (clean) candidates.add(clean)
  }

  // 2. Visible / raw email occurrences
  const rawMatches = html.match(EMAIL_SCAN_REGEX) ?? []
  for (const raw of rawMatches) {
    const clean = sanitizeCandidateEmail(raw)
    if (clean) candidates.add(clean)
  }

  const normalizedSiteHost = siteHostname?.toLowerCase().replace(/^www\./, '') ?? null
  const siteBase = normalizedSiteHost ? registrableBase(normalizedSiteHost) : null

  return Array.from(candidates).sort((a, b) => {
    const scoreEmail = (email: string): number => {
      const [local, domain] = email.split('@')
      let score = 0
      if (normalizedSiteHost && (domain === normalizedSiteHost || registrableBase(domain) === siteBase)) {
        score += 100
      }
      const prefixIdx = PREFERRED_LOCAL_PREFIXES.indexOf(local)
      if (prefixIdx !== -1) {
        score += 20 - prefixIdx
      }
      return score
    }
    return scoreEmail(b) - scoreEmail(a)
  })
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (!match) return null
  const cleaned = match[1].replace(/\s+/g, ' ').trim()
  return cleaned.length > 0 ? cleaned.slice(0, 200) : null
}

function hasMetaContent(html: string, metaName: string): boolean {
  const escaped = metaName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const nameFirst = new RegExp(
    `<meta[^>]*\\bname\\s*=\\s*["']${escaped}["'][^>]*\\bcontent\\s*=\\s*["']([^"']*)["'][^>]*>`,
    'i',
  )
  const contentFirst = new RegExp(
    `<meta[^>]*\\bcontent\\s*=\\s*["']([^"']*)["'][^>]*\\bname\\s*=\\s*["']${escaped}["'][^>]*>`,
    'i',
  )

  const match = html.match(nameFirst) ?? html.match(contentFirst)
  return Boolean(match && match[1].trim().length > 0)
}

function extractMetaContent(html: string, metaName: string): string | null {
  const escaped = metaName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const nameFirst = new RegExp(
    `<meta[^>]*\\bname\\s*=\\s*["']${escaped}["'][^>]*\\bcontent\\s*=\\s*["']([^"']*)["'][^>]*>`,
    'i',
  )
  const contentFirst = new RegExp(
    `<meta[^>]*\\bcontent\\s*=\\s*["']([^"']*)["'][^>]*\\bname\\s*=\\s*["']${escaped}["'][^>]*>`,
    'i',
  )

  const match = html.match(nameFirst) ?? html.match(contentFirst)
  return match ? match[1].trim() : null
}

function hasViewportMeta(html: string): boolean {
  return /<meta[^>]*\bname\s*=\s*["']viewport["'][^>]*>/i.test(html)
}

function extractVisibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function detectLegacySignals(
  html: string,
  finalUrl: string,
  hasViewport: boolean,
  currentYear: number,
): string[] {
  const signals: string[] = []
  const lowerUrl = finalUrl.toLowerCase()
  const lowerHtml = html.toLowerCase()

  for (const host of LEGACY_BUILDER_HOSTS) {
    if (lowerUrl.includes(host) || lowerHtml.includes(host)) {
      signals.push(`Hosted on legacy builder (${host})`)
      break
    }
  }

  const generator = extractMetaContent(html, 'generator')
  if (
    generator &&
    /(?:frontpage|dreamweaver|mshtml|iweb|wix\.com website builder|joomla!\s*[12]\.|wordpress\s*[1-4]\.)/i.test(
      generator,
    )
  ) {
    signals.push(`Legacy generator (${generator.slice(0, 80)})`)
  }

  const tableMatches = html.match(/<table\b/gi)
  if (
    !hasViewport &&
    tableMatches &&
    tableMatches.length >= 4 &&
    /\b(?:cellpadding|cellspacing)\b/i.test(html)
  ) {
    signals.push('Legacy HTML table layout without viewport')
  }

  const copyrightRegex =
    /(?:©|&copy;|copyright)\s*(19\d{2}|20\d{2})(?:\s*[-–—]\s*(19\d{2}|20\d{2}))?/gi
  let latestYear: number | null = null
  let cpMatch: RegExpExecArray | null
  while ((cpMatch = copyrightRegex.exec(html)) !== null) {
    const y1 = Number(cpMatch[1])
    const y2 = cpMatch[2] ? Number(cpMatch[2]) : y1
    const candidateYear = Math.max(y1, y2)
    if (candidateYear >= 1990 && candidateYear <= currentYear + 1) {
      if (latestYear === null || candidateYear > latestYear) {
        latestYear = candidateYear
      }
    }
  }

  if (latestYear !== null && latestYear <= currentYear - 3) {
    signals.push(`Outdated copyright year (${latestYear})`)
  }

  return signals
}

async function readBoundedText(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  if (contentType && !contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
    return ''
  }

  const raw = await response.text()
  return raw.length > MAX_HTML_BYTES ? raw.slice(0, MAX_HTML_BYTES) : raw
}

function collectContactCandidateUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = []
  const seen = new Set<string>()
  let baseParsed: URL
  try {
    baseParsed = new URL(baseUrl)
  } catch {
    return []
  }

  const hrefRegex = /href\s*=\s*["']([^"'#]+)["']/gi
  let match: RegExpExecArray | null
  while ((match = hrefRegex.exec(html)) !== null) {
    const rawHref = match[1].trim()
    if (!rawHref || /^(mailto|tel|javascript|data):/i.test(rawHref)) continue
    if (!/(?:contact|about)/i.test(rawHref)) continue

    try {
      const resolved = new URL(rawHref, baseParsed)
      if (resolved.origin !== baseParsed.origin) continue
      if (resolved.pathname === baseParsed.pathname) continue
      const normalized = resolved.toString()
      if (!seen.has(normalized)) {
        seen.add(normalized)
        urls.push(normalized)
      }
    } catch {
      // ignore invalid href
    }

    if (urls.length >= 2) break
  }

  if (urls.length === 0) {
    urls.push(`${baseParsed.origin}/contact`, `${baseParsed.origin}/about`)
  }

  return urls.slice(0, 2)
}

function clampScore(total: number): number {
  return Math.min(100, Math.max(0, Math.round(total)))
}

export async function evaluateWebsite(
  business: DiscoveredBusiness,
  minIssueScore = 30,
  options?: SiteEvaluatorOptions,
): Promise<SiteEvaluationResult> {
  const fetchFn = options?.fetchFn ?? globalThis.fetch
  const now = options?.now ?? (() => Date.now())
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const checkContactFallback = options?.checkContactFallback ?? true

  const listingEmail = sanitizeCandidateEmail(business.contactEmail)
  const targetUrl = normalizeWebsiteUrl(business.websiteUrl)

  if (!targetUrl) {
    const issue: SiteIssue = {
      code: 'no_website',
      label: 'No website URL listed',
      severity: 'critical',
      points: 90,
    }
    return {
      hasWebsite: false,
      qualified: issue.points >= minIssueScore,
      issueScore: issue.points,
      issues: [issue],
      extractedEmail: listingEmail,
      httpStatus: null,
      ttfbMs: null,
      finalUrl: null,
      title: null,
    }
  }

  const startMs = now()
  const currentYear = options?.currentYear ?? new Date(startMs).getUTCFullYear()
  let response: Response

  try {
    response = await fetchFn(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; VirtueCoSiteAudit/1.0; +https://virtuecowebworks.solutions)',
        Accept: 'text/html,application/xhtml+xml',
      },
    })
  } catch (err) {
    const ttfbMs = Math.max(0, Math.round(now() - startMs))
    const detail = err instanceof Error ? err.message.slice(0, 480) : 'Connection failed'
    const issue: SiteIssue = {
      code: 'unreachable',
      label: 'Website is unreachable or timed out',
      severity: 'critical',
      points: 80,
      detail,
    }
    return {
      hasWebsite: true,
      qualified: issue.points >= minIssueScore,
      issueScore: issue.points,
      issues: [issue],
      extractedEmail: listingEmail,
      httpStatus: null,
      ttfbMs,
      finalUrl: null,
      title: null,
    }
  }

  const ttfbMs = Math.max(0, Math.round(now() - startMs))
  const finalUrl = response.url && response.url.length > 0 ? response.url : targetUrl
  const httpStatus = response.status
  const issues: SiteIssue[] = []

  if (httpStatus >= 400) {
    issues.push({
      code: 'http_error',
      label: `Website returned HTTP ${httpStatus}`,
      severity: httpStatus >= 500 ? 'critical' : 'high',
      points: 75,
      detail: `HTTP ${httpStatus}`,
    })
  }

  if (!finalUrl.toLowerCase().startsWith('https://')) {
    issues.push({
      code: 'no_https',
      label: 'Site is not served over HTTPS',
      severity: 'high',
      points: 25,
      detail: finalUrl.slice(0, 480),
    })
  }

  if (ttfbMs > SLOW_TTFB_THRESHOLD_MS) {
    issues.push({
      code: 'slow_ttfb',
      label: 'Slow initial server response (>2.5s TTFB)',
      severity: 'medium',
      points: 20,
      detail: `${ttfbMs}ms`,
    })
  }

  let html = ''
  try {
    html = await readBoundedText(response)
  } catch {
    html = ''
  }

  let title: string | null = null
  let siteHostname: string | null = null
  try {
    siteHostname = new URL(finalUrl).hostname
  } catch {
    siteHostname = null
  }

  let extractedEmails = html ? extractPublicEmails(html, siteHostname) : []

  if (html) {
    title = extractTitle(html)
    if (!title) {
      issues.push({
        code: 'missing_title',
        label: 'Missing or empty page <title>',
        severity: 'medium',
        points: 15,
      })
    }

    if (!hasMetaContent(html, 'description')) {
      issues.push({
        code: 'missing_meta_description',
        label: 'Missing SEO meta description',
        severity: 'low',
        points: 10,
      })
    }

    const hasViewport = hasViewportMeta(html)
    if (!hasViewport) {
      issues.push({
        code: 'missing_viewport',
        label: 'Missing mobile viewport meta tag',
        severity: 'high',
        points: 25,
      })
    }

    const legacySignals = detectLegacySignals(html, finalUrl, hasViewport, currentYear)
    if (legacySignals.length > 0) {
      issues.push({
        code: 'legacy_builder',
        label: 'Outdated design or legacy website builder footprint',
        severity: 'medium',
        points: 25,
        detail: legacySignals.join('; ').slice(0, 480),
      })
    }

    if (response.ok) {
      const visibleText = extractVisibleText(html)
      const isPlaceholder = /(?:coming soon|under construction|parked domain)/i.test(visibleText)
      if (
        visibleText.length < THIN_CONTENT_MIN_CHARS ||
        (isPlaceholder && visibleText.length < PLACEHOLDER_CONTENT_MAX_CHARS)
      ) {
        issues.push({
          code: 'thin_content',
          label: 'Thin or placeholder website content',
          severity: 'medium',
          points: 20,
          detail: `${visibleText.length} visible characters`,
        })
      }
    }
  }

  if (response.ok && extractedEmails.length === 0 && checkContactFallback && html) {
    const fallbackUrls = collectContactCandidateUrls(html, finalUrl)
    const fallbackTimeout = Math.min(timeoutMs, 4_000)

    for (const candidateUrl of fallbackUrls) {
      try {
        const subRes = await fetchFn(candidateUrl, {
          method: 'GET',
          redirect: 'follow',
          signal: AbortSignal.timeout(fallbackTimeout),
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; VirtueCoSiteAudit/1.0; +https://virtuecowebworks.solutions)',
            Accept: 'text/html,application/xhtml+xml',
          },
        })
        if (!subRes.ok) continue
        const subHtml = await readBoundedText(subRes)
        if (!subHtml) continue
        const subEmails = extractPublicEmails(subHtml, siteHostname)
        if (subEmails.length > 0) {
          extractedEmails = subEmails
          break
        }
      } catch {
        // swallow secondary contact page errors
      }
    }
  }

  const issueScore = clampScore(issues.reduce((sum, item) => sum + item.points, 0))
  const extractedEmail = extractedEmails[0] ?? listingEmail

  return {
    hasWebsite: true,
    qualified: issueScore >= minIssueScore,
    issueScore,
    issues,
    extractedEmail,
    httpStatus,
    ttfbMs,
    finalUrl,
    title,
  }
}
