'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export interface StudioShowreelBandProps {
  className?: string
  eyebrow?: string
  title?: string
  subtitle?: string
}

const SHOWCASED_PROJECTS = [
  { slug: 'aurum-capital-platform', label: 'Aurum Capital', tag: 'Private Banking OS' },
  { slug: 'finery-commerce', label: 'Maison Finery', tag: 'Luxury E-Commerce' },
  { slug: 'meridian-editorial', label: 'The Meridian Review', tag: 'Editorial & Audio' },
  { slug: 'northline-studio', label: 'Northline Studio', tag: 'Architectural Prefab' },
  { slug: 'kinetix-ai-cloud', label: 'Kinetix AI Cloud', tag: 'GPU Cloud Platform' },
  { slug: 'solace-health-portal', label: 'Solace Health', tag: 'Longevity Diagnostics' },
]

export function StudioShowreelBand({
  className,
  eyebrow = 'Studio Showreel · 30s',
  title = 'Watch how we design, engineer, and ship.',
  subtitle = 'Six live client platforms built from the ground up. Zero templates, fixed timelines, and verified performance.',
}: StudioShowreelBandProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(true)
  const [progress, setProgress] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState('0:00')

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const cur = videoRef.current.currentTime
    const dur = videoRef.current.duration || 30
    setProgress((cur / dur) * 100)
    const mins = Math.floor(cur / 60)
    const secs = Math.floor(cur % 60)
    setCurrentTime(`${mins}:${secs < 10 ? '0' : ''}${secs}`)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  return (
    <section className={cn('padding-global padding-section', className)}>
      <div className="container-max">
        {/* Header */}
        <div className="section_header flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="label-mono text-primary">
              ( &nbsp;&nbsp;&nbsp;{eyebrow}&nbsp;&nbsp;&nbsp; )
            </span>
            <h2 className="heading-style-h2 mt-3 text-balance">
              {title}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        </div>

        {/* Video Player Card */}
        <div
          ref={containerRef}
          className="group relative mt-10 overflow-hidden rounded-[24px] border border-border/80 bg-[#0a0a0a] shadow-elevation-3 transition-colors hover:border-primary/50"
        >
          <div className="relative aspect-video w-full bg-[#0a0a0a]">
            <video
              ref={videoRef}
              src="/media/brand-intro-v2.mp4"
              poster="/work/aurum-hero.jpg"
              playsInline
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlay}
              className="size-full cursor-pointer object-cover"
            />

            {/* Subtle Gradient Scrim at bottom for controls */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
            />

            {/* Center Big Play Button (when paused) */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/35 backdrop-blur-[2px] transition-all hover:bg-black/25"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.08 }}
                  className="flex size-20 items-center justify-center rounded-full border border-primary/40 bg-primary text-[#0a0a0a] shadow-2xl transition-transform sm:size-24"
                >
                  <Play className="ml-1 size-8 fill-current sm:size-9" />
                </motion.div>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2 p-4 sm:p-6">
              {/* Progress Bar */}
              <div
                onClick={(e) => {
                  if (!videoRef.current) return
                  const rect = e.currentTarget.getBoundingClientRect()
                  const pos = (e.clientX - rect.left) / rect.width
                  videoRef.current.currentTime = pos * (videoRef.current.duration || 30)
                }}
                className="relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20 transition-all hover:h-2"
              >
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between gap-4 text-xs text-[#f5f4f0]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause showreel' : 'Play showreel'}
                    className="flex size-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-colors hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="size-3.5 fill-current" /> : <Play className="ml-0.5 size-3.5 fill-current" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                    className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs transition-colors hover:bg-white/20"
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="size-3.5 text-rose-400" />
                        <span className="font-mono text-[10px] text-white/70">Unmute (Soundbed)</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="size-3.5 text-primary" />
                        <span className="font-mono text-[10px] text-primary">Soundbed Active</span>
                      </>
                    )}
                  </button>

                  <span className="font-mono text-[11px] text-white/60">
                    {currentTime} / 0:30
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden font-mono text-[11px] text-white/50 sm:inline">
                    1080p 60fps · Remotion &amp; Studio Suite
                  </span>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label="Toggle Fullscreen"
                    className="flex size-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-colors hover:bg-white/20"
                  >
                    <Maximize2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Portfolio Jump Directory below the player */}
          <div className="grid grid-cols-2 divide-x divide-y divide-border/60 border-t border-border/80 bg-card sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
            {SHOWCASED_PROJECTS.map((item) => (
              <Link
                key={item.slug}
                href={`/portfolio/${item.slug}`}
                className="group/link flex flex-col justify-between p-3.5 transition-colors hover:bg-muted/50 sm:p-4"
              >
                <div>
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-primary">
                    {item.tag}
                  </span>
                  <p className="mt-1 font-display text-xs font-semibold text-foreground group-hover/link:text-primary sm:text-sm">
                    {item.label}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>View Details</span>
                  <ArrowUpRight className="size-3 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
