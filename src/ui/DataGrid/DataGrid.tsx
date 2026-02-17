import { useMemo, useState } from 'react'
import { Button } from '../primitives/Button'
import type { ColumnDef } from './types'

type SortState = { columnId: string; direction: 'asc' | 'desc' } | null

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

export function DataGrid<T>({
  rows,
  columns,
  pageSize = 25,
  initialPage = 1,
}: {
  rows: T[]
  columns: ColumnDef<T>[]
  pageSize?: number
  initialPage?: number
}) {
  const safePageSize = Math.max(1, Math.floor(pageSize))
  const totalRows = rows.length
  const totalPages = Math.max(1, Math.ceil(totalRows / safePageSize))
  const normalizedInitialPage = Math.min(
    totalPages,
    Math.max(1, Math.floor(initialPage)),
  )
  const [page, setPage] = useState(normalizedInitialPage)
  const [sortState, setSortState] = useState<SortState>(null)

  const sortedRows = useMemo(() => {
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
  }, [rows, columns, sortState])

  const safePage = Math.min(page, totalPages)
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * safePageSize
    const end = safePage * safePageSize
    return sortedRows.slice(start, end)
  }, [sortedRows, safePage, safePageSize])

  function handleSortToggle(column: ColumnDef<T>) {
    const isSortable = column.sortable ?? Boolean(column.sortValue)
    if (!isSortable) {
      return
    }

    setSortState((current) => {
      if (!current || current.columnId !== column.id) {
        return { columnId: column.id, direction: 'asc' }
      }

      if (current.direction === 'asc') {
        return { columnId: column.id, direction: 'desc' }
      }

      return null
    })
    setPage(1)
  }

  return (
    <div className="space-y-3">
      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className="border-b border-slate-200 px-4 py-2 font-semibold text-slate-700"
                >
                  {(() => {
                    const isSortable = column.sortable ?? Boolean(column.sortValue)
                    const isActive = sortState?.columnId === column.id
                    const indicator = isActive
                      ? sortState?.direction === 'asc'
                        ? '▲'
                        : '▼'
                      : ''

                    if (!isSortable) {
                      return column.header
                    }

                    return (
                      <button
                        type="button"
                        onClick={() => handleSortToggle(column)}
                        className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                      >
                        <span>{column.header}</span>
                        <span
                          className="w-3 text-xs text-slate-500"
                          aria-hidden="true"
                        >
                          {indicator}
                        </span>
                      </button>
                    )
                  })()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-200 hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.id} className="px-4 py-2 text-slate-700">
                    {column.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={safePage <= 1}
          className="px-3 py-1.5 text-xs"
        >
          Previous
        </Button>
        <p className="text-xs text-slate-600">
          Page {safePage} of {totalPages}
        </p>
        <Button
          variant="secondary"
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={safePage >= totalPages}
          className="px-3 py-1.5 text-xs"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
