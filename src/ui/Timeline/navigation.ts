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

/**
 * Arrow key semantics:
 *   Up / Down   - move within the current group (clamped at boundaries)
 *   Left / Right - jump to the previous / next group (same item index, clamped)
 */
export function getNextPosition(
  groups: TimelineGroup[],
  currentPos: TimelinePosition | null,
  key: string,
): TimelinePosition | null {
  if (!currentPos) {
    return null
  }

  const { groupIndex, itemIndex } = currentPos
  const currentGroup = groups[groupIndex]
  if (!currentGroup) {
    return null
  }

  if (key === 'ArrowDown') {
    const nextItem = itemIndex + 1
    if (nextItem >= currentGroup.items.length) {
      return null
    }
    return { groupIndex, itemIndex: nextItem }
  }

  if (key === 'ArrowUp') {
    const prevItem = itemIndex - 1
    if (prevItem < 0) {
      return null
    }
    return { groupIndex, itemIndex: prevItem }
  }

  if (key === 'ArrowRight') {
    const nextGroup = groupIndex + 1
    if (nextGroup >= groups.length) {
      return null
    }
    const clampedItem = Math.min(itemIndex, groups[nextGroup].items.length - 1)
    return { groupIndex: nextGroup, itemIndex: clampedItem }
  }

  if (key === 'ArrowLeft') {
    const prevGroup = groupIndex - 1
    if (prevGroup < 0) {
      return null
    }
    const clampedItem = Math.min(itemIndex, groups[prevGroup].items.length - 1)
    return { groupIndex: prevGroup, itemIndex: clampedItem }
  }

  return null
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

