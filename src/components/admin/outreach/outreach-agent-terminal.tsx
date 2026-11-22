'use client'

import * as React from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
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
  }>
  status: 'idle' | 'scouting' | 'evaluating' | 'synthesizing' | 'dispatching' | 'cycling' | 'completed' | 'stopped' | 'failed'
  errorMessage?: string | null
}

const PHASE_CONFIG: Record<
  AgentPhase,
  { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  thought: {
    label: 'THOUGHT',
    badgeClass: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    icon: Sparkles,
  },
  scout: {
    label: 'SCOUT',
    badgeClass: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    icon: Search,
  },
  evaluate: {
    label: 'EVALUATE',
    badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    icon: Zap,
  },
  qualify: {
    label: 'QUALIFY',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    icon: ShieldCheck,
  },
  synthesize: {
    label: 'GEMINI AI',
    badgeClass: 'border-yellow-400/30 bg-yellow-400/10 text-yellow-300',
    icon: Bot,
  },
  dispatch: {
    label: 'DISPATCH',
    badgeClass: 'border-green-400/30 bg-green-400/10 text-green-300',
    icon: Send,
  },
  cycle: {
    label: 'AUTO-CYCLE',
    badgeClass: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
    icon: RefreshCw,
  },
  safeguard: {
    label: 'SAFEGUARD',
    badgeClass: 'border-neutral-500/30 bg-neutral-500/10 text-neutral-300',
    icon: ShieldCheck,
  },
  success: {
    label: 'TARGET MET',
    badgeClass: 'border-emerald-400/50 bg-emerald-400/20 text-emerald-300',
    icon: CheckCircle2,
  },
  error: {
    label: 'EXCEPTION',
    badgeClass: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
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
  currentNiche = 'Architecture & Luxury Spaces',
  logs,
  dispatches,
  status,
  errorMessage,
}: OutreachAgentTerminalProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = React.useState(true)
  const [isCopied, setIsCopied] = React.useState(false)
  const [activeView, setActiveView] = React.useState<'stream' | 'dispatches'>('stream')

  // Auto-scroll to bottom of log terminal when new items arrive
  React.useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  if (!isOpen) return null

  const isCompleted = status === 'completed'
  const isStopped = status === 'stopped'
  const isFailed = status === 'failed'
  const isRunning = !isCompleted && !isStopped && !isFailed && status !== 'idle'

  const progressPercent = Math.min(100, Math.round((totalSent / Math.max(1, targetGoal)) * 100))

  async function handleCopyLogs() {
    try {
      const text = logs
        .map((l) => `[${l.timestamp}] [${l.phase.toUpperCase()}] ${l.text}${l.detail ? `\n  ${l.detail}` : ''}`)
        .join('\n')
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      toast.success('Agent terminal logs copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      toast.error('Failed to copy logs')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6 animate-in fade-in-0 duration-200">
      <div className="relative flex h-[90vh] max-h-[880px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-amber-500/30 bg-[#0a0a0a] shadow-[0_0_60px_rgba(212,175,55,0.15)] ring-1 ring-white/10">
        {/* Gemini-Inspired Thinking Aura Background Pulse */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-96 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/15 via-yellow-500/10 to-transparent blur-3xl" />
        {isRunning ? (
          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-80 rounded-full bg-gradient-to-t from-sky-500/10 to-transparent blur-3xl animate-pulse" />
        ) : null}

        {/* Top Control Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0d0d0d]/90 px-5 py-3.5 backdrop-blur-sm">
          {/* Antigravity / Gemini Agent Orb */}
          <div className="flex items-center gap-3">
            <div className="relative grid size-10 place-items-center rounded-xl bg-black border border-white/10 shadow-inner">
              {isRunning ? (
                <>
                  <span className="absolute inline-flex size-7 animate-ping rounded-full bg-amber-400/40 opacity-75" />
                  <span className="absolute inline-flex size-6 animate-spin rounded-full border border-dashed border-amber-400/60" />
                  <span className="relative inline-flex size-4 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 shadow-[0_0_12px_#d4af37]" />
                </>
              ) : isCompleted ? (
                <div className="grid size-7 place-items-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <Check className="size-4 stroke-[3]" />
                </div>
              ) : isStopped ? (
                <div className="grid size-7 place-items-center rounded-full bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50">
                  <Pause className="size-3.5" />
                </div>
              ) : (
                <div className="grid size-7 place-items-center rounded-full bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/50">
                  <AlertCircle className="size-3.5" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold tracking-wider uppercase text-amber-400">
                  Antigravity Autonomous Engine
                </span>
                <Badge
                  variant={isCompleted ? 'default' : isRunning ? 'default' : 'outline'}
                  className={
                    isCompleted
                      ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                      : isRunning
                        ? 'border-amber-400/40 bg-amber-400/20 text-amber-300 animate-pulse'
                        : 'border-white/10 text-neutral-400'
                  }
                >
                  {isCompleted
                    ? 'Target Satisfied'
                    : isRunning
                      ? `Cycle ${currentCycle} · ${status.toUpperCase()}`
                      : isStopped
                        ? 'Stopped'
                        : 'Exception'}
                </Badge>
                <Badge variant="outline" className="text-[10px] text-neutral-400 border-white/10">
                  {mode === 'dry_run' ? 'DRY-RUN SIMULATION' : 'LIVE BREVO DISPATCH'}
                </Badge>
              </div>
              <p className="text-[11px] text-neutral-400">
                Active Focus: <span className="font-medium text-white">{currentNiche}</span> · Mode: {mode.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Action controls */}
          <div className="flex items-center gap-2">
            {isRunning ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onStop}
                disabled={isStopping}
                className="h-8 gap-1.5 text-xs font-semibold"
              >
                <Pause className="size-3.5" />
                {isStopping ? 'Stopping Agent…' : 'Stop Run Early'}
              </Button>
            ) : null}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLogs}
              className="h-8 gap-1.5 border-white/10 bg-white/5 text-xs text-neutral-300 hover:bg-white/10 hover:text-white"
            >
              {isCopied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              {isCopied ? 'Copied' : 'Copy Logs'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isRunning && !isStopping}
              className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
            >
              <X className="size-4" />
              <span className="sr-only">Close terminal</span>
            </Button>
          </div>
        </div>

        {/* Progress & Live Telemetry Strip */}
        <div className="relative z-10 border-b border-white/10 bg-[#070707] px-5 py-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="text-[11px] font-medium tracking-wide uppercase text-neutral-400">
                Outreach Quota Progression
              </span>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold tracking-tight text-white">
                  {totalSent} <span className="text-base font-normal text-neutral-400">/ {targetGoal}</span>
                </span>
                <span className="font-mono text-xs font-semibold text-amber-400">
                  {progressPercent}% Complete
                </span>
                {totalSent >= targetGoal ? (
                  <span className="ml-1 flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle2 className="size-3" /> Goal Satisfied
                  </span>
                ) : null}
              </div>
            </div>

            {/* Micro Metrics Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-1.5 text-center">
                <span className="text-[10px] uppercase text-neutral-400">Scouted</span>
                <div className="font-mono text-sm font-semibold text-neutral-200">{totalScouted}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-1.5 text-center">
                <span className="text-[10px] uppercase text-neutral-400">Qualified</span>
                <div className="font-mono text-sm font-semibold text-neutral-200">{totalQualified}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-1.5 text-center">
                <span className="text-[10px] uppercase text-neutral-400">Dispatches</span>
                <div className="font-mono text-sm font-semibold text-emerald-400">{dispatches.length}</div>
              </div>
            </div>
          </div>

          {/* Shimmering Progress Bar */}
          <div className="mt-3 relative h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
            {isRunning ? (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            ) : null}
          </div>
        </div>

        {/* View Switcher Bar (Stream vs Dispatches) */}
        <div className="flex items-center justify-between border-b border-white/5 bg-[#050505] px-5 py-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView('stream')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono transition-colors ${
                activeView === 'stream'
                  ? 'bg-amber-400/20 text-amber-300 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Terminal className="size-3.5" />
              Thinking &amp; Execution Stream ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveView('dispatches')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono transition-colors ${
                activeView === 'dispatches'
                  ? 'bg-amber-400/20 text-amber-300 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Mail className="size-3.5" />
              Live Pitches Delivered ({dispatches.length})
            </button>
          </div>

          {activeView === 'stream' ? (
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="size-3.5 rounded border-white/20 bg-neutral-900 accent-amber-400"
                />
                Auto-scroll
              </label>
            </div>
          ) : null}
        </div>

        {/* Main Terminal Stream View */}
        {activeView === 'stream' ? (
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed bg-[#050505] space-y-2 selection:bg-amber-400/30 selection:text-white"
          >
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500">
                <Radar className="size-8 text-neutral-600 animate-spin-slow mb-2" />
                <p>Initializing autonomous agent telemetry...</p>
              </div>
            ) : null}

            {logs.map((log) => {
              const config = PHASE_CONFIG[log.phase] || PHASE_CONFIG.thought
              const Icon = config.icon

              return (
                <div
                  key={log.id}
                  className="group relative flex items-start gap-2.5 rounded-lg border border-white/[0.03] bg-white/[0.01] p-2 hover:bg-white/[0.03] transition-colors"
                >
                  <span className="shrink-0 text-[10px] text-neutral-500 font-medium">
                    {log.timestamp}
                  </span>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${config.badgeClass}`}
                  >
                    <Icon className="size-2.5" />
                    {config.label}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-neutral-200">{log.text}</p>
                    {log.detail ? (
                      <p className="mt-1 text-[11px] text-neutral-400 font-mono whitespace-pre-wrap bg-black/40 p-2 rounded border border-white/5">
                        {log.detail}
                      </p>
                    ) : null}
                  </div>
                </div>
              )
            })}

            {/* Active thinking indicator if currently working */}
            {isRunning ? (
              <div className="flex items-center gap-2 pt-2 text-[11px] text-amber-400/90 font-mono">
                <span className="flex size-2 relative">
                  <span className="animate-ping absolute inline-flex size-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
                </span>
                <span className="animate-pulse">
                  Agent reasoning &amp; evaluating candidates for target ({totalSent}/{targetGoal})...
                </span>
              </div>
            ) : null}

            {isCompleted ? (
              <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-200">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  Autonomous Target Satisfied: {totalSent} / {targetGoal} Emails Sent
                </div>
                <p className="mt-1 text-[11px] text-neutral-300">
                  Daily quota respected. An executive summary report has been dispatched to{' '}
                  <strong className="text-white">adeniranglory129@gmail.com</strong>.
                </p>
              </div>
            ) : null}

            {isStopped ? (
              <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
                <div className="flex items-center gap-2 font-semibold">
                  <Pause className="size-4 text-amber-400" />
                  Outreach Interrupted by Operator
                </div>
                <p className="mt-1 text-[11px] text-neutral-300">
                  Agent successfully finalized current active in-flight requests ({totalSent} emails dispatched).
                </p>
              </div>
            ) : null}

            {isFailed ? (
              <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="size-4 text-rose-400" />
                  Run Exception
                </div>
                <p className="mt-1 text-[11px] text-rose-300">
                  {errorMessage || 'An error occurred during discovery or pitching execution.'}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          /* Dispatches Tab */
          <div className="flex-1 overflow-y-auto p-4 bg-[#050505]">
            {dispatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500">
                <Mail className="size-8 text-neutral-600 mb-2" />
                <p className="text-xs">No dispatches recorded yet in this active session.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dispatches.map((d, idx) => (
                  <div
                    key={`${d.recipientEmail}-${idx}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-neutral-500">#{idx + 1}</span>
                      <div>
                        <span className="font-semibold text-white">{d.businessName}</span>
                        <div className="font-mono text-[11px] text-neutral-400">{d.recipientEmail}</div>
                        <div className="mt-0.5 text-[11px] text-neutral-300">{d.subject}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          d.status === 'sent'
                            ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                            : 'border-white/10 text-neutral-400'
                        }
                      >
                        {d.isDryRun ? 'DRY-RUN SIMULATED' : d.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom Status Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#0d0d0d] px-5 py-3 text-[11px] text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400" />
            <span>Reporting to: adeniranglory129@gmail.com</span>
            <span>·</span>
            <span>Direct Inbound Reply: virtueco.dev@gmail.com</span>
          </div>

          {!isRunning ? (
            <Button
              type="button"
              size="sm"
              onClick={onClose}
              className="bg-white/10 text-white hover:bg-white/20 h-7 text-xs font-semibold"
            >
              Done &amp; Inspect Prospects
            </Button>
          ) : (
            <span className="font-mono text-amber-400 animate-pulse">
              Cycle {currentCycle} in progress · Auto-loop active
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
