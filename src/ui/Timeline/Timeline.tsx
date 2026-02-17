import clsx from 'clsx'
import { useMemo, useRef, useState } from 'react'
import { severityToVariant } from '../../shared'
import { Badge } from '../primitives/Badge'
import { groupEventsByDay } from './grouping'
import { findActivePosition, getAnnouncement, getNextPosition } from './navigation'
import type { TimelineEvent } from './types'

export function Timeline({
  events,
  selectedId = null,
  onSelect,
}: {
  events: TimelineEvent[]
  selectedId?: string | null
  onSelect?: (id: string) => void
}) {
  const groups = useMemo(() => groupEventsByDay(events), [events])
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
        <section
          key={group.dayKey}
          className="space-y-2 border-t border-slate-200 pt-3 first:border-t-0 first:pt-0"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                className={clsx(
                  'rounded-lg border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
                  onSelect && 'cursor-pointer hover:bg-slate-100',
                  event.id === selectedId
                    ? 'border-blue-200 bg-blue-50/70'
                    : 'border-slate-200 bg-slate-50',
                )}
                tabIndex={onSelect ? 0 : -1}
                onKeyDown={(eventKey) => {
                  if (eventKey.key === 'Enter' || eventKey.key === ' ') {
                    eventKey.preventDefault()
                    onSelect?.(event.id)
                    announceForId(event.id)
                    return
                  }

                  if (
                    eventKey.key === 'ArrowDown' ||
                    eventKey.key === 'ArrowRight' ||
                    eventKey.key === 'ArrowUp' ||
                    eventKey.key === 'ArrowLeft'
                  ) {
                    eventKey.preventDefault()
                    focusByKey(event.id, eventKey.key)
                  }
                }}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
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
                    <Badge variant={severityToVariant[event.severity]}>
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
