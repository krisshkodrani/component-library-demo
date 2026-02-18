import clsx from 'clsx'
import type { ReactNode } from 'react'
import { useId, useMemo, useState } from 'react'
import { Button } from '../primitives/Button'
import { Field } from '../primitives/Field'
import { Input } from '../primitives/Input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../radix/DropdownMenu'
import type { ColumnDef } from './types'
import { applyColumnFilters, applySort, paginate, type ColumnFilterState, type SortState } from './utils'

function getInitialHiddenColumnIds<T>(columns: ColumnDef<T>[]): Set<string> {
  const hidden = new Set<string>()

  for (const column of columns) {
    if (column.initialHidden) {
      hidden.add(column.id)
    }
  }

  if (hidden.size >= columns.length && columns.length > 0) {
    hidden.delete(columns[0].id)
  }

  return hidden
}

function SortIndicator({ direction }: { direction: 'asc' | 'desc' | null }) {
  return (
    <span
      className={clsx(
        'w-3 text-xs',
        direction ? 'text-slate-600' : 'text-slate-300',
      )}
      aria-hidden="true"
    >
      {direction === 'asc' ? '\u25B2' : direction === 'desc' ? '\u25BC' : '\u2195'}
    </span>
  )
}

function getAriaSortValue<T>(
  column: ColumnDef<T>,
  sortState: SortState,
): 'ascending' | 'descending' | 'none' | undefined {
  const isSortable = column.sortable ?? Boolean(column.sortValue)
  if (!isSortable) return undefined
  if (sortState?.columnId !== column.id) return 'none'
  return sortState.direction === 'asc' ? 'ascending' : 'descending'
}

function SortableHeader<T>({
  column,
  sortState,
  onToggle,
}: {
  column: ColumnDef<T>
  sortState: SortState
  onToggle: (column: ColumnDef<T>) => void
}) {
  const isSortable = column.sortable ?? Boolean(column.sortValue)
  if (!isSortable) {
    return <>{column.header}</>
  }

  const isActive = sortState?.columnId === column.id
  const direction = isActive ? sortState.direction : null

  return (
    <button
      type="button"
      onClick={() => onToggle(column)}
      className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <span>{column.header}</span>
      <SortIndicator direction={direction} />
    </button>
  )
}

