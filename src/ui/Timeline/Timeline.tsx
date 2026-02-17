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

export function Timeline({
  events,
  selectedId = null,
  onSelect,
}: {
  events: TimelineEvent[]
  selectedId?: string | null
  onSelect?: (id: string) => void
}) {
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
                onClick={onSelect ? () => onSelect(event.id) : undefined}
                className={`rounded-lg border px-3 py-2 ${
                  onSelect ? 'cursor-pointer hover:bg-slate-100' : ''
                } ${
                  event.id === selectedId
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-slate-200 bg-slate-50'
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`.trim()}
                tabIndex={onSelect ? 0 : -1}
                onKeyDown={(eventKey) => {
                  if (!onSelect) {
                    return
                  }

                  if (eventKey.key === 'Enter' || eventKey.key === ' ') {
                    eventKey.preventDefault()
                    onSelect(event.id)
                  }
                }}
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
