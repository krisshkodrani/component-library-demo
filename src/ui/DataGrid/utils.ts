import type { ColumnDef } from './types'

export type SortState = { columnId: string; direction: 'asc' | 'desc' } | null

type SortableValue = string | number | boolean | null | undefined

function compareValues(a: SortableValue, b: SortableValue): number {
  const aMissing = a === null || a === undefined
  const bMissing = b === null || b === undefined

  if (aMissing && bMissing) return 0
  if (aMissing) return 1
  if (bMissing) return -1

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }

  if (typeof a === 'boolean' && typeof b === 'boolean') {
    if (a === b) return 0
    return a ? 1 : -1
  }

  return String(a).localeCompare(String(b))
}

function getFilterText<T>(column: ColumnDef<T>, row: T): string {
  if (column.filterValue) {
    return column.filterValue(row)
  }

  if (column.sortValue) {
    const value = column.sortValue(row)
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return String(value)
    }
  }

  return ''
}

export function applyGlobalFilter<T>(
  rows: T[],
  columns: ColumnDef<T>[],
  query: string,
): T[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return rows
  }

  return rows.filter((row) =>
    columns.some((column) =>
      getFilterText(column, row).toLowerCase().includes(normalizedQuery),
    ),
  )
}

export function applySort<T>(
  rows: T[],
  sortState: SortState,
  columns: ColumnDef<T>[],
): T[] {
  if (!sortState) {
    return rows
  }

  const activeColumn = columns.find((column) => column.id === sortState.columnId)
  if (!activeColumn?.sortValue) {
    return rows
  }

  const directionFactor = sortState.direction === 'asc' ? 1 : -1

  return rows
    .map((row, idx) => ({ row, idx }))
    .sort((a, b) => {
      const aValue = activeColumn.sortValue?.(a.row)
      const bValue = activeColumn.sortValue?.(b.row)
      const diff = compareValues(aValue, bValue)

      if (diff !== 0) {
        return diff * directionFactor
      }

      return a.idx - b.idx
    })
    .map((entry) => entry.row)
}

export function paginate<T>(rows: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  const end = page * pageSize
  return rows.slice(start, end)
}
