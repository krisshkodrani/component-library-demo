import { formatDayLabel, toDayKey } from '../../shared/date'
import type { TimelineEvent } from './types'

export function groupEventsByDay(events: TimelineEvent[]): Array<{
  dayKey: string
  label: string
  items: TimelineEvent[]
}> {
  const grouped = new Map<string, TimelineEvent[]>()

  for (const event of events) {
    const dayKey = toDayKey(event.dateISO)
    const current = grouped.get(dayKey) ?? []
    current.push(event)
    grouped.set(dayKey, current)
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, items]) => ({
      dayKey,
      label: formatDayLabel(dayKey),
      items: [...items].sort(
        (a, b) =>
          new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime(),
      ),
    }))
}
