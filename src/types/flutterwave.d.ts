/**
 * Global typings for Flutterwave's inline checkout script.
 * Loaded on demand from https://checkout.flutterwave.com/v3.js.
 */

export interface FlutterwaveCustomer {
  email: string
  phone_number?: string
  name?: string
}

export interface FlutterwaveCustomizations {
  title?: string
  description?: string
  logo?: string
}

export interface FlutterwaveCallbackData {
  status: string
  tx_ref: string
  transaction_id: number | string
  flw_ref?: string
  amount?: number
  currency?: string
}

export interface FlutterwaveCheckoutConfig {
  public_key: string
  tx_ref: string
  amount: number
  currency: string
  /** Comma-separated: `card,banktransfer,ussd,mobilemoney`. */
  payment_options?: string
  customer: FlutterwaveCustomer
  customizations?: FlutterwaveCustomizations
  meta?: Record<string, unknown>
  callback?: (data: FlutterwaveCallbackData) => void
  onclose?: () => void
}

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: FlutterwaveCheckoutConfig) => void
  }
}

export {}
