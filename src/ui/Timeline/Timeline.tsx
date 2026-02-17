import { Badge } from '../primitives/Badge'
import { groupEventsByDay } from './grouping'
import type { TimelineEvent } from './types'

const severityVariantMap: Record<
  NonNullable<TimelineEvent['severity']>,
  'neutral' | 'success' | 'warning' | 'danger'
> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const groups = groupEventsByDay(events)

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section key={group.dayKey} className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            {group.label}
          </h3>
          <ul className="space-y-2">
            {group.items.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">{event.title}</p>
                  <time className="text-xs text-slate-600">
                    {new Date(event.dateISO).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
                {event.severity ? (
                  <div className="mt-2">
                    <Badge variant={severityVariantMap[event.severity]}>
                      {event.severity}
                    </Badge>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
