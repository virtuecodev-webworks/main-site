/**
 * Studio availability.
 *
 * The schedule is authored in the studio's own wall clock (a fixed UTC+1 with no
 * daylight saving), which is the one thing about the business that genuinely
 * cannot be derived from the visitor. Everything here is a pure function of an
 * instant, which matters: "are we open right now?" is timezone-independent, so
 * the server and the browser always agree and there is nothing to hydrate.
 *
 * What *is* timezone-dependent is how we phrase the answer — "opens Monday 09:00
 * your time" — and that is the caller's job, because only the browser knows the
 * reader's zone.
 */

/**
 * The studio's home zone, expressed as a fixed offset (`Etc/GMT-1` is IANA's
 * inverted-sign name for UTC+1). A place name would attach the schedule to a
 * location, and the location is deliberately not published.
 */
export const STUDIO_TIMEZONE = 'Etc/GMT-1'

/**
 * The studio has never observed daylight saving, so the offset is a constant.
 * If the schedule ever moves, this is the one line to change.
 */
const STUDIO_UTC_OFFSET_MINUTES = 60

/** Minutes past midnight, studio time. `null` means closed all day. 0 = Sunday. */
const SCHEDULE: Record<number, { open: number; close: number } | null> = {
  0: null,
  1: { open: 9 * 60, close: 18 * 60 },
  2: { open: 9 * 60, close: 18 * 60 },
  3: { open: 9 * 60, close: 18 * 60 },
  4: { open: 9 * 60, close: 18 * 60 },
  5: { open: 9 * 60, close: 18 * 60 },
  6: { open: 10 * 60, close: 14 * 60 },
}

const MINUTES_PER_DAY = 24 * 60

export interface StudioMoment {
  /** 0 = Sunday. */
  day: number
  /** Minutes past midnight, studio time. */
  minutes: number
}

/** The studio-local wall clock for an instant. */
export function studioMoment(at: Date = new Date()): StudioMoment {
  const total = at.getUTCDay() * MINUTES_PER_DAY + at.getUTCHours() * 60 + at.getUTCMinutes()
  const shifted = total + STUDIO_UTC_OFFSET_MINUTES
  return {
    day: Math.floor(shifted / MINUTES_PER_DAY) % 7,
    minutes: ((shifted % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY,
  }
}

export interface Availability {
  open: boolean
  /** Whole minutes until the studio next opens. 0 while open. */
  opensInMinutes: number
  /** Whole minutes until the studio closes. `null` while closed. */
  closesInMinutes: number | null
  /** The studio wall clock right now, for display. */
  studio: StudioMoment
}

/**
 * Walks forward day by day from `at` until it finds the next opening slot, so it
 * is correct across the weekend and across a whole closed week without any
 * special-casing.
 */
export function getAvailability(at: Date = new Date()): Availability {
  const studio = studioMoment(at)
  const today = SCHEDULE[studio.day]

  if (today && studio.minutes >= today.open && studio.minutes < today.close) {
    return {
      open: true,
      opensInMinutes: 0,
      closesInMinutes: today.close - studio.minutes,
      studio,
    }
  }

  // Still to open later today?
  if (today && studio.minutes < today.open) {
    return {
      open: false,
      opensInMinutes: today.open - studio.minutes,
      closesInMinutes: null,
      studio,
    }
  }

  // Otherwise scan the days ahead. Seven is enough to cover any schedule with at
  // least one open day; eight guards against a fully closed week on the same day.
  for (let offset = 1; offset <= 8; offset += 1) {
    const day = (studio.day + offset) % 7
    const slot = SCHEDULE[day]
    if (!slot) continue
    const minutes = offset * MINUTES_PER_DAY - (studio.minutes - slot.open)
    return { open: false, opensInMinutes: minutes, closesInMinutes: null, studio }
  }

  // No open day in the schedule at all — treat as permanently closed.
  return { open: false, opensInMinutes: Number.POSITIVE_INFINITY, closesInMinutes: null, studio }
}

/** The instant the studio next opens, or now if it is already open. */
export function nextOpening(at: Date = new Date()): Date {
  const availability = getAvailability(at)
  if (availability.open || !Number.isFinite(availability.opensInMinutes)) return at
  return new Date(at.getTime() + availability.opensInMinutes * 60_000)
}
