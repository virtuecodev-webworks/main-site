'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { VantraButton } from '@/components/ui/vantra-button'
import { PHOTOS } from '@/lib/photos'

const HERO_EASE = [0.215, 0.61, 0.355, 1] as const

export function Hero() {
  const t = useTranslations('Home.hero')
  const sectionRef = React.useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 26,
    restDelta: 0.001,
  })

  // Vantra signature scroll-linked recede & internal media parallax
  const sectionScale = useTransform(
    smoothProgress,
    [0, 1],
    prefersReducedMotion ? [1, 1] : [1, 0.96],
  )
  const mediaY = useTransform(
    smoothProgress,
    [0, 1],
    prefersReducedMotion ? ['0%', '0%'] : ['0%', '12%'],
  )
  const contentY = useTransform(
    smoothProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -24],
  )

  return (
    <motion.section
      ref={sectionRef}
      style={{ scale: sectionScale }}
      className="section_hero relative m-2 flex min-h-[calc(100dvh-1rem)] origin-bottom flex-col justify-end overflow-hidden rounded-[20px] bg-[#0a0a0a] px-6 pt-24 pb-8 text-[#f5f4f0] sm:px-10 sm:pt-28 sm:pb-12 lg:px-14 lg:pb-14"
    >
      {/* Full-bleed cinematic background video + photograph fallback + Vantra scroll parallax */}
      <motion.div
        aria-hidden="true"
        style={{ y: mediaY }}
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <motion.div
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1.03, opacity: 0.55 }}
          transition={{ duration: 1.3, ease: HERO_EASE }}
          className="relative size-full"
        >
          <Image
            src={PHOTOS.hero}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={PHOTOS.hero}
            className="absolute inset-0 size-full object-cover object-center opacity-75 mix-blend-lighten"
          >
            <source src="/media/hero-loop.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Cinematic dark atmosphere gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(65% 65% at 75% 25%, rgba(220, 170, 40, 0.16) 0%, rgba(10, 10, 10, 0.42) 55%, rgba(10, 10, 10, 0.94) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10, 10, 10, 0.5) 0%, rgba(10, 10, 10, 0.15) 40%, rgba(10, 10, 10, 0.94) 100%)',
          }}
        />
      </motion.div>

      {/* Main Hero Content: Pristine Simplicity */}
      <motion.div
        style={{ y: contentY }}
        className="hero_content relative z-10 w-full"
      >
        {/* Headline + Subtitle & CTAs (Fully Localized, Pristine & Uncluttered) */}
        <div className="max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: HERO_EASE }}
            className="font-display text-[clamp(2.5rem,5.2vw,5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-[#f5f4f0]"
          >
            {t('title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: HERO_EASE }}
            className="mt-6 max-w-[46ch] text-base leading-relaxed text-[#f5f4f0]/80 sm:text-lg"
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: HERO_EASE }}
            className="mt-8 flex flex-wrap items-center gap-3.5"
          >
            <VantraButton href="/contact" variant="gold">
              {t('primaryCta')}
            </VantraButton>
            <VantraButton href="/portfolio" variant="light">
              {t('secondaryCta')}
            </VantraButton>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  )
}
