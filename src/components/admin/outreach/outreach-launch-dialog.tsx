'use client'

import * as React from 'react'
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Flame,
  Layers,
  Play,
  RotateCw,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GeminiSparkle } from './outreach-agent-terminal'

interface OutreachLaunchDialogProps {
  isOpen: boolean
  onClose: () => void
  onLaunch: (params: { targetCount: number; mode: 'manual' | 'dry_run' }) => void
  sentToday: number
  dailyCap: number
  isEngineBusy?: boolean
  initialMode?: 'manual' | 'dry_run'
}

const PRESET_COUNTS = [5, 10, 15]

export function OutreachLaunchDialog({
  isOpen,
  onClose,
  onLaunch,
  sentToday,
  dailyCap,
  isEngineBusy = false,
  initialMode = 'manual',
}: OutreachLaunchDialogProps) {
  const remainingLiveCap = Math.max(0, dailyCap - sentToday)
  const [selectedCount, setSelectedCount] = React.useState<number>(15)
  const [isCustom, setIsCustom] = React.useState(false)
  const [customInput, setCustomInput] = React.useState<string>('15')
  const [mode, setMode] = React.useState<'manual' | 'dry_run'>(initialMode)

  // Sync mode whenever dialog opens or initialMode changes
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      // Pick sensible default within remaining live cap
      const defaultTarget = remainingLiveCap > 0 ? Math.min(15, remainingLiveCap) : 5
      setSelectedCount(defaultTarget)
      setCustomInput(String(defaultTarget))
      setIsCustom(false)
    }
  }, [isOpen, initialMode, remainingLiveCap])

  const targetCount = isCustom ? Math.max(1, parseInt(customInput, 10) || 1) : selectedCount
  const isCapExceeded = mode === 'manual' && targetCount > remainingLiveCap && remainingLiveCap > 0
  const isHardBlocked = mode === 'manual' && remainingLiveCap <= 0

  function handlePresetClick(count: number) {
    setIsCustom(false)
    setSelectedCount(count)
    setCustomInput(String(count))
  }

  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setCustomInput(val)
    const num = parseInt(val, 10)
    if (!Number.isNaN(num) && num > 0) {
      setSelectedCount(num)
    }
  }

  function handleLaunchSubmit() {
    if (isEngineBusy || isHardBlocked) return
    const finalCount = Math.max(1, Math.min(50, targetCount))
    onLaunch({
      targetCount: finalCount,
      mode,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-w-xl border-amber-500/25 bg-[#0a0a0a]/95 p-6 backdrop-blur-2xl text-[#f5f4f0] shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(220,170,40,0.1)] sm:rounded-3xl overflow-hidden">
        {/* Top ambient aurora glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-44 w-72 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/20 via-primary/10 to-transparent blur-3xl" />

        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div className="relative grid size-10 place-items-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-[#161616] to-[#0a0a0a] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <GeminiSparkle className="size-5 text-amber-300" animate />
              <span className="absolute -top-1 -right-1 flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-amber-400" />
              </span>
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-semibold tracking-tight text-white">
                Launch Autonomous Outreach Agent
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-400">
                Virtue &amp; Co. Intelligence · Multi-Cycle Acquisition Engine
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Quota Health Bar */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Daily Dispatch Allowance</span>
            <span className="font-mono font-medium text-amber-400">
              {sentToday} / {dailyCap} sent today
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((sentToday / Math.max(1, dailyCap)) * 100))}%`,
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
            <span>
              Remaining capacity:{' '}
              <strong className={remainingLiveCap > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {remainingLiveCap} emails
              </strong>
            </span>
            {isHardBlocked ? (
              <span className="flex items-center gap-1 text-rose-400">
                <AlertCircle className="size-3" /> Daily cap reached
              </span>
            ) : null}
          </div>
        </div>

        {/* Target Count Selection */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-medium text-neutral-200">
            Target Email Volume (Runs until satisfied)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_COUNTS.map((count) => {
              const active = !isCustom && selectedCount === count
              const isOverRemaining = mode === 'manual' && count > remainingLiveCap && remainingLiveCap > 0
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => handlePresetClick(count)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                    active
                      ? 'border-amber-400/80 bg-amber-400/15 text-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                      : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="font-mono text-base font-bold">{count}</span>
                  <span className="text-[10px] text-neutral-400">
                    {count === 5 ? 'Sprint' : count === 10 ? 'Standard' : 'Full Session'}
                  </span>
                  {isOverRemaining ? (
                    <span className="mt-1 text-[9px] text-amber-400/90 font-medium">Cap: {remainingLiveCap}</span>
                  ) : null}
                </button>
              )
            })}

            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                isCustom
                  ? 'border-amber-400/80 bg-amber-400/15 text-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                  : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/20 hover:bg-white/[0.06]'
              }`}
            >
              <span className="font-mono text-base font-bold">Custom</span>
              <span className="text-[10px] text-neutral-400">1 to 50</span>
            </button>
          </div>

          {isCustom ? (
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-2">
              <span className="text-xs text-neutral-400">Exact email count:</span>
              <input
                type="number"
                min={1}
                max={50}
                value={customInput}
                onChange={handleCustomChange}
                className="w-24 rounded-lg border border-amber-400/40 bg-black/60 px-3 py-1.5 font-mono text-sm font-semibold text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                placeholder="e.g. 15"
                autoFocus
              />
              <span className="text-xs text-neutral-500">emails</span>
            </div>
          ) : null}

          {isCapExceeded ? (
            <p className="text-[11px] text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="size-3.5 shrink-0" />
              Note: Today's remaining live cap is {remainingLiveCap}. The agent will send up to {remainingLiveCap} real emails today.
            </p>
          ) : null}
        </div>

        {/* Execution Mode Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-neutral-200">Execution Mode</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition-all ${
                mode === 'manual'
                  ? 'border-amber-400/80 bg-amber-400/10 text-white shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                  : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                <Send className="size-3.5" />
                Live Dispatch
              </div>
              <p className="text-[11px] leading-snug text-neutral-400">
                Transmits real customized proposals via Brevo SMTP to verified decision-makers.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode('dry_run')}
              className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition-all ${
                mode === 'dry_run'
                  ? 'border-sky-400/80 bg-sky-400/10 text-white shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                  : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300">
                <Sparkles className="size-3.5" />
                Dry-Run Simulation
              </div>
              <p className="text-[11px] leading-snug text-neutral-400">
                Evaluates websites and synthesizes pitches safely without delivering emails to prospects.
              </p>
            </button>
          </div>
        </div>

        {/* Autonomous Guarantee Banner */}
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 text-xs leading-relaxed text-neutral-300">
          <RotateCw className="mt-0.5 size-4 shrink-0 text-amber-400 animate-spin-slow" />
          <div>
            <strong className="text-amber-300">Autonomous Continuation Guarantee:</strong>
            <p className="mt-0.5 text-[11px] text-neutral-400">
              The agent will execute sequentially across multiple batches without stopping until{' '}
              <span className="font-semibold text-white">{targetCount} emails</span> are sent. If a niche runs dry, it automatically cycles into premium fallback industries (Architecture, Dental, Interior Design, Commercial Law).
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleLaunchSubmit}
            disabled={isEngineBusy || isHardBlocked}
            className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 font-semibold text-black shadow-lg shadow-amber-500/20 hover:brightness-110"
          >
            <Play className="mr-1.5 size-4 fill-current" />
            Initiate Autonomous Run ({targetCount} Emails)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
