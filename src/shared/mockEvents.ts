import type { Event } from './types'

type MakeMockEventsOpts = {
  startDate?: Date
  daysSpan?: number
}

const TITLES = [
  'Door Forced Open',
  'Badge Access Denied',
  'Camera Offline',
  'Tamper Alert',
  'Motion Detected',
  'System Health Check',
]

const DESCRIPTIONS = [
  'Investigate at nearest control station.',
  'Operator acknowledgement recommended.',
  'Auto-escalated by monitoring profile.',
]

function seededRandom(seed: number) {
  let state = seed >>> 0

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

export function makeMockEvents(
  count: number,
  opts?: MakeMockEventsOpts,
): Event[] {
  const safeCount = Math.max(0, Math.floor(count))
  const daysSpan = Math.max(1, Math.floor(opts?.daysSpan ?? 30))
  const startDate = opts?.startDate ?? new Date('2026-01-01T00:00:00.000Z')
  const startMs = startDate.getTime()
  const rand = seededRandom(safeCount * 31 + daysSpan * 17)

  return Array.from({ length: safeCount }, (_, index) => {
    const dayOffset = index % daysSpan
    const hour = Math.floor(rand() * 24)
    const minute = Math.floor(rand() * 60)
    const second = Math.floor(rand() * 60)
    const date = new Date(
      startMs + dayOffset * 24 * 60 * 60 * 1000 + hour * 3600000 + minute * 60000 + second * 1000,
    )

    const severityCycle: Array<Event['severity']> = ['low', 'medium', 'high']
    const severity = severityCycle[index % severityCycle.length]

    return {
      id: `evt-${index + 1}`,
      title: TITLES[index % TITLES.length],
      dateISO: date.toISOString(),
      description: DESCRIPTIONS[index % DESCRIPTIONS.length],
      severity,
    }
  })
}
