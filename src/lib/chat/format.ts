export interface ChatAttachment {
  id: string
  name: string
  size: number
  type: string
  dataUrl?: string
}

export interface ChatLink {
  title: string
  url: string
  category?: 'staging' | 'figma' | 'github' | 'drive' | 'loom' | 'other'
}

export interface ChatProgressReport {
  sprint: string
  percent: number
  deliverables: string[]
  nextSteps?: string
  stagingUrl?: string
}

export interface ParsedMessage {
  text: string
  report: ChatProgressReport | null
  links: ChatLink[]
  attachments: ChatAttachment[]
}

const META_START = '<!--VCW_CHAT_PAYLOAD_START-->'
const META_END = '<!--VCW_CHAT_PAYLOAD_END-->'

/**
 * Format message body with metadata block for attachments, links, and progress report.
 */
export function encodeChatMessage({
  text,
  report,
  links,
  attachments,
}: {
  text: string
  report?: ChatProgressReport | null
  links?: ChatLink[]
  attachments?: ChatAttachment[]
}): string {
  const cleanText = text.trim()
  const hasMeta = (report && report.sprint) || (links && links.length > 0) || (attachments && attachments.length > 0)

  if (!hasMeta) return cleanText

  const payload = {
    report: report || null,
    links: links || [],
    attachments: (attachments || []).map((att) => ({
      id: att.id,
      name: att.name,
      size: att.size,
      type: att.type,
      dataUrl: att.dataUrl,
    })),
  }

  return `${cleanText}\n\n${META_START}\n${JSON.stringify(payload)}\n${META_END}`
}

/**
 * Parse raw message body to extract text, structured progress report, links, and attachments.
 * Also parses markdown links and classic [PROGRESS REPORT] markers for backward compatibility.
 */
export function parseChatMessage(rawBody: string): ParsedMessage {
  if (!rawBody) {
    return { text: '', report: null, links: [], attachments: [] }
  }

  // 1. Check for VCW_CHAT_PAYLOAD block
  if (rawBody.includes(META_START) && rawBody.includes(META_END)) {
    const startIndex = rawBody.indexOf(META_START)
    const endIndex = rawBody.indexOf(META_END)

    const textPart = rawBody.slice(0, startIndex).trim()
    const jsonPart = rawBody.slice(startIndex + META_START.length, endIndex).trim()

    try {
      const payload = JSON.parse(jsonPart)
      return {
        text: textPart,
        report: payload.report ?? null,
        links: payload.links ?? [],
        attachments: payload.attachments ?? [],
      }
    } catch {
      // Fallback to text parsing
    }
  }

  // 2. Check for legacy/markdown-based [PROGRESS REPORT]
  let report: ChatProgressReport | null = null
  let extractedText = rawBody
  const links: ChatLink[] = []
  const attachments: ChatAttachment[] = []

  if (rawBody.includes('[PROGRESS REPORT]') || rawBody.includes('PROGRESS REPORT:')) {
    const lines = rawBody.split('\n')
    let sprint = 'Milestone Sprint'
    let percent = 50
    const deliverables: string[] = []
    let nextSteps = ''
    let stagingUrl = ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('Sprint:') || trimmed.startsWith('Phase:') || trimmed.startsWith('Milestone:')) {
        sprint = trimmed.replace(/^(Sprint|Phase|Milestone):\s*/i, '')
      } else if (trimmed.toLowerCase().includes('%') && trimmed.toLowerCase().includes('progress')) {
        const match = trimmed.match(/(\d+)%/)
        if (match) percent = parseInt(match[1], 10)
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        deliverables.push(trimmed.slice(2).trim())
      } else if (trimmed.toLowerCase().startsWith('next:') || trimmed.toLowerCase().startsWith('next steps:')) {
        nextSteps = trimmed.replace(/^next(\s*steps)?:\s*/i, '')
      } else if (trimmed.toLowerCase().includes('staging:') || trimmed.toLowerCase().includes('preview:')) {
        const urlMatch = trimmed.match(/https?:\/\/[^\s)]+/)
        if (urlMatch) stagingUrl = urlMatch[0]
      }
    }

    report = {
      sprint,
      percent,
      deliverables: deliverables.length ? deliverables : ['Sprint deliverables initiated', 'Core architecture in place'],
      nextSteps,
      stagingUrl,
    }
  }

  // 3. Extract any markdown links or HTTP URLs in the text
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
  let match: RegExpExecArray | null
  while ((match = linkRegex.exec(rawBody)) !== null) {
    const title = match[1]
    const url = match[2]
    const lower = url.toLowerCase()
    let category: ChatLink['category'] = 'other'
    if (lower.includes('figma.com')) category = 'figma'
    else if (lower.includes('github.com')) category = 'github'
    else if (lower.includes('drive.google.com')) category = 'drive'
    else if (lower.includes('loom.com')) category = 'loom'
    else if (lower.includes('staging') || lower.includes('vercel.app')) category = 'staging'

    links.push({ title, url, category })
  }

  return {
    text: extractedText,
    report,
    links,
    attachments,
  }
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
