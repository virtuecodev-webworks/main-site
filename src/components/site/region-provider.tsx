'use client'

import * as React from 'react'
import {
  FALLBACK_REGION,
  chooseCountry,
  forgetCountry,
  readCachedRegion,
  resolveRegion,
  type RegionState,
} from '@/lib/geo/client'

/**
 * `useLayoutEffect` warns during SSR, so it is swapped for `useEffect` on the
 * server. On the client it runs before paint, which is the whole point: the region
 * is settled before the visitor can see the fallback currency.
 */
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect

interface RegionContextValue extends RegionState {
  /** False until the browser has resolved the real region. */
  ready: boolean
  setCountry: (code: string) => void
  /** Forgets an explicit choice and re-detects from the visitor's IP. */
  resetToDetected: () => void
}

const RegionContext = React.createContext<RegionContextValue>({
  ...FALLBACK_REGION,
  ready: false,
  setCountry: () => {},
  resetToDetected: () => {},
})

/** The visitor's country, currency and timezone. */
export function useRegion(): RegionContextValue {
  return React.useContext(RegionContext)
}

/**
 * Region provider.
 *
 * Renders the server-safe fallback immediately and swaps to the real region after
 * mount, so hydration is never mismatched and no page has to become dynamic for
 * the sake of a currency symbol. Setting a country updates state in place — no
 * `router.refresh()`, because nothing region-dependent is rendered on the server.
 */
export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<{ region: RegionState; ready: boolean }>({
    region: FALLBACK_REGION,
    ready: false,
  })

  useIsomorphicLayoutEffect(() => {
    // Almost always already cached — set by the proxy on a first visit, or by a
    // previous choice — so this settles synchronously before the first paint and
    // the visitor never sees the fallback currency.
    const cached = readCachedRegion()
    if (cached) {
      setState({ region: cached, ready: true })
      return
    }

    let active = true
    void resolveRegion().then((region) => {
      if (active) setState({ region, ready: true })
    })
    return () => {
      active = false
    }
  }, [])

  const value = React.useMemo<RegionContextValue>(
    () => ({
      ...state.region,
      ready: state.ready,
      setCountry: (code) => setState({ region: chooseCountry(code), ready: true }),
      resetToDetected: () => {
        void forgetCountry().then((region) => setState({ region, ready: true }))
      },
    }),
    [state],
  )

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>
}
