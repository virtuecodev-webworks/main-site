/**
 * Maps a design action's error code to a message key.
 *
 * Kept out of the action files because `'use server'` modules may only export
 * async functions, and out of the components because both the theme form and
 * the font library need the same mapping.
 */
export function designErrorKey(message: string | undefined): string {
  switch (message) {
    case 'unauthorised':
      return 'unauthorised'
    case 'not-configured':
      return 'notConfigured'
    case 'validation':
      return 'validation'
    case 'unknown-font':
      return 'unknownFont'
    case 'invalid-family':
      return 'invalidFamily'
    case 'invalid-file':
      return 'invalidFile'
    default:
      return 'saveFailed'
  }
}
