import type { TimelineEvent } from './types'

export type TimelineGroup = {
  dayKey: string
  label: string
  items: TimelineEvent[]
}

export type TimelinePosition = {
  groupIndex: number
  itemIndex: number
}

function flattenPositions(groups: TimelineGroup[]): TimelinePosition[] {
  return groups.flatMap((group, groupIndex) =>
    group.items.map((_, itemIndex) => ({ groupIndex, itemIndex })),
  )
}

export function findActivePosition(
  groups: TimelineGroup[],
  activeId: string | null,
): TimelinePosition | null {
  if (!activeId) {
    return null
  }

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    const itemIndex = groups[groupIndex]?.items.findIndex(
      (item) => item.id === activeId,
    )
    if (itemIndex !== undefined && itemIndex >= 0) {
      return { groupIndex, itemIndex }
    }
  }

  return null
}

export function getNextPosition(
  groups: TimelineGroup[],
  currentPos: TimelinePosition | null,
  key: string,
): TimelinePosition | null {
  if (!currentPos) {
    return null
  }

  const offset =
    key === 'ArrowDown' || key === 'ArrowRight'
      ? 1
      : key === 'ArrowUp' || key === 'ArrowLeft'
        ? -1
        : 0

  if (offset === 0) {
    return null
  }

  const positions = flattenPositions(groups)
  const currentIndex = positions.findIndex(
    (pos) =>
      pos.groupIndex === currentPos.groupIndex && pos.itemIndex === currentPos.itemIndex,
  )
  if (currentIndex === -1) {
    return null
  }

  const targetIndex = Math.min(
    positions.length - 1,
    Math.max(0, currentIndex + offset),
  )

  return positions[targetIndex] ?? null
}

export function getAnnouncement(
  groups: TimelineGroup[],
  pos: TimelinePosition | null,
): string {
  if (!pos) {
    return ''
  }

  const group = groups[pos.groupIndex]
  const item = group?.items[pos.itemIndex]
  if (!group || !item) {
    return ''
  }

  const timeLabel = new Date(item.dateISO).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${group.label} - ${item.title}, ${pos.itemIndex + 1} of ${group.items.length}, ${timeLabel}`
}
