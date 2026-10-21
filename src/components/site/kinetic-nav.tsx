'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { PRIMARY_NAV } from '@/lib/studio'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase)
}

interface KineticNavProps {
  className?: string
}

export function KineticNav({ className }: KineticNavProps) {
  const t = useTranslations('Nav')
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const menuContentRef = useRef<HTMLElement>(null)
  const backdropLayersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // GSAP animation when menu opens/closes
  useEffect(() => {
    if (!mounted || !overlayRef.current || !menuContentRef.current) return

    try {
      if (!gsap.parseEase('kineticEase')) {
        CustomEase.create('kineticEase', '0.65, 0.01, 0.05, 0.99')
        gsap.defaults({ ease: 'kineticEase', duration: 0.65 })
      }
    } catch {
      gsap.defaults({ ease: 'power2.out', duration: 0.65 })
    }

    const overlay = overlayRef.current
    const menu = menuContentRef.current
    const bgPanels = backdropLayersRef.current?.querySelectorAll('.kinetic-backdrop-layer')
    const menuLinks = menu.querySelectorAll('.kinetic-nav-link')

    const tl = gsap.timeline()

    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      tl.set(overlay, { display: 'block' })
        .fromTo(overlay.querySelector('.kinetic-backdrop'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 })
        .fromTo(menu, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: 'power3.out' }, '<')
      
      if (bgPanels && bgPanels.length) {
        tl.fromTo(bgPanels, { xPercent: 101 }, { xPercent: 0, stagger: 0.08, duration: 0.45 }, '<+=0.1')
      }

      if (menuLinks && menuLinks.length) {
        tl.fromTo(menuLinks, { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.4 }, '<+=0.15')
      }
    } else {
      document.body.style.overflow = ''
      tl.to(menu, { xPercent: 100, duration: 0.35, ease: 'power3.in' })
        .to(overlay.querySelector('.kinetic-backdrop'), { autoAlpha: 0, duration: 0.25 }, '<')
        .set(overlay, { display: 'none' })
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen, mounted])

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isMenuOpen])

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)
  const closeMenu = () => setIsMenuOpen(false)

  // Portal overlay content
  const overlayContent = mounted ? (
    <div
      ref={overlayRef}
      style={{ display: 'none' }}
      className="fixed inset-0 z-[99999] overflow-hidden"
      aria-hidden={!isMenuOpen}
    >
      {/* Dimmed backdrop */}
      <div
        className="kinetic-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeMenu}
      />

      {/* Sliding Sheet Container */}
      <nav
        ref={menuContentRef}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md sm:max-w-lg border-l border-border bg-background shadow-2xl flex flex-col justify-between p-6 sm:p-10 z-10 overflow-y-auto"
        aria-label="Kinetic Studio Navigation"
      >
        {/* Animated Background Layers */}
        <div ref={backdropLayersRef} className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="kinetic-backdrop-layer absolute inset-0 bg-muted/40" />
          <div className="kinetic-backdrop-layer absolute inset-0 bg-background" />

          {/* Ambient SVG Shapes */}
          <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none">
            <svg className="absolute inset-0 size-full" viewBox="0 0 400 400" fill="none">
              <circle cx="80" cy="120" r="45" fill="rgba(220,170,40,0.25)" />
              <circle cx="300" cy="90" r="65" fill="rgba(16,185,129,0.2)" />
              <circle cx="200" cy="310" r="80" fill="rgba(220,170,40,0.18)" />
            </svg>
          </div>
        </div>

        {/* Top Header inside Sheet with prominent Close Button */}
        <div className="relative z-10 flex items-center justify-between pb-6 border-b border-border">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gold-500 uppercase">Virtue &amp; Co. Webworks</p>
            <p className="text-xs text-muted-foreground mt-0.5">High-Performance Studio</p>
          </div>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close Navigation"
            className="flex items-center gap-2 rounded-full border border-border bg-muted/70 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:border-gold-500 hover:bg-muted active:scale-95 transition-all shadow-sm"
          >
            <span>Close</span>
            <X className="size-4 text-gold-500" />
          </button>
        </div>

        {/* Menu Navigation Links */}
        <ul className="relative z-10 flex flex-col gap-5 py-8 my-auto">
          {PRIMARY_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={closeMenu}
                className="kinetic-nav-link group flex items-center justify-between text-2xl sm:text-3xl font-display font-medium text-foreground transition-colors hover:text-gold-500"
              >
                <span>{t(item.labelKey)}</span>
                <span className="text-sm font-sans text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Bottom Actions inside Sheet */}
        <div className="relative z-10 pt-6 border-t border-border flex flex-col gap-3">
          <Link
            href="/contact"
            onClick={closeMenu}
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <span>{t('quote')}</span>
          </Link>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <Link href="/portal" onClick={closeMenu} className="hover:text-foreground">
              {t('account')}
            </Link>
            <Link href="/login" onClick={closeMenu} className="hover:text-foreground">
              {t('login')}
            </Link>
          </div>
        </div>
      </nav>
    </div>
  ) : null

  return (
    <>
      {/* Morphing Kinetic Menu Toggle Button in Header */}
      <button
        type="button"
        role="button"
        aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
        onClick={toggleMenu}
        className={cn(
          'relative z-50 flex h-10 items-center gap-2 rounded-full border border-border bg-background/90 px-4 py-2 text-xs font-semibold tracking-wider text-foreground shadow-sm backdrop-blur-md transition-all hover:border-gold-500/60 hover:bg-muted active:scale-95 cursor-pointer',
          className,
        )}
      >
        <div className="relative h-4 overflow-hidden w-11 text-center pointer-events-none">
          <span
            className={cn(
              'btn-label block transition-transform duration-300',
              isMenuOpen ? '-translate-y-4' : 'translate-y-0',
            )}
          >
            Menu
          </span>
          <span
            className={cn(
              'btn-label block transition-transform duration-300 text-gold-500',
              isMenuOpen ? '-translate-y-4' : 'translate-y-0',
            )}
          >
            Close
          </span>
        </div>
        <div className="flex size-4 items-center justify-center pointer-events-none">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className={cn(
              'size-3.5 origin-center text-foreground transition-transform duration-300',
              isMenuOpen ? 'rotate-[315deg] text-gold-500' : 'rotate-0',
            )}
          >
            <path d="M7 16L7 0L9 0L9 16L7 16Z" fill="currentColor" />
            <path d="M16 7L0 7L0 9L16 9L16 7Z" fill="currentColor" />
          </svg>
        </div>
      </button>

      {/* Render overlay via portal directly onto document.body to avoid backdrop-filter traps */}
      {mounted && typeof document !== 'undefined' ? createPortal(overlayContent, document.body) : null}
    </>
  )
}