export function DataGrid<T>({
  rows,
  columns,
  pageSize = 25,
  initialPage = 1,
  isLoading = false,
  error = null,
  emptyMessage = 'No results.',
  getRowId,
  selectedRowId = null,
  onRowClick,
  columnFilters: columnFiltersProp,
  onColumnFilterChange,
  totalRowsCount,
  toolbarStart,
}: {
  rows: T[]
  columns: ColumnDef<T>[]
  pageSize?: number
  initialPage?: number
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
  getRowId?: (row: T) => string
  selectedRowId?: string | null
  onRowClick?: (row: T) => void
  columnFilters?: ColumnFilterState
  onColumnFilterChange?: (columnId: string, value: string) => void
  totalRowsCount?: number
  toolbarStart?: ReactNode
}) {
  const instanceId = useId()
  const safePageSize = Math.max(1, Math.floor(pageSize))
  const totalRows = totalRowsCount ?? rows.length
  const initialTotalPages = Math.max(1, Math.ceil(totalRows / safePageSize))
  const normalizedInitialPage = Math.min(
    initialTotalPages,
    Math.max(1, Math.floor(initialPage)),
  )
  const [page, setPage] = useState(normalizedInitialPage)
  const [sortState, setSortState] = useState<SortState>(null)
  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFilterState>({})
  const columnFilters = columnFiltersProp ?? internalColumnFilters
  const [hiddenColumnIds, setHiddenColumnIds] = useState<Set<string>>(() =>
    getInitialHiddenColumnIds(columns),
  )
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})

  const visibleColumns = useMemo(
    () => columns.filter((column) => !hiddenColumnIds.has(column.id)),
    [columns, hiddenColumnIds],
  )

  const filterableColumns = useMemo(
    () => visibleColumns.filter((column) => column.filterable ?? Boolean(column.filterValue ?? column.sortValue)),
    [visibleColumns],
  )

  const hideableColumns = useMemo(
    () => columns.filter((column) => column.hideable ?? true),
    [columns],
  )

  const filteredRows = useMemo(() => {
    return applyColumnFilters(rows, visibleColumns, columnFilters)
  }, [rows, visibleColumns, columnFilters])

  const sortedRows = useMemo(
    () => applySort(filteredRows, sortState, visibleColumns),
    [filteredRows, sortState, visibleColumns],
  )

  const totalFilteredRows = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalFilteredRows / safePageSize))
  const safePage = Math.min(page, totalPages)

  const pageRows = useMemo(
    () => paginate(sortedRows, safePage, safePageSize),
    [sortedRows, safePage, safePageSize],
  )

  function handleSortToggle(column: ColumnDef<T>) {
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

  function handleColumnVisibilityChange(columnId: string, checked: boolean) {
    setHiddenColumnIds((current) => {
      const next = new Set(current)
      const currentlyVisibleCount = columns.filter(
        (column) => !current.has(column.id),
      ).length

      if (checked) {
        next.delete(columnId)
        return next
      }

      if (currentlyVisibleCount <= 1) {
        return current
      }

      next.add(columnId)
      return next
    })
    setPage(1)
  }

  function handleColumnFilterChange(columnId: string, value: string) {
    if (onColumnFilterChange) {
      onColumnFilterChange(columnId, value)
      setPage(1)
      return
    }

    setInternalColumnFilters((current) => {
      if (!value.trim()) {
        return Object.fromEntries(
          Object.entries(current).filter(([key]) => key !== columnId),
        )
      }
      return { ...current, [columnId]: value }
    })
    setPage(1)
  }

  function adjustColumnWidth(columnId: string, delta: number) {
    setColumnWidths((current) => {
      const base = current[columnId] ?? 180
      const nextWidth = Math.max(120, Math.min(640, base + delta))
      return { ...current, [columnId]: nextWidth }
    })
  }

  function handleResizeStart(
    event: React.PointerEvent<HTMLSpanElement>,
    columnId: string,
  ) {
    event.preventDefault()
    event.stopPropagation()

    const header = event.currentTarget.closest('th')
    const startWidth = header instanceof HTMLElement ? header.offsetWidth : 180
    const startX = event.clientX

    function onMove(moveEvent: PointerEvent) {
      const delta = moveEvent.clientX - startX
      const nextWidth = Math.max(120, Math.min(640, startWidth + delta))
      setColumnWidths((current) => ({ ...current, [columnId]: nextWidth }))
    }

    function onUp() {
      globalThis.removeEventListener('pointermove', onMove)
      globalThis.removeEventListener('pointerup', onUp)
    }

    globalThis.addEventListener('pointermove', onMove)
    globalThis.addEventListener('pointerup', onUp)
  }

  const hasColumnFilters = filterableColumns.length > 0

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>{toolbarStart}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="self-start px-3 py-1.5 text-xs sm:self-auto"
              >
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {hideableColumns.map((column) => {
                const isVisible = !hiddenColumnIds.has(column.id)
                const disableHide = isVisible && visibleColumns.length <= 1

                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={isVisible}
                    disabled={disableHide}
                    onCheckedChange={(checked) =>
                      handleColumnVisibilityChange(column.id, checked === true)
                    }
                  >
                    {column.header}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasColumnFilters && (
          <div className="flex flex-wrap gap-2">
            {filterableColumns.map((column) => (
              <div key={column.id} className="w-full sm:w-auto sm:min-w-36">
                <Field label={column.header} htmlFor={`${instanceId}-col-${column.id}`}>
                  <Input
                    id={`${instanceId}-col-${column.id}`}
                    placeholder={`Filter ${column.header.toLowerCase()}...`}
                    value={columnFilters[column.id] ?? ''}
                    onChange={(e) => handleColumnFilterChange(column.id, e.target.value)}
                    className="py-1.5 text-xs"
                  />
                </Field>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs font-medium text-slate-600" aria-live="polite" aria-atomic="true">
          Showing {totalFilteredRows} of {totalRows}
        </p>
      </div>

      <div className="min-h-0 flex-1">
        {error ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        ) : isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
            Loading...
          </div>
        ) : sortedRows.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
            {emptyMessage}
          </div>
        ) : (
          <div className="h-full overflow-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <colgroup>
                {visibleColumns.map((column) => (
                  <col
                    key={column.id}
                    style={
                      columnWidths[column.id]
                        ? { width: `${columnWidths[column.id]}px` }
                        : undefined
                    }
                  />
                ))}
              </colgroup>
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                <tr>
                  {visibleColumns.map((column) => (
                    <th
                      key={column.id}
                      scope="col"
                      aria-sort={getAriaSortValue(column, sortState)}
                      className={clsx(
                        'relative border-b border-r border-slate-200 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-600 last:border-r-0',
                        (column.sortable ?? Boolean(column.sortValue)) &&
                          'cursor-pointer hover:bg-slate-100/70',
                      )}
                    >
                      <div className="truncate">
                        <SortableHeader
                          column={column}
                          sortState={sortState}
                          onToggle={handleSortToggle}
                        />
                      </div>
                      <span
                        role="separator"
                        aria-orientation="vertical"
                        aria-label={`Resize ${column.header} column`}
                        aria-valuemin={120}
                        aria-valuemax={640}
                        aria-valuenow={columnWidths[column.id] ?? 180}
                        tabIndex={0}
                        onPointerDown={(event) => handleResizeStart(event, column.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'ArrowLeft') {
                            event.preventDefault()
                            adjustColumnWidth(column.id, -16)
                          } else if (event.key === 'ArrowRight') {
                            event.preventDefault()
                            adjustColumnWidth(column.id, 16)
                          }
                        }}
                        className="absolute right-0 top-0 z-10 h-full w-3 cursor-col-resize touch-none select-none hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
                      >
                        <span className="absolute inset-y-1 left-1.5 w-px bg-slate-300" />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, rowIndex) => {
                  const rowId = getRowId?.(row)
                  return (
                    <tr
                      key={rowId ?? rowIndex}
                      tabIndex={onRowClick ? 0 : undefined}
                      aria-selected={
                        onRowClick && rowId ? selectedRowId === rowId : undefined
                      }
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      onKeyDown={onRowClick ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onRowClick(row)
                        }
                      } : undefined}
                      className={clsx(
                        'border-b border-slate-100',
                        onRowClick && 'cursor-pointer hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600',
                        rowId && selectedRowId === rowId && 'bg-blue-50/70',
                      )}
                    >
                      {visibleColumns.map((column) => (
                        <td
                          key={column.id}
                          className="truncate px-3 py-2.5 text-slate-700"
                        >
                          {column.accessor(row)}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!error && !isLoading && sortedRows.length > 0 ? (
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
      ) : null}
    </div>
  )
}
