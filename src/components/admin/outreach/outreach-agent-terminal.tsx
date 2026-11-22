'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Flame,
  Globe,
  Layers,
  Mail,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Radar,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserCheck,
  X,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export type AgentPhase =
  | 'thought'
  | 'scout'
  | 'evaluate'
  | 'qualify'
  | 'synthesize'
  | 'dispatch'
  | 'cycle'
  | 'safeguard'
  | 'success'
  | 'error'

export interface AgentLogItem {
  id: string
  timestamp: string
  phase: AgentPhase
  text: string
  detail?: string
  status?: 'active' | 'success' | 'warning' | 'error' | 'info'
}

export interface OutreachAgentTerminalProps {
  isOpen: boolean
  onClose: () => void
  onStop: () => void
  isStopping?: boolean
  mode: 'manual' | 'dry_run'
  targetGoal: number
  totalSent: number
  totalScouted: number
  totalQualified: number
  currentCycle: number
  currentNiche?: string
  logs: AgentLogItem[]
  dispatches: Array<{
    businessName: string
    recipientEmail: string
    status: string
    subject: string
    isDryRun: boolean
    snippet?: string
  }>
  status:
    | 'idle'
    | 'scouting'
    | 'evaluating'
    | 'synthesizing'
    | 'dispatching'
    | 'cycling'
    | 'completed'
    | 'stopped'
    | 'failed'
  errorMessage?: string | null
  onRetry?: () => void
}

/**
 * Gemini Iconic 4-Point Concave Sparkle SVG with gold iridescent gradient
 */
export function GeminiSparkle({
  className = 'size-5',
  animate = true,
}: {
  className?: string
  animate?: boolean
}) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      animate={
        animate
          ? {
              rotate: [0, 4, -4, 0],
              scale: [1, 1.06, 0.98, 1],
            }
          : undefined
      }
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <defs>
        <linearGradient id="geminiGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="40%" stopColor="#E5B842" />
          <stop offset="75%" stopColor="#C99414" />
          <stop offset="100%" stopColor="#8C6308" />
        </linearGradient>
        <radialGradient id="geminiAuraGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E5B842" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#E5B842" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#geminiAuraGrad)" />
      <path
        d="M12 1.5C12 7.29899 7.29899 12 1.5 12C7.29899 12 12 16.701 12 22.5C12 16.701 16.701 12 22.5 12C16.701 12 12 7.29899 12 1.5Z"
        fill="url(#geminiGoldGrad)"
      />
    </motion.svg>
  )
}

const PHASE_THEME: Record<
  AgentPhase,
  {
    label: string
    badgeBg: string
    border: string
    text: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  thought: {
    label: 'REASONING',
    badgeBg: 'bg-amber-500/10',
    border: 'border-amber-400/30',
    text: 'text-amber-300',
    icon: Sparkles,
  },
  scout: {
    label: 'SCOUTING',
    badgeBg: 'bg-sky-500/10',
    border: 'border-sky-400/30',
    text: 'text-sky-300',
    icon: Search,
  },
  evaluate: {
    label: 'INSPECTING',
    badgeBg: 'bg-yellow-500/10',
    border: 'border-yellow-400/30',
    text: 'text-yellow-300',
    icon: Zap,
  },
  qualify: {
    label: 'QUALIFIED',
    badgeBg: 'bg-emerald-500/10',
    border: 'border-emerald-400/30',
    text: 'text-emerald-300',
    icon: CheckCircle2,
  },
  synthesize: {
    label: 'SYNTHESIS',
    badgeBg: 'bg-purple-500/10',
    border: 'border-purple-400/30',
    text: 'text-purple-300',
    icon: Bot,
  },
  dispatch: {
    label: 'DISPATCH',
    badgeBg: 'bg-emerald-500/10',
    border: 'border-emerald-400/30',
    text: 'text-emerald-300',
    icon: Send,
  },
  cycle: {
    label: 'AUTO-CYCLE',
    badgeBg: 'bg-amber-500/10',
    border: 'border-amber-400/30',
    text: 'text-amber-300',
    icon: RefreshCw,
  },
  safeguard: {
    label: 'SAFEGUARD',
    badgeBg: 'bg-blue-500/10',
    border: 'border-blue-400/30',
    text: 'text-blue-300',
    icon: ShieldCheck,
  },
  success: {
    label: 'GOAL REACHED',
    badgeBg: 'bg-emerald-500/15',
    border: 'border-emerald-400/40',
    text: 'text-emerald-300',
    icon: Sparkles,
  },
  error: {
    label: 'NOTICE',
    badgeBg: 'bg-rose-500/10',
    border: 'border-rose-400/30',
    text: 'text-rose-300',
    icon: AlertCircle,
  },
}

