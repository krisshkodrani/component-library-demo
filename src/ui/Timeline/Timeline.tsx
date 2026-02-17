import { useRef, useState } from 'react'
import { Badge } from '../primitives/Badge'
import { groupEventsByDay } from './grouping'
import { findActivePosition, getAnnouncement, getNextPosition } from './navigation'
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
  const [activeId, setActiveId] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({})

  function announceForId(id: string) {
    if (activeId === id) {
      return
    }

    const activePos = findActivePosition(groups, id)
    if (!activePos) {
      return
    }

    setActiveId(id)
    setAnnouncement(getAnnouncement(groups, activePos))
  }

  function focusByKey(currentId: string, key: string) {
    const currentPos = findActivePosition(groups, currentId)
    const nextPos = getNextPosition(groups, currentPos, key)
    if (!nextPos) {
      return
    }

    const targetId = groups[nextPos.groupIndex]?.items[nextPos.itemIndex]?.id
    if (!targetId) {
      return
    }

    itemRefs.current[targetId]?.focus()
    announceForId(targetId)
  }

  return (
    <div className="space-y-4">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      {groups.map((group) => (
        <section key={group.dayKey} className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            {group.label}
          </h3>
          <ul className="space-y-2">
            {group.items.map((event) => (
              <li
                key={event.id}
                ref={(element) => {
                  itemRefs.current[event.id] = element
                }}
                onClick={(eventClick) => {
                  announceForId(event.id)
                  eventClick.currentTarget.focus()
                  onSelect?.(event.id)
                }}
                onFocus={() => announceForId(event.id)}
                className={`rounded-lg border px-3 py-2 ${
                  onSelect ? 'cursor-pointer hover:bg-slate-100' : ''
                } ${
                  event.id === selectedId
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-slate-200 bg-slate-50'
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`.trim()}
                tabIndex={onSelect ? 0 : -1}
                onKeyDown={(eventKey) => {
                  if (eventKey.key === 'Enter' || eventKey.key === ' ') {
                    eventKey.preventDefault()
                    onSelect?.(event.id)
                    announceForId(event.id)
                    return
                  }

                  if (eventKey.key === 'ArrowDown' || eventKey.key === 'ArrowRight') {
                    eventKey.preventDefault()
                    focusByKey(event.id, eventKey.key)
                    return
                  }

                  if (eventKey.key === 'ArrowUp' || eventKey.key === 'ArrowLeft') {
                    eventKey.preventDefault()
                    focusByKey(event.id, eventKey.key)
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
