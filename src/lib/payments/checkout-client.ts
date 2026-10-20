/**
 * Browser-side Flutterwave helpers. No `server-only` import — this module is
 * loaded in the client bundle.
 */

import type { FlutterwaveCheckoutConfig } from '@/types/flutterwave'

const SCRIPT_SRC = 'https://checkout.flutterwave.com/v3.js'

let loading: Promise<void> | null = null

/** Injects Flutterwave's inline checkout script exactly once. */
export function loadFlutterwaveScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('flutterwave-unavailable'))
  }

  if (window.FlutterwaveCheckout) return Promise.resolve()
  if (loading) return loading

  loading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)

    const onLoad = () => {
      if (window.FlutterwaveCheckout) {
        resolve()
      } else {
        reject(new Error('flutterwave-unavailable'))
      }
    }
    const onError = () => {
      loading = null
      reject(new Error('flutterwave-script-failed'))
    }

    if (existing) {
      existing.addEventListener('load', onLoad, { once: true })
      existing.addEventListener('error', onError, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.addEventListener('load', onLoad, { once: true })
    script.addEventListener('error', onError, { once: true })
    document.head.appendChild(script)
  })

  return loading
}

/** Opens the Flutterwave inline modal. Resolves once it has been invoked. */
export async function openFlutterwaveCheckout(config: FlutterwaveCheckoutConfig) {
  await loadFlutterwaveScript()

  if (!window.FlutterwaveCheckout) throw new Error('flutterwave-unavailable')
  window.FlutterwaveCheckout(config)
}