export function OutreachAgentTerminal({
  isOpen,
  onClose,
  onStop,
  isStopping = false,
  mode,
  targetGoal,
  totalSent,
  totalScouted,
  totalQualified,
  currentCycle,
  currentNiche,
  logs,
  dispatches,
  status,
  errorMessage,
  onRetry,
}: OutreachAgentTerminalProps) {
  const [activeTab, setActiveTab] = React.useState<'stream' | 'dispatches'>('stream')
  const [autoScroll, setAutoScroll] = React.useState(true)
  const [copied, setCopied] = React.useState(false)
  const [selectedPitch, setSelectedPitch] = React.useState<{
    businessName: string
    recipientEmail: string
    status: string
    subject: string
    isDryRun: boolean
    snippet?: string
  } | null>(null)

  const streamEndRef = React.useRef<HTMLDivElement>(null)

  // Scroll to bottom when logs update
  React.useEffect(() => {
    if (autoScroll && activeTab === 'stream') {
      streamEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll, activeTab])

  // Reset tab on open
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab('stream')
    }
  }, [isOpen])

  if (!isOpen) return null

  const progressPercent = Math.min(
    100,
    Math.round((totalSent / Math.max(1, targetGoal)) * 100),
  )

  const isWorking =
    status !== 'completed' && status !== 'stopped' && status !== 'failed'

  function handleCopySummary() {
    const text = [
      `=== VIRTUE & CO. OUTREACH INTELLIGENCE SUMMARY ===`,
      `Mode: ${mode.toUpperCase()}`,
      `Target Goal: ${targetGoal} emails`,
      `Progress: ${totalSent}/${targetGoal} (${progressPercent}%)`,
      `Scouted: ${totalScouted} businesses`,
      `Qualified: ${totalQualified} leads`,
      `Cycle: ${currentCycle}`,
      `Status: ${status.toUpperCase()}`,
      `Dispatches Delivered: ${dispatches.length}`,
      ...dispatches.map(
        (d, idx) =>
          `  ${idx + 1}. ${d.businessName} <${d.recipientEmail}> [${d.status}] - "${d.subject}"`,
      ),
    ].join('\n')

    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Autonomous execution summary copied to clipboard.')
    setTimeout(() => setCopied(false), 2000)
  }

  // Gemini state messaging
  function getStatusBadge() {
    switch (status) {
      case 'scouting':
        return {
          label: 'Scouting High-Ticket Sectors',
          color: 'border-sky-400/40 bg-sky-500/10 text-sky-300',
          dot: 'bg-sky-400 animate-pulse',
        }
      case 'evaluating':
        return {
          label: 'Inspecting Technical Deficits',
          color: 'border-yellow-400/40 bg-yellow-500/10 text-yellow-300',
          dot: 'bg-yellow-400 animate-pulse',
        }
      case 'synthesizing':
        return {
          label: 'Gemini Synthesizing Bespoke Pitch',
          color: 'border-purple-400/40 bg-purple-500/10 text-purple-300',
          dot: 'bg-purple-400 animate-pulse',
        }
      case 'dispatching':
        return {
          label: 'Delivering via Brevo SMTP',
          color: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
          dot: 'bg-emerald-400 animate-pulse',
        }
      case 'cycling':
        return {
          label: 'Autonomous Cycle Rotation',
          color: 'border-amber-400/40 bg-amber-500/10 text-amber-300',
          dot: 'bg-amber-400 animate-spin',
        }
      case 'completed':
        return {
          label: 'Target Quota Achieved',
          color: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300',
          dot: 'bg-emerald-400',
        }
      case 'stopped':
        return {
          label: 'Execution Paused',
          color: 'border-neutral-500/40 bg-neutral-800/40 text-neutral-300',
          dot: 'bg-neutral-400',
        }
      case 'failed':
        return {
          label: 'Interrupted — Auto-Recovery Ready',
          color: 'border-rose-400/40 bg-rose-500/10 text-rose-300',
          dot: 'bg-rose-400',
        }
      default:
        return {
          label: 'Autonomous Engine Standby',
          color: 'border-neutral-500/30 bg-neutral-900 text-neutral-300',
          dot: 'bg-neutral-500',
        }
    }
  }

  const currentBadge = getStatusBadge()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Dimmed luxury obsidian backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          if (!isWorking) onClose()
        }}
        className="fixed inset-0 bg-[#050505]/80 backdrop-blur-xl"
      />

      {/* Main Gemini Dialog Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="relative z-10 flex h-[92vh] max-h-[860px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-amber-500/25 bg-[#0a0a0a]/95 text-[#f5f4f0] shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_60px_rgba(220,170,40,0.1)] backdrop-blur-2xl"
      >
        {/* Ambient Top Aurora Glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/20 via-amber-600/5 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-10 h-64 w-80 rounded-full bg-gradient-to-t from-primary/10 via-amber-500/5 to-transparent blur-3xl" />

        {/* 1. Header Bar: Gemini Sparkle + Brand + Actions */}
        <div className="relative flex items-center justify-between border-b border-white/8 px-6 py-4.5">
          <div className="flex items-center gap-3.5">
            {/* Animated Gemini Star Avatar */}
            <div className="relative grid size-11 place-items-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-[#161616] to-[#0a0a0a] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <GeminiSparkle className="size-6 text-amber-300" animate={isWorking} />
              {isWorking ? (
                <span className="absolute -top-1 -right-1 flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-amber-400" />
                </span>
              ) : null}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
                  Virtue &amp; Co. Intelligence
                </h2>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-medium tracking-wide uppercase ${
                    mode === 'dry_run'
                      ? 'border-sky-400/40 bg-sky-400/10 text-sky-300'
                      : 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                  }`}
                >
                  {mode === 'dry_run' ? 'Simulation Run' : 'Live Brevo Dispatch'}
                </Badge>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span>Autonomous Acquisition Engine</span>
                <span className="text-neutral-600">•</span>
                <span className="text-amber-300/80">Gemini Reasoning</span>
                {currentNiche ? (
                  <>
                    <span className="text-neutral-600">•</span>
                    <span className="truncate max-w-[200px] text-neutral-300">
                      Sector: {currentNiche}
                    </span>
                  </>
                ) : null}
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {isWorking ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onStop}
                disabled={isStopping}
                className="h-8 gap-1.5 rounded-full border-rose-500/30 bg-rose-500/10 text-xs font-medium text-rose-300 hover:bg-rose-500/20 hover:text-rose-200"
              >
                <Pause className="size-3" />
                {isStopping ? 'Pausing...' : 'Stop Agent'}
              </Button>
            ) : null}

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              className="h-8 gap-1.5 rounded-full border-white/10 bg-white/[0.04] text-xs text-neutral-300 hover:bg-white/[0.08]"
              title="Copy Execution Summary"
            >
              {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
              <span className="hidden sm:inline">Copy Report</span>
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="grid size-8 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Close window"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* 2. Quota HUD & Interactive Metric Cards */}
        <div className="relative border-b border-white/8 bg-gradient-to-b from-white/[0.02] to-transparent p-5">
          <div className="flex flex-col gap-3">
            {/* Top row: Status pill + Target percentage */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${currentBadge.color}`}
                >
                  <span className={`size-2 rounded-full ${currentBadge.dot}`} />
                  {currentBadge.label}
                </span>

                <span className="text-xs text-neutral-400 font-mono">
                  Cycle #{currentCycle}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">
                  Autonomous Target
                </span>
                <span className="font-mono text-lg font-bold text-amber-300">
                  {totalSent}{' '}
                  <span className="text-xs font-normal text-neutral-500">/ {targetGoal}</span>
                </span>
                <span className="rounded-md bg-amber-400/10 px-1.5 py-0.5 text-xs font-semibold text-amber-300">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Glowing Shimmer Progress Bar */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-primary to-amber-300 shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
              {isWorking ? (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
              ) : null}
            </div>

            {/* 3 Metric Pills: Scouted, Qualified, Pitched */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2">
                <div className="flex items-center gap-2">
                  <div className="grid size-6 place-items-center rounded-lg bg-sky-500/10 text-sky-400">
                    <Search className="size-3.5" />
                  </div>
                  <span className="text-xs text-neutral-400">Scouted</span>
                </div>
                <span className="font-mono text-sm font-semibold text-white">
                  {totalScouted}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2">
                <div className="flex items-center gap-2">
                  <div className="grid size-6 place-items-center rounded-lg bg-yellow-500/10 text-yellow-400">
                    <Zap className="size-3.5" />
                  </div>
                  <span className="text-xs text-neutral-400">Qualified</span>
                </div>
                <span className="font-mono text-sm font-semibold text-white">
                  {totalQualified}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2">
                <div className="flex items-center gap-2">
                  <div className="grid size-6 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Send className="size-3.5" />
                  </div>
                  <span className="text-xs text-neutral-400">Dispatched</span>
                </div>
                <span className="font-mono text-sm font-semibold text-emerald-300">
                  {totalSent}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Navigation Tabs: Stream vs Delivered Pitches */}
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-2 bg-black/40">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('stream')}
              className={`relative flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'stream'
                  ? 'bg-amber-400/15 text-amber-300 shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                  : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <Sparkles className="size-3.5 text-amber-400" />
              <span>Thinking &amp; Strategic Stream</span>
              <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-mono">
                {logs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dispatches')}
              className={`relative flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'dispatches'
                  ? 'bg-amber-400/15 text-amber-300 shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                  : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <Mail className="size-3.5 text-amber-400" />
              <span>Delivered Pitches</span>
              <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-mono">
                {dispatches.length}
              </span>
            </button>
          </div>

          {activeTab === 'stream' ? (
            <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-neutral-400 hover:text-neutral-300">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="size-3.5 rounded border-white/20 bg-black text-amber-500 focus:ring-0"
              />
              <span>Auto-scroll</span>
            </label>
          ) : null}
        </div>

        {/* 4. Active Body View */}
        <div className="relative flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          <AnimatePresence mode="wait">
            {activeTab === 'stream' ? (
              <motion.div
                key="stream-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-2.5 pb-4"
              >
                {/* Active Thinking Wave Bar (Gemini style) */}
                {isWorking ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative grid size-7 place-items-center rounded-lg bg-amber-400/20 text-amber-300">
                        <GeminiSparkle className="size-4" animate />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-amber-300 tracking-wide">
                            GEMINI AGENTIC COGNITION
                          </span>
                          <span className="size-1 rounded-full bg-amber-400 animate-ping" />
                        </div>
                        <p className="text-xs text-neutral-300 mt-0.5">
                          Evaluating web performance, synthesizing pain points, and composing high-converting outreach...
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : null}

                {/* Log Stream Cards */}
                {logs.length === 0 ? (
                  <div className="grid place-items-center py-16 text-center">
                    <GeminiSparkle className="size-8 text-neutral-600 mb-2" animate={false} />
                    <p className="text-xs text-neutral-500">
                      Autonomous agent stream waiting for initial discovery cycle...
                    </p>
                  </div>
                ) : (
                  logs.map((log) => {
                    const theme = PHASE_THEME[log.phase] || PHASE_THEME.thought
                    const PhaseIcon = theme.icon

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`group relative flex flex-col gap-1.5 rounded-2xl border ${theme.border} ${theme.badgeBg} p-3.5 transition-all hover:bg-white/[0.04]`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${theme.border} ${theme.text}`}
                            >
                              <PhaseIcon className="size-3" />
                              {theme.label}
                            </span>
                            <span className="font-mono text-[10px] text-neutral-400">
                              {log.timestamp}
                            </span>
                          </div>

                          {log.status === 'active' ? (
                            <span className="flex size-2">
                              <span className="size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                            </span>
                          ) : null}
                        </div>

                        <p className="text-xs font-medium leading-relaxed text-neutral-200">
                          {log.text}
                        </p>

                        {log.detail ? (
                          <div className="rounded-xl border border-white/5 bg-black/40 px-3 py-2 text-[11px] leading-relaxed text-neutral-400 font-mono">
                            {log.detail}
                          </div>
                        ) : null}
                      </motion.div>
                    )
                  })
                )}

                {/* Graceful Auto-Recovery / Notice Card */}
                {errorMessage ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200 shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="size-5 shrink-0 text-amber-400 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-semibold text-amber-300">
                          Execution Notice &amp; Auto-Recovery
                        </p>
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          {errorMessage}
                        </p>
                        {onRetry ? (
                          <div className="pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={onRetry}
                              className="h-7 rounded-lg border-amber-400/40 bg-amber-400/20 text-xs text-amber-200 hover:bg-amber-400/30"
                            >
                              <RefreshCw className="mr-1.5 size-3" />
                              Retry Cycle Now
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                ) : null}

                <div ref={streamEndRef} />
              </motion.div>
            ) : (
              /* Delivered Pitches Showcase */
              <motion.div
                key="dispatches-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3 pb-4"
              >
                {dispatches.length === 0 ? (
                  <div className="grid place-items-center py-16 text-center">
                    <Mail className="size-8 text-neutral-600 mb-2" />
                    <p className="text-xs text-neutral-500">
                      No bespoke pitches dispatched in this session yet.
                    </p>
                  </div>
                ) : (
                  dispatches.map((d, idx) => (
                    <div
                      key={idx}
                      className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-amber-400/30 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-white">
                              {d.businessName}
                            </h4>
                            <Badge
                              variant="outline"
                              className="border-emerald-400/30 bg-emerald-400/10 text-[10px] text-emerald-300"
                            >
                              {d.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-neutral-400 font-mono mt-0.5">
                            {d.recipientEmail}
                          </p>
                        </div>

                        <span className="text-[11px] text-neutral-500 font-mono">
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-black/40 px-3 py-2">
                        <span className="text-[10px] font-semibold text-amber-300/80 uppercase tracking-wider block mb-1">
                          Subject Line
                        </span>
                        <p className="text-xs text-neutral-300 italic">
                          "{d.subject}"
                        </p>
                      </div>

                      {d.snippet ? (
                        <div className="text-xs text-neutral-400 line-clamp-2">
                          {d.snippet}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. Luxury Brand Footer: Deliverability & Compliance Audit */}
        <div className="border-t border-white/8 bg-black/60 px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>
                Report Recipient:{' '}
                <strong className="text-neutral-200">adeniranglory129@gmail.com</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span>
                Inbound Replies:{' '}
                <strong className="text-neutral-200">virtueco.dev@gmail.com</strong>
              </span>
              <span className="text-neutral-600">•</span>
              <span className="text-amber-300/80">Brevo SMTP Active</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
