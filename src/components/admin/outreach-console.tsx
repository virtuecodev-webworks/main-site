'use client'

import * as React from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Globe,
  Key,
  Mail,
  Pause,
  Play,
  Plus,
  Radar,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OutreachLaunchDialog } from './outreach/outreach-launch-dialog'
import {
  OutreachAgentTerminal,
  type AgentLogItem,
  type AgentPhase,
} from './outreach/outreach-agent-terminal'
import {
  DISCOVERY_PROVIDERS,
  PROSPECT_STATUSES,
  type DiscoveryProvider,
  type OutreachDispatch,
  type OutreachProspect,
  type OutreachRun,
  type OutreachSettings,
  type ProspectStatus,
  type RunOutreachSummary,
} from '@/lib/outreach/types'

interface OutreachConsoleProps {
  initialSettings: OutreachSettings
  initialSentToday: number
  initialProspects: OutreachProspect[]
  initialRuns: OutreachRun[]
  initialDispatches: OutreachDispatch[]
}

function splitListInput(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

export function OutreachConsole({
  initialSettings,
  initialSentToday,
  initialProspects,
  initialRuns,
  initialDispatches,
}: OutreachConsoleProps) {
  const [settings, setSettings] = React.useState<OutreachSettings>(initialSettings)
  const [sentToday, setSentToday] = React.useState<number>(initialSentToday)
  const [prospects, setProspects] = React.useState<OutreachProspect[]>(initialProspects)
  const [runs, setRuns] = React.useState<OutreachRun[]>(initialRuns)
  const [dispatches, setDispatches] = React.useState<OutreachDispatch[]>(initialDispatches)
  const [lastRunSummary, setLastRunSummary] = React.useState<RunOutreachSummary | null>(null)

  const [activeTab, setActiveTab] = React.useState<'controls' | 'prospects' | 'runs'>('controls')
  const [isSavingSettings, setIsSavingSettings] = React.useState(false)
  const [isTogglingPause, setIsTogglingPause] = React.useState(false)
  const [isRunningDryRun, setIsRunningDryRun] = React.useState(false)
  const [isRunningLive, setIsRunningLive] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Launch Dialog & Antigravity Autonomous Agent State
  const [isLaunchDialogOpen, setIsLaunchDialogOpen] = React.useState(false)
  const [launchDialogInitialMode, setLaunchDialogInitialMode] = React.useState<'manual' | 'dry_run'>('manual')
  const [isTerminalOpen, setIsTerminalOpen] = React.useState(false)
  const [agentTerminalStatus, setAgentTerminalStatus] = React.useState<
    'idle' | 'scouting' | 'evaluating' | 'synthesizing' | 'dispatching' | 'cycling' | 'completed' | 'stopped' | 'failed'
  >('idle')
  const [terminalLogs, setTerminalLogs] = React.useState<AgentLogItem[]>([])
  const [terminalDispatches, setTerminalDispatches] = React.useState<
    Array<{
      businessName: string
      recipientEmail: string
      status: string
      subject: string
      isDryRun: boolean
    }>
  >([])
  const [terminalTargetGoal, setTerminalTargetGoal] = React.useState(15)
  const [terminalTotalSent, setTerminalTotalSent] = React.useState(0)
  const [terminalTotalScouted, setTerminalTotalScouted] = React.useState(0)
  const [terminalTotalQualified, setTerminalTotalQualified] = React.useState(0)
  const [terminalCycle, setTerminalCycle] = React.useState(1)
  const [terminalNiche, setTerminalNiche] = React.useState('Architecture & Luxury Spaces')
  const [terminalMode, setTerminalMode] = React.useState<'manual' | 'dry_run'>('manual')
  const [terminalError, setTerminalError] = React.useState<string | null>(null)
  const [isStoppingAgent, setIsStoppingAgent] = React.useState(false)
  const stopRequestedRef = React.useRef(false)

  // Settings form state
  const [industriesInput, setIndustriesInput] = React.useState(
    initialSettings.industries.join(', '),
  )
  const [locationsInput, setLocationsInput] = React.useState(
    initialSettings.locations.join(', '),
  )
  const [keywordsInput, setKeywordsInput] = React.useState(initialSettings.keywords.join(', '))
  const [discoveryProvider, setDiscoveryProvider] = React.useState<DiscoveryProvider>(
    initialSettings.discovery_provider,
  )
  const [dailySendCap, setDailySendCap] = React.useState<number>(initialSettings.daily_send_cap)
  const [minIssueScore, setMinIssueScore] = React.useState<number>(
    initialSettings.min_issue_score,
  )
  const [testRecipientEmail, setTestRecipientEmail] = React.useState<string>(
    initialSettings.test_recipient_email ?? '',
  )
  const [dryRunDefault, setDryRunDefault] = React.useState<boolean>(
    initialSettings.dry_run_default,
  )
  const [serperApiKey, setSerperApiKey] = React.useState<string>(
    initialSettings.serper_api_key ?? '',
  )
  const [geminiApiKey, setGeminiApiKey] = React.useState<string>(
    initialSettings.gemini_api_key ?? '',
  )
  const [showApiKeys, setShowApiKeys] = React.useState(false)

  // Prospects filter & manual creation state
  const [prospectStatusFilter, setProspectStatusFilter] = React.useState<'all' | ProspectStatus>(
    'all',
  )
  const [prospectSearch, setProspectSearch] = React.useState('')
  const [newBusinessName, setNewBusinessName] = React.useState('')
  const [newWebsiteUrl, setNewWebsiteUrl] = React.useState('')
  const [newIndustry, setNewIndustry] = React.useState('')
  const [newLocation, setNewLocation] = React.useState('')
  const [newContactEmail, setNewContactEmail] = React.useState('')
  const [isAddingProspect, setIsAddingProspect] = React.useState(false)
  const [expandedDispatchId, setExpandedDispatchId] = React.useState<string | null>(null)
  const [expandedProspectId, setExpandedProspectId] = React.useState<string | null>(null)

  const prospectById = React.useMemo(() => {
    const map = new Map<string, OutreachProspect>()
    for (const p of prospects) {
      map.set(p.id, p)
    }
    return map
  }, [prospects])

  const prospectByBusinessName = React.useMemo(() => {
    const map = new Map<string, OutreachProspect>()
    for (const p of prospects) {
      map.set(p.business_name.toLowerCase(), p)
    }
    return map
  }, [prospects])

  const syncFormFromSettings = React.useCallback((next: OutreachSettings) => {
    setSettings(next)
    setIndustriesInput(next.industries.join(', '))
    setLocationsInput(next.locations.join(', '))
    setKeywordsInput(next.keywords.join(', '))
    setDiscoveryProvider(next.discovery_provider)
    setDailySendCap(next.daily_send_cap)
    setMinIssueScore(next.min_issue_score)
    setTestRecipientEmail(next.test_recipient_email ?? '')
    setDryRunDefault(next.dry_run_default)
    setSerperApiKey(next.serper_api_key ?? '')
    setGeminiApiKey(next.gemini_api_key ?? '')
  }, [])

  const refreshAll = React.useCallback(async () => {
    setIsRefreshing(true)
    try {
      const [settingsRes, prospectsRes, runsRes] = await Promise.all([
        fetch('/api/admin/outreach/settings'),
        fetch('/api/admin/outreach/prospects?limit=100'),
        fetch('/api/admin/outreach/runs?limit=25'),
      ])

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        if (data.ok && data.settings) {
          syncFormFromSettings(data.settings)
          if (typeof data.sentToday === 'number') {
            setSentToday(data.sentToday)
          }
        }
      }

      if (prospectsRes.ok) {
        const data = await prospectsRes.json()
        if (data.ok && Array.isArray(data.prospects)) {
          setProspects(data.prospects)
        }
      }

      if (runsRes.ok) {
        const data = await runsRes.json()
        if (data.ok) {
          if (Array.isArray(data.runs)) setRuns(data.runs)
          if (Array.isArray(data.dispatches)) setDispatches(data.dispatches)
        }
      }
    } catch {
      toast.error('Could not refresh outreach data')
    } finally {
      setIsRefreshing(false)
    }
  }, [syncFormFromSettings])

  async function handleTogglePause() {
    const nextPaused = !settings.is_paused
    setIsTogglingPause(true)
    try {
      const res = await fetch('/api/admin/outreach/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_paused: nextPaused }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        syncFormFromSettings(data.settings)
        toast.success(
          nextPaused
            ? 'Daily outreach paused — scheduled runs will not send emails.'
            : 'Daily outreach resumed.',
        )
      } else {
        toast.error(data.error || 'Failed to update pause status')
      }
    } catch {
      toast.error('Network error while toggling pause status')
    } finally {
      setIsTogglingPause(false)
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    setIsSavingSettings(true)
    try {
      const payload = {
        daily_send_cap: Number(dailySendCap),
        industries: splitListInput(industriesInput),
        locations: splitListInput(locationsInput),
        keywords: splitListInput(keywordsInput),
        discovery_provider: discoveryProvider,
        min_issue_score: Number(minIssueScore),
        dry_run_default: dryRunDefault,
        test_recipient_email: testRecipientEmail.trim() || null,
        serper_api_key: serperApiKey.trim() || null,
        gemini_api_key: geminiApiKey.trim() || null,
      }

      const res = await fetch('/api/admin/outreach/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        syncFormFromSettings(data.settings)
        if (typeof data.sentToday === 'number') setSentToday(data.sentToday)
        toast.success('Outreach configuration saved.')
      } else {
        toast.error(data.error || 'Failed to save configuration')
      }
    } catch {
      toast.error('Network error while saving configuration')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const addAgentLog = React.useCallback(
    (
      phase: AgentPhase,
      text: string,
      detail?: string,
      status?: 'active' | 'success' | 'warning' | 'error' | 'info',
    ) => {
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes(),
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      setTerminalLogs((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: timeStr,
          phase,
          text,
          detail,
          status,
        },
      ])
    },
    [],
  )

  function handleOpenLaunchDialog(mode: 'dry_run' | 'manual') {
    setLaunchDialogInitialMode(mode)
    setIsLaunchDialogOpen(true)
  }

  function handleStopAgent() {
    stopRequestedRef.current = true
    setIsStoppingAgent(true)
    toast.info('Stopping autonomous engine... Finalizing in-flight operations.')
  }

  async function handleLaunchAutonomousRun({
    targetCount,
    mode,
  }: {
    targetCount: number
    mode: 'manual' | 'dry_run'
  }) {
    stopRequestedRef.current = false
    setIsStoppingAgent(false)
    setIsTerminalOpen(true)
    setTerminalTargetGoal(targetCount)
    setTerminalTotalSent(0)
    setTerminalTotalScouted(0)
    setTerminalTotalQualified(0)
    setTerminalCycle(1)
    setTerminalMode(mode)
    setTerminalDispatches([])
    setTerminalLogs([])
    setTerminalError(null)

    if (mode === 'dry_run') {
      setIsRunningDryRun(true)
    } else {
      setIsRunningLive(true)
    }

    addAgentLog(
      'thought',
      `Autonomous Outreach Agent initialized: target goal = ${targetCount} emails (${mode.toUpperCase()} mode).`,
      `Safety guardrails active. Daily send cap: ${settings.daily_send_cap}. Sent today before run: ${sentToday}.`,
    )
    addAgentLog(
      'thought',
      'Autonomous continuation active: will repeat execution and cycle high-ticket fallback niches until target is fulfilled.',
    )

    const sessionDispatches: Array<{
      businessName: string
      recipientEmail: string
      status: string
      subject: string
      isDryRun: boolean
    }> = []

    const fallbackSectors: Array<{
      name: string
      industries: string[]
      locations: string[]
    }> = [
      {
        name: settings.industries.join(', ') || 'Configured Target Sectors',
        industries:
          settings.industries.length > 0
            ? settings.industries
            : ['architectural design studio', 'luxury real estate agency'],
        locations:
          settings.locations.length > 0 ? settings.locations : ['London UK', 'Austin TX', 'Miami FL'],
      },
      {
        name: 'Architectural Studios & Luxury Architects (London UK)',
        industries: ['architectural design studio', 'luxury residential architect'],
        locations: ['London UK', 'Chelsea London', 'Mayfair London'],
      },
      {
        name: 'Cosmetic Dental Clinics & Medical Spas (Miami & Fort Lauderdale)',
        industries: ['cosmetic dental clinic', 'aesthetic medical spa'],
        locations: ['Miami FL', 'Coral Gables FL', 'Fort Lauderdale FL'],
      },
      {
        name: 'High-End Interior Design & Decor Studios (New York NY)',
        industries: ['luxury interior designer', 'high end interior design studio'],
        locations: ['New York NY', 'Manhattan NY', 'Brooklyn NY'],
      },
      {
        name: 'Cosmetic Surgery & Modern Healthcare (Austin & Dallas)',
        industries: ['plastic surgery clinic', 'aesthetic dermatology practice'],
        locations: ['Austin TX', 'Dallas TX'],
      },
      {
        name: 'Custom Luxury Home Builders (Los Angeles & Beverly Hills)',
        industries: ['custom luxury home builder', 'high end residential general contractor'],
        locations: ['Los Angeles CA', 'Beverly Hills CA', 'Santa Monica CA'],
      },
      {
        name: 'Commercial Litigation & Corporate Law Firms (Manchester & Birmingham)',
        industries: ['boutique law firm', 'commercial litigation solicitors'],
        locations: ['Manchester UK', 'Birmingham UK'],
      },
      {
        name: 'Architectural Lighting & Landscape Studios (Chicago & Seattle)',
        industries: ['architectural lighting design', 'high end landscape architect'],
        locations: ['Chicago IL', 'Seattle WA'],
      },
      {
        name: 'Private Wealth Advisory & Family Offices (Toronto & Vancouver)',
        industries: ['private wealth management firm', 'family office advisory'],
        locations: ['Toronto ON', 'Vancouver BC'],
      },
    ]

    let sentSoFar = 0
    let scoutedSoFar = 0
    let qualifiedSoFar = 0
    let cycle = 1

    try {
      while (sentSoFar < targetCount && !stopRequestedRef.current) {
        setTerminalCycle(cycle)
        const currentSector = fallbackSectors[(cycle - 1) % fallbackSectors.length]
        setTerminalNiche(currentSector.name)

        const remainingNeeded = targetCount - sentSoFar
        // Snappy batching: request up to 3 emails per cycle.
        // Discovery + evaluation + Gemini pitch + Brevo send for 3 leads finishes in ~8-12 seconds,
        // which runs safely within Vercel serverless execution limits and provides progressive live UI feedback.
        const batchTarget = Math.min(3, remainingNeeded)

        setAgentTerminalStatus('scouting')
        addAgentLog(
          'cycle',
          `Cycle ${cycle} active: Scouting for ${batchTarget} high-converting leads (${sentSoFar}/${targetCount} sent).`,
          `Sector: ${currentSector.name} (${currentSector.locations.join(', ')})`,
        )

        addAgentLog(
          'scout',
          `Querying Google Places & verified registries for "${currentSector.industries.join(', ')}" in ${currentSector.locations.join(', ')}...`,
        )

        // Give operator visual feedback of autonomous scouting
        await new Promise((resolve) => setTimeout(resolve, 800))
        if (stopRequestedRef.current) break

        setAgentTerminalStatus('evaluating')
        addAgentLog(
          'evaluate',
          'Autonomous website inspection underway: analyzing TTFB latency, mobile layout, and direct contact endpoints...',
        )

        const payload: Record<string, unknown> = {
          mode,
          targetCount: batchTarget,
          overrideCriteria: {
            industries: currentSector.industries,
            locations: currentSector.locations,
            min_issue_score: settings.min_issue_score,
          },
        }
        if (mode === 'dry_run' && testRecipientEmail.trim()) {
          payload.testRecipientEmail = testRecipientEmail.trim()
        }

        const res = await fetch('/api/admin/outreach/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (stopRequestedRef.current) break

        const rawText = await res.text()
        let data: { ok?: boolean; error?: string; summary?: RunOutreachSummary } | null = null
        try {
          data = JSON.parse(rawText)
        } catch {
          // If server returned non-JSON (e.g. 504 Gateway Timeout or HTML proxy error), recover gracefully
          const isTimeout = res.status === 504 || rawText.includes('timeout') || rawText.includes('An error occurred')
          const recoveryNote = isTimeout
            ? `Vercel serverless gateway timed out during Cycle ${cycle}. Engine auto-recovering in 2s with next sector...`
            : `Network sync warning (HTTP ${res.status}). Auto-recovering in 2s...`

          addAgentLog('thought', recoveryNote, undefined, 'warning')
          await new Promise((resolve) => setTimeout(resolve, 2000))
          cycle += 1
          continue
        }

        if (!res.ok || !data || !data.ok || !data.summary) {
          const errMsg = data?.error || `Server error encountered during Cycle ${cycle} (HTTP ${res.status})`
          if (errMsg.toLowerCase().includes('api key') || errMsg.toLowerCase().includes('configuration')) {
            addAgentLog('error', `Configuration requirement: ${errMsg}`)
            setTerminalError(errMsg)
            setAgentTerminalStatus('failed')
            toast.error(errMsg)
            break
          }

          addAgentLog('thought', `Cycle ${cycle} notice: ${errMsg}. Auto-recovering in 2s...`, undefined, 'warning')
          await new Promise((resolve) => setTimeout(resolve, 2000))
          cycle += 1
          continue
        }

        const summary: RunOutreachSummary = data.summary
        setLastRunSummary(summary)

        scoutedSoFar += summary.scoutedCount
        qualifiedSoFar += summary.qualifiedCount
        setTerminalTotalScouted(scoutedSoFar)
        setTerminalTotalQualified(qualifiedSoFar)

        const noEmailNote =
          summary.qualifiedCount > 0 && summary.sentCount === 0
            ? ` (Note: ${summary.qualifiedCount} qualified businesses had no public contact email listed on their site)`
            : ''

        addAgentLog(
          'evaluate',
          `Evaluation complete: ${summary.scoutedCount} discovered, ${summary.qualifiedCount} qualified for pitch criteria.${noEmailNote}`,
        )

        // Process newly dispatched emails
        if (summary.dispatches && summary.dispatches.length > 0) {
          setAgentTerminalStatus('synthesizing')
          addAgentLog(
            'synthesize',
            `Gemini AI generated ${summary.dispatches.length} bespoke value proposition pitches. Transmitting via Brevo SMTP...`,
          )

          for (const d of summary.dispatches) {
            sessionDispatches.push(d)
            addAgentLog(
              'dispatch',
              `Dispatched proposal to ${d.businessName} (${d.recipientEmail})`,
              `Subject: "${d.subject}" [${d.status.toUpperCase()}]${d.error ? ` — Error: ${d.error}` : ''}`,
            )
          }
          setTerminalDispatches([...sessionDispatches])
        }

        sentSoFar += summary.sentCount
        setTerminalTotalSent(sentSoFar)

        if (typeof summary.sentTodayBeforeRun === 'number') {
          setSentToday(summary.sentTodayBeforeRun + (mode === 'dry_run' ? 0 : summary.sentCount))
        }

        // Termination Checks:
        if (sentSoFar >= targetCount) {
          addAgentLog(
            'success',
            `Mission accomplished! ${sentSoFar} of ${targetCount} requested emails dispatched.`,
            `Executive summary email delivered to adeniranglory129@gmail.com. Inbound replies routed to virtueco.dev@gmail.com.`,
          )
          setAgentTerminalStatus('completed')
          toast.success(`Autonomous outreach target met: ${sentSoFar} emails sent.`)
          break
        }

        if (summary.status === 'cap_reached') {
          addAgentLog(
            'safeguard',
            `Daily send cap reached (${summary.dailyCap} emails). Halting further cycles to protect domain deliverability.`,
          )
          setAgentTerminalStatus('completed')
          toast.info('Daily send cap reached for today.')
          break
        }

        if (summary.sentCount === 0) {
          addAgentLog(
            'cycle',
            `Cycle ${cycle}: 0 deliverable emails dispatched in "${currentSector.name}". Relentlessly rotating to next sector to achieve remaining target of ${remainingNeeded} emails...`,
            undefined,
            'info',
          )
        }

        // Target not yet reached: notify user and cycle
        setAgentTerminalStatus('cycling')
        addAgentLog(
          'cycle',
          `Progress update: ${sentSoFar} of ${targetCount} sent. Rotating to next sector in 2s...`,
        )

        await new Promise((resolve) => setTimeout(resolve, 2000))
        if (stopRequestedRef.current) break

        cycle += 1
      }

      if (stopRequestedRef.current) {
        addAgentLog(
          'thought',
          `Autonomous engine paused by operator. Finished with ${sentSoFar} emails dispatched.`,
        )
        setAgentTerminalStatus('stopped')
        toast.info('Autonomous outreach engine stopped.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network communication error'
      addAgentLog('error', `Network error during autonomous execution: ${message}`)
      setTerminalError(message)
      setAgentTerminalStatus('failed')
      toast.error(message)
    } finally {
      setIsRunningDryRun(false)
      setIsRunningLive(false)
      setIsStoppingAgent(false)
      await refreshAll()
    }
  }

  async function handleAddProspect(e: React.FormEvent) {
    e.preventDefault()
    if (!newBusinessName.trim()) {
      toast.error('Business name is required')
      return
    }

    setIsAddingProspect(true)
    try {
      const res = await fetch('/api/admin/outreach/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: newBusinessName.trim(),
          website_url: newWebsiteUrl.trim() || null,
          industry: newIndustry.trim() || null,
          location: newLocation.trim() || null,
          contact_email: newContactEmail.trim() || null,
        }),
      })
      const data = await res.json()
      if (res.ok && data.ok && data.prospect) {
        setProspects((prev) => [
          data.prospect,
          ...prev.filter((item) => item.id !== data.prospect.id),
        ])
        setNewBusinessName('')
        setNewWebsiteUrl('')
        setNewIndustry('')
        setNewLocation('')
        setNewContactEmail('')
        toast.success(`Added prospect: ${data.prospect.business_name}`)
      } else {
        toast.error(data.error || 'Failed to add prospect')
      }
    } catch {
      toast.error('Network error while adding prospect')
    } finally {
      setIsAddingProspect(false)
    }
  }

  async function handleUpdateProspectStatus(id: string, status: ProspectStatus) {
    try {
      const res = await fetch('/api/admin/outreach/prospects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const data = await res.json()
      if (res.ok && data.ok && data.prospect) {
        setProspects((prev) =>
          prev.map((item) => (item.id === id ? data.prospect : item)),
        )
        toast.success(`Updated prospect status to ${status}`)
      } else {
        toast.error(data.error || 'Failed to update prospect status')
      }
    } catch {
      toast.error('Network error while updating prospect')
    }
  }

  const filteredProspects = React.useMemo(() => {
    return prospects.filter((p) => {
      if (prospectStatusFilter !== 'all' && p.status !== prospectStatusFilter) {
        return false
      }
      if (prospectSearch.trim()) {
        const q = prospectSearch.trim().toLowerCase()
        const haystack = [
          p.business_name,
          p.normalized_domain,
          p.contact_email,
          p.industry,
          p.location,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      }
      return true
    })
  }, [prospects, prospectStatusFilter, prospectSearch])

  const pitchedCount = React.useMemo(
    () => prospects.filter((p) => p.status === 'pitched').length,
    [prospects],
  )
  const qualifiedCount = React.useMemo(
    () =>
      prospects.filter((p) => p.status === 'qualified' || p.status === 'qualified_no_email')
        .length,
    [prospects],
  )

  return (
    <div className="flex flex-col gap-6" data-testid="outreach-console">
      {/* KPI & Status Overview Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Engine State</span>
            <Radar className="size-4 text-primary" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className="text-xl font-semibold"
              data-testid="outreach-engine-status"
            >
              {settings.is_paused ? 'Paused' : 'Active'}
            </span>
            <Badge variant={settings.is_paused ? 'muted' : 'default'}>
              {settings.is_paused ? 'Standby' : 'Daily 09:00 UTC'}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Provider: {settings.discovery_provider.toUpperCase()}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Daily Send Quota</span>
            <Send className="size-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-semibold" data-testid="outreach-sent-today">
              {sentToday}
            </span>
            <span className="text-sm text-muted-foreground">
              / {settings.daily_send_cap} emails today
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Remaining today: {Math.max(0, settings.daily_send_cap - sentToday)}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Prospect Pipeline</span>
            <Globe className="size-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-semibold">{prospects.length}</span>
            <span className="text-xs text-muted-foreground">
              ({qualifiedCount} qualified · {pitchedCount} pitched)
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Min issue score: {settings.min_issue_score}/100
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Safety &amp; Dry-Run</span>
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <div className="mt-2 truncate text-sm font-semibold">
            {settings.test_recipient_email || 'No test inbox set'}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Deduplication &amp; one-click opt-out active
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={settings.is_paused ? 'default' : 'outline'}
            size="sm"
            onClick={handleTogglePause}
            disabled={isTogglingPause}
            data-testid="toggle-pause-button"
          >
            {settings.is_paused ? (
              <>
                <Play className="mr-1.5 size-4" />
                Resume Daily Outreach
              </>
            ) : (
              <>
                <Pause className="mr-1.5 size-4" />
                Pause Daily Outreach
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleOpenLaunchDialog('dry_run')}
            disabled={isRunningDryRun || isRunningLive}
            data-testid="run-dry-run-button"
          >
            <Sparkles className="mr-1.5 size-4" />
            {isRunningDryRun ? 'Running Dry-Run…' : 'Run Dry-Run Verification'}
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => handleOpenLaunchDialog('manual')}
            disabled={isRunningLive || isRunningDryRun}
            data-testid="run-live-outreach-button"
            className="bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:brightness-110"
          >
            <Send className="mr-1.5 size-4" />
            {isRunningLive ? 'Autonomous Agent Active…' : 'Run Live Outreach Now'}
          </Button>

          {terminalLogs.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTerminalOpen(true)}
              className="border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
            >
              <Terminal className="mr-1.5 size-4" />
              Agent Terminal ({terminalTotalSent}/{terminalTargetGoal})
            </Button>
          ) : null}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={refreshAll}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-1.5 size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Last Run Summary Banner */}
      {lastRunSummary ? (
        <div
          className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm"
          data-testid="last-run-summary"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold">
              Latest Run ({lastRunSummary.mode.toUpperCase()} — {lastRunSummary.status})
            </span>
            <span className="text-xs text-muted-foreground">
              Scouted: {lastRunSummary.scoutedCount} · Qualified: {lastRunSummary.qualifiedCount} ·
              Sent: {lastRunSummary.sentCount} · Skipped: {lastRunSummary.skippedCount} · Failed:{' '}
              {lastRunSummary.failedCount}
            </span>
          </div>
        </div>
      ) : null}

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <Button
          type="button"
          variant={activeTab === 'controls' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('controls')}
        >
          Targeting &amp; Safeguards
        </Button>
        <Button
          type="button"
          variant={activeTab === 'prospects' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('prospects')}
        >
          Prospect Pipeline ({prospects.length})
        </Button>
        <Button
          type="button"
          variant={activeTab === 'runs' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('runs')}
        >
          Runs &amp; Dispatches ({runs.length})
        </Button>
      </div>

      {/* Tab 1: Targeting & Safeguards Configuration */}
      {activeTab === 'controls' && (
        <form
          onSubmit={handleSaveSettings}
          className="grid grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-6 lg:grid-cols-2"
          data-testid="outreach-settings-form"
        >
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold">Scouting &amp; Targeting Criteria</h2>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Quick High-Converting Scouting Presets (1-Click Fill)
              </span>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIndustriesInput('dental clinic, medspa, cosmetic dentistry, dermatology')
                    setLocationsInput('Austin TX, Houston TX, Miami FL')
                    setKeywordsInput('appointment, clinic, aesthetics')
                    setMinIssueScore(10)
                  }}
                >
                  Clinics &amp; Medspas
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIndustriesInput('law firm, family lawyer, accounting firm, tax consultant')
                    setLocationsInput('Chicago IL, Atlanta GA, London UK')
                    setKeywordsInput('attorney, cpa, practice')
                    setMinIssueScore(10)
                  }}
                >
                  Law &amp; Accounting
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIndustriesInput('roofing contractor, hvac company, solar installer, remodeling')
                    setLocationsInput('Dallas TX, Phoenix AZ, Manchester UK')
                    setKeywordsInput('contractors, repair, installation')
                    setMinIssueScore(10)
                  }}
                >
                  Home Services
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIndustriesInput('real estate agency, boutique hotel, interior design studio')
                    setLocationsInput('Lagos NG, London UK, Austin TX')
                    setKeywordsInput('luxury, bookings, properties')
                    setMinIssueScore(10)
                  }}
                >
                  Real Estate &amp; Hospitality
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="outreach-industries" className="text-xs font-medium">
                Target Industries (comma-separated)
              </label>
              <input
                id="outreach-industries"
                type="text"
                value={industriesInput}
                onChange={(e) => setIndustriesInput(e.target.value)}
                placeholder="dental, law firm, medspa, roofing, real estate"
                className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="outreach-locations" className="text-xs font-medium">
                Target Locations (comma-separated)
              </label>
              <input
                id="outreach-locations"
                type="text"
                value={locationsInput}
                onChange={(e) => setLocationsInput(e.target.value)}
                placeholder="Austin TX, London UK, Lagos NG"
                className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="outreach-keywords" className="text-xs font-medium">
                Additional Search Keywords (optional, comma-separated)
              </label>
              <input
                id="outreach-keywords"
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="clinic, practice, contractors"
                className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="outreach-provider" className="text-xs font-medium">
                  Discovery Source Provider
                </label>
                <select
                  id="outreach-provider"
                  value={discoveryProvider}
                  onChange={(e) => setDiscoveryProvider(e.target.value as DiscoveryProvider)}
                  className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm"
                >
                  {DISCOVERY_PROVIDERS.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="outreach-min-score" className="text-xs font-medium">
                  Min Redesign Issue Score (0–100)
                </label>
                <input
                  id="outreach-min-score"
                  type="number"
                  min={0}
                  max={100}
                  value={minIssueScore}
                  onChange={(e) => setMinIssueScore(Number(e.target.value))}
                  className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold">Daily Quota &amp; Dry-Run Verification</h2>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="outreach-daily-cap" className="text-xs font-medium">
                  Daily Send Cap (1–200 emails/day)
                </label>
                <input
                  id="outreach-daily-cap"
                  type="number"
                  min={1}
                  max={200}
                  value={dailySendCap}
                  onChange={(e) => setDailySendCap(Number(e.target.value))}
                  className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="outreach-test-email" className="text-xs font-medium">
                  Test Recipient Email (receives [DRY RUN] pitches)
                </label>
                <input
                  id="outreach-test-email"
                  type="email"
                  value={testRecipientEmail}
                  onChange={(e) => setTestRecipientEmail(e.target.value)}
                  placeholder="founder@virtuecowebworks.solutions"
                  className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm"
                />
              </div>

              <label className="flex items-center gap-2.5 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={dryRunDefault}
                  onChange={(e) => setDryRunDefault(e.target.checked)}
                  className="size-4 rounded border-border"
                />
                <span>Default manual runs to Dry-Run mode</span>
              </label>

              <div className="mt-2 flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Key className="size-3.5 text-primary" />
                    <span>Engine API Credentials (Saved in Secure Database)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowApiKeys(!showApiKeys)}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    {showApiKeys ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                    <span>{showApiKeys ? 'Hide' : 'Reveal'}</span>
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="outreach-serper-key" className="text-[11px] font-medium text-muted-foreground">
                    Serper Places API Key (Business Discovery)
                  </label>
                  <input
                    id="outreach-serper-key"
                    type={showApiKeys ? 'text' : 'password'}
                    value={serperApiKey}
                    onChange={(e) => setSerperApiKey(e.target.value)}
                    placeholder="Enter Serper API key"
                    className="rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="outreach-gemini-key" className="text-[11px] font-medium text-muted-foreground">
                    Gemini API Key (AI Audit Pitch Customization)
                  </label>
                  <input
                    id="outreach-gemini-key"
                    type={showApiKeys ? 'text' : 'password'}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="Enter Gemini API key"
                    className="rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button
                type="submit"
                disabled={isSavingSettings}
                data-testid="save-outreach-settings"
              >
                {isSavingSettings ? 'Saving…' : 'Save Outreach Configuration'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Prospect Pipeline */}
      {activeTab === 'prospects' && (
        <div className="flex flex-col gap-6">
          {/* Manual Prospect Seed Form */}
          <form
            onSubmit={handleAddProspect}
            className="rounded-2xl border border-border bg-card p-5"
            data-testid="add-prospect-form"
          >
            <h3 className="text-sm font-semibold">Add / Seed Business Prospect</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <input
                type="text"
                value={newBusinessName}
                onChange={(e) => setNewBusinessName(e.target.value)}
                placeholder="Business name *"
                required
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs"
              />
              <input
                type="url"
                value={newWebsiteUrl}
                onChange={(e) => setNewWebsiteUrl(e.target.value)}
                placeholder="https://example.com (optional)"
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs"
              />
              <input
                type="email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                placeholder="contact@example.com"
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs"
              />
              <input
                type="text"
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                placeholder="Industry (e.g. dental)"
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                />
                <Button type="submit" size="sm" disabled={isAddingProspect}>
                  <Plus className="mr-1 size-3.5" />
                  Add
                </Button>
              </div>
            </div>
          </form>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={prospectStatusFilter}
                onChange={(e) =>
                  setProspectStatusFilter(e.target.value as 'all' | ProspectStatus)
                }
                className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs"
              >
                <option value="all">All Statuses</option>
                {PROSPECT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="search"
                value={prospectSearch}
                onChange={(e) => setProspectSearch(e.target.value)}
                placeholder="Search business or domain…"
                className="w-full rounded-xl border border-border bg-card py-1.5 pl-8 pr-3 text-xs"
              />
            </div>
          </div>

          {/* Prospects Table */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium">Website &amp; Contact</th>
                  <th className="px-4 py-3 font-medium">Site Evaluation</th>
                  <th className="px-4 py-3 font-medium">Pitch Subject</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProspects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No prospects match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredProspects.map((prospect) => (
                    <tr key={prospect.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">
                          {prospect.business_name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {[prospect.industry, prospect.location].filter(Boolean).join(' · ') ||
                            prospect.source_provider}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {prospect.website_url ? (
                          <a
                            href={prospect.website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <span>{prospect.normalized_domain || prospect.website_url}</span>
                            <ExternalLink className="size-3" />
                          </a>
                        ) : (
                          <span className="text-amber-500">No website listed</span>
                        )}
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Mail className="size-3" />
                          <span>{prospect.contact_email || 'No email extracted'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">Score: {prospect.issue_score}/100</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(prospect.issues ?? []).slice(0, 3).map((issue) => (
                            <span
                              key={issue.code}
                              className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                            >
                              {issue.code}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        {prospect.pitch_subject ? (
                          <div className="flex flex-col gap-1">
                            <div className="truncate font-medium">{prospect.pitch_subject}</div>
                            {prospect.pitch_preview ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedProspectId(
                                    expandedProspectId === prospect.id ? null : prospect.id,
                                  )
                                }
                                className="w-fit text-[11px] font-medium text-primary hover:underline"
                              >
                                {expandedProspectId === prospect.id
                                  ? 'Hide Email Content'
                                  : 'View Sent Email Content'}
                              </button>
                            ) : null}
                            {expandedProspectId === prospect.id && prospect.pitch_preview ? (
                              <pre className="mt-1 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-muted/40 p-2.5 font-sans text-[11px] leading-relaxed text-foreground">
                                {prospect.pitch_preview}
                              </pre>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                        {prospect.last_error ? (
                          <div className="mt-0.5 truncate text-[11px] text-destructive">
                            {prospect.last_error}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          aria-label={`Status for ${prospect.business_name}`}
                          value={prospect.status}
                          onChange={(e) =>
                            handleUpdateProspectStatus(
                              prospect.id,
                              e.target.value as ProspectStatus,
                            )
                          }
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                        >
                          {PROSPECT_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Runs & Dispatches Audit History */}
      {activeTab === 'runs' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Recent Outreach Runs</h3>
            <div className="mt-3 flex flex-col gap-2.5">
              {runs.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No outreach runs recorded yet.
                </p>
              ) : (
                runs.map((run) => (
                  <div
                    key={run.id}
                    className="flex flex-col gap-1 rounded-xl border border-border p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {run.status === 'completed' ? (
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                        ) : run.status === 'failed' ? (
                          <AlertCircle className="size-3.5 text-destructive" />
                        ) : (
                          <Clock className="size-3.5 text-amber-500" />
                        )}
                        <span className="font-semibold uppercase">{run.mode}</span>
                        <Badge variant="outline">{run.status}</Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(run.started_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Scouted: {run.scouted_count} · Qualified: {run.qualified_count} · Sent:{' '}
                      {run.sent_count} · Skipped: {run.skipped_count} · Failed: {run.failed_count}
                    </div>
                    {run.error_summary ? (
                      <div className="text-destructive">{run.error_summary}</div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">
              Sent Emails, Recipients, Websites &amp; Full Pitch Content ({dispatches.length})
            </h3>
            <div className="mt-3 flex flex-col gap-2.5">
              {dispatches.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No email dispatches logged yet.
                </p>
              ) : (
                dispatches.map((d) => {
                  const linkedProspect =
                    (d.prospect_id ? prospectById.get(d.prospect_id) : undefined) ??
                    prospectByBusinessName.get(d.business_name.toLowerCase())
                  const websiteUrl = linkedProspect?.website_url ?? null
                  const websiteDomain = linkedProspect?.normalized_domain ?? websiteUrl
                  const isExpanded = expandedDispatchId === d.id

                  return (
                    <div
                      key={d.id}
                      className="flex flex-col gap-1.5 rounded-xl border border-border p-3.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground">{d.business_name}</span>
                        <Badge variant={d.is_dry_run ? 'muted' : 'default'}>
                          {d.is_dry_run ? 'DRY RUN' : d.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="size-3 text-primary" />
                          <span>
                            To: <strong className="text-foreground">{d.recipient_email}</strong>
                          </span>
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <Globe className="size-3 text-primary" />
                          {websiteUrl ? (
                            <a
                              href={websiteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                            >
                              <span>{websiteDomain}</span>
                              <ExternalLink className="size-3" />
                            </a>
                          ) : (
                            <span className="text-amber-500">No website listed</span>
                          )}
                        </span>

                        <span>{new Date(d.sent_at).toLocaleString()}</span>
                      </div>

                      <div className="font-medium text-foreground">
                        Subject: <span className="text-primary">{d.subject}</span>
                      </div>

                      {d.body_preview ? (
                        <div className="mt-1">
                          <button
                            type="button"
                            onClick={() => setExpandedDispatchId(isExpanded ? null : d.id)}
                            className="text-[11px] font-semibold text-primary hover:underline"
                          >
                            {isExpanded ? 'Hide Full Email Content ▲' : 'View Full Email Content ▼'}
                          </button>
                          {isExpanded ? (
                            <pre className="mt-2 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-muted/40 p-3 font-sans text-xs leading-relaxed text-foreground">
                              {d.body_preview}
                            </pre>
                          ) : null}
                        </div>
                      ) : null}

                      {d.error ? <div className="text-destructive">{d.error}</div> : null}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Autonomous Outreach Launch Dialog */}
      <OutreachLaunchDialog
        isOpen={isLaunchDialogOpen}
        onClose={() => setIsLaunchDialogOpen(false)}
        onLaunch={handleLaunchAutonomousRun}
        sentToday={sentToday}
        dailyCap={settings.daily_send_cap}
        isEngineBusy={isRunningLive || isRunningDryRun}
        initialMode={launchDialogInitialMode}
      />

      {/* Antigravity / Gemini-Inspired Live Agent Terminal */}
      <OutreachAgentTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onStop={handleStopAgent}
        isStopping={isStoppingAgent}
        mode={terminalMode}
        targetGoal={terminalTargetGoal}
        totalSent={terminalTotalSent}
        totalScouted={terminalTotalScouted}
        totalQualified={terminalTotalQualified}
        currentCycle={terminalCycle}
        currentNiche={terminalNiche}
        logs={terminalLogs}
        dispatches={terminalDispatches}
        status={agentTerminalStatus}
        errorMessage={terminalError}
      />
    </div>
  )
}
