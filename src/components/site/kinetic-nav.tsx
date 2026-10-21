'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // GSAP Setup & Hover Effects
  useEffect(() => {
    if (!containerRef.current) return

    try {
      if (!gsap.parseEase('kineticEase')) {
        CustomEase.create('kineticEase', '0.65, 0.01, 0.05, 0.99')
        gsap.defaults({ ease: 'kineticEase', duration: 0.65 })
      }
    } catch {
      gsap.defaults({ ease: 'power2.out', duration: 0.65 })
    }

    const ctx = gsap.context(() => {
      const menuItems = containerRef.current!.querySelectorAll('.kinetic-menu-item[data-shape]')
      const shapesContainer = containerRef.current!.querySelector('.kinetic-shapes')

      menuItems.forEach((item) => {
        const shapeIndex = item.getAttribute('data-shape')
        const shape = shapesContainer ? shapesContainer.querySelector(`.bg-shape-${shapeIndex}`) : null
        if (!shape) return

        const shapeEls = shape.querySelectorAll('.shape-element')

        const onEnter = () => {
          if (shapesContainer) {
            shapesContainer.querySelectorAll('.bg-shape').forEach((s) => s.classList.remove('active'))
          }
          shape.classList.add('active')
          gsap.fromTo(
            shapeEls,
            { scale: 0.6, opacity: 0, rotation: -12 },
            { scale: 1, opacity: 1, rotation: 0, duration: 0.5, stagger: 0.06, ease: 'back.out(1.7)', overwrite: 'auto' }
          )
        }

        const onLeave = () => {
          gsap.to(shapeEls, {
            scale: 0.8,
            opacity: 0,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: () => shape.classList.remove('active'),
            overwrite: 'auto',
          })
        }

        item.addEventListener('mouseenter', onEnter)
        item.addEventListener('mouseleave', onLeave)

        ;(item as any)._cleanup = () => {
          item.removeEventListener('mouseenter', onEnter)
          item.removeEventListener('mouseleave', onLeave)
        }
      })
    }, containerRef)

    return () => {
      ctx.revert()
      if (containerRef.current) {
        const items = containerRef.current.querySelectorAll('.kinetic-menu-item[data-shape]')
        items.forEach((item: any) => item._cleanup && item._cleanup())
      }
    }
  }, [])

  // Menu Open/Close GSAP Timeline
  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      const navWrap = containerRef.current!.querySelector('.kinetic-nav-wrapper')
      const menu = containerRef.current!.querySelector('.kinetic-menu-content')
      const overlay = containerRef.current!.querySelector('.kinetic-overlay')
      const bgPanels = containerRef.current!.querySelectorAll('.kinetic-backdrop-layer')
      const menuLinks = containerRef.current!.querySelectorAll('.kinetic-nav-link')
      const menuButton = containerRef.current!.querySelector('.kinetic-close-btn')
      const menuButtonTexts = menuButton?.querySelectorAll('.btn-label')
      const menuButtonIcon = menuButton?.querySelector('.kinetic-btn-icon')

      const tl = gsap.timeline()

      if (isMenuOpen) {
        document.body.style.overflow = 'hidden'
        if (navWrap) navWrap.setAttribute('data-nav', 'open')

        tl.set(navWrap, { display: 'block' })
          .set(menu, { xPercent: 0 }, '<')
        
        if (menuButtonTexts && menuButtonTexts.length) {
          tl.fromTo(menuButtonTexts, { yPercent: 0 }, { yPercent: -100, stagger: 0.15 }, '<')
        }
        if (menuButtonIcon) {
          tl.fromTo(menuButtonIcon, { rotate: 0 }, { rotate: 315 }, '<')
        }

        tl.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1 }, '<')
          .fromTo(bgPanels, { xPercent: 101 }, { xPercent: 0, stagger: 0.1, duration: 0.5 }, '<')
          .fromTo(menuLinks, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05 }, '<+=0.25')
      } else {
        document.body.style.overflow = ''
        if (navWrap) navWrap.setAttribute('data-nav', 'closed')

        tl.to(overlay, { autoAlpha: 0, duration: 0.3 })
          .to(menu, { xPercent: 120, duration: 0.4 }, '<')

        if (menuButtonTexts && menuButtonTexts.length) {
          tl.to(menuButtonTexts, { yPercent: 0, duration: 0.3 }, '<')
        }
        if (menuButtonIcon) {
          tl.to(menuButtonIcon, { rotate: 0, duration: 0.3 }, '<')
        }

        tl.set(navWrap, { display: 'none' })
      }
    }, containerRef)

    return () => {
      document.body.style.overflow = ''
      ctx.revert()
    }
  }, [isMenuOpen])

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

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Morphing Kinetic Menu Toggle Button - Always visible, fixed z-index */}
      <button
        type="button"
        role="button"
        aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
        onClick={toggleMenu}
        className="kinetic-close-btn relative z-[100] flex h-10 items-center gap-2 rounded-full border border-border bg-background/90 px-4 py-2 text-xs font-semibold tracking-wider text-foreground shadow-sm backdrop-blur-md transition-all hover:border-gold-500/60 hover:bg-muted active:scale-95"
      >
        <div className="relative h-4 overflow-hidden w-11 text-center">
          <span className="btn-label block transition-transform duration-300">Menu</span>
          <span className="btn-label block transition-transform duration-300 text-gold-500">Close</span>
        </div>
        <div className="flex size-4 items-center justify-center">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="kinetic-btn-icon size-3.5 origin-center text-foreground transition-transform"
          >
            <path d="M7 16L7 0L9 0L9 16L7 16Z" fill="currentColor" />
            <path d="M16 7L0 7L0 9L16 9L16 7Z" fill="currentColor" />
          </svg>
        </div>
      </button>

      {/* Kinetic Overlay Container */}
      <div
        className="kinetic-nav-wrapper fixed inset-0 z-[90] hidden"
        data-nav={isMenuOpen ? 'open' : 'closed'}
      >
        {/* Backdrop Overlay */}
        <div
          className="kinetic-overlay absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          onClick={closeMenu}
          aria-hidden="true"
        />

        {/* Sliding Menu Sheet */}
        <nav
          className="kinetic-menu-content absolute right-0 top-0 bottom-0 w-full max-w-lg border-l border-border bg-background shadow-2xl flex flex-col justify-between p-6 sm:p-12 overflow-y-auto"
          aria-label="Mobile Navigation"
        >
          {/* Animated Background Layers */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="kinetic-backdrop-layer absolute inset-0 bg-muted/40" />
            <div className="kinetic-backdrop-layer absolute inset-0 bg-background" />

            {/* Ambient Shapes Container */}
            <div className="kinetic-shapes absolute inset-0 opacity-40 dark:opacity-25 pointer-events-none">
              <svg className="bg-shape bg-shape-1 absolute inset-0 size-full" viewBox="0 0 400 400" fill="none">
                <circle className="shape-element" cx="90" cy="120" r="45" fill="rgba(220,170,40,0.2)" />
                <circle className="shape-element" cx="300" cy="80" r="60" fill="rgba(20,160,108,0.18)" />
                <circle className="shape-element" cx="200" cy="300" r="75" fill="rgba(220,170,40,0.15)" />
              </svg>
              <svg className="bg-shape bg-shape-2 absolute inset-0 size-full" viewBox="0 0 400 400" fill="none">
                <path className="shape-element" d="M0 200 Q100 120, 200 200 T 400 200" stroke="rgba(220,170,40,0.3)" strokeWidth="40" fill="none" />
                <path className="shape-element" d="M0 270 Q100 190, 200 270 T 400 270" stroke="rgba(20,160,108,0.25)" strokeWidth="30" fill="none" />
              </svg>
              <svg className="bg-shape bg-shape-3 absolute inset-0 size-full" viewBox="0 0 400 400" fill="none">
                <circle className="shape-element" cx="60" cy="60" r="10" fill="rgba(220,170,40,0.35)" />
                <circle className="shape-element" cx="160" cy="60" r="10" fill="rgba(220,170,40,0.35)" />
                <circle className="shape-element" cx="260" cy="60" r="10" fill="rgba(20,160,108,0.3)" />
                <circle className="shape-element" cx="110" cy="160" r="14" fill="rgba(20,160,108,0.3)" />
                <circle className="shape-element" cx="210" cy="160" r="14" fill="rgba(220,170,40,0.3)" />
              </svg>
              <svg className="bg-shape bg-shape-4 absolute inset-0 size-full" viewBox="0 0 400 400" fill="none">
                <path className="shape-element" d="M100 100 Q150 50, 200 100 Q250 150, 200 200 Q150 250, 100 200 Q50 150, 100 100" fill="rgba(220,170,40,0.15)" />
              </svg>
              <svg className="bg-shape bg-shape-5 absolute inset-0 size-full" viewBox="0 0 400 400" fill="none">
                <line className="shape-element" x1="0" y1="100" x2="300" y2="400" stroke="rgba(220,170,40,0.25)" strokeWidth="30" />
                <line className="shape-element" x1="120" y1="0" x2="400" y2="300" stroke="rgba(20,160,108,0.2)" strokeWidth="25" />
              </svg>
            </div>
          </div>

          {/* Header inside Sheet */}
          <div className="relative z-10 pt-12 pb-6 border-b border-border">
            <p className="text-xs font-semibold tracking-widest text-gold-500 uppercase">Virtue &amp; Co. Webworks</p>
            <p className="text-sm text-muted-foreground mt-1">High-Performance Web Development Studio</p>
          </div>

          {/* Nav List */}
          <ul className="relative z-10 flex flex-col gap-5 py-8">
            {PRIMARY_NAV.map((item, idx) => (
              <li key={item.href} className="kinetic-menu-item" data-shape={(idx % 5) + 1}>
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
    </div>
  )
}
