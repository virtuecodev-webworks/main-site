/**
 * Shared shape for Server Action results.
 *
 * Kept in a plain module (not `'use server'`) because Next.js only allows async
 * function exports from action files.
 */
export type ActionState =
  | { status: 'idle' }
  | { status: 'success'; message?: string; projectId?: string; reference?: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> }

export const IDLE_STATE: ActionState = { status: 'idle' }

export interface AuthState {
  status: 'idle' | 'error'
  message?: 'invalid' | 'not-authorised' | 'not-configured'
}

export const AUTH_IDLE: AuthState = { status: 'idle' }

/**
 * Sign-up can end three ways, and the middle one is the normal case whenever
 * email confirmation is switched on: the account exists, but nobody is signed in
 * yet and there is an email to go and open.
 */
export type SignUpState =
  | { status: 'idle' }
  | { status: 'confirm-email'; email: string }
  | { status: 'error'; message: SignUpError; fieldErrors?: Record<string, string[]> }

export type SignUpError =
  | 'invalid-email'
  | 'weak-password'
  | 'password-mismatch'
  | 'missing-name'
  | 'email-taken'
  | 'rate-limited'
  | 'not-configured'
  | 'unknown'

export const SIGN_UP_IDLE: SignUpState = { status: 'idle' }
