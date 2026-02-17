import clsx from 'clsx'
import { useMemo, useState } from 'react'
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
import { applyColumnFilters, applyGlobalFilter, applySort, paginate, type ColumnFilterState, type SortState } from './utils'

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
    <span className="w-3 text-xs text-slate-500" aria-hidden="true">
      {direction === 'asc' ? '\u25B2' : direction === 'desc' ? '\u25BC' : ''}
    </span>
  )
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
}) {
  const safePageSize = Math.max(1, Math.floor(pageSize))
  const totalRows = rows.length
  const initialTotalPages = Math.max(1, Math.ceil(totalRows / safePageSize))
  const normalizedInitialPage = Math.min(
    initialTotalPages,
    Math.max(1, Math.floor(initialPage)),
  )
  const [page, setPage] = useState(normalizedInitialPage)
  const [sortState, setSortState] = useState<SortState>(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFilterState>({})
  const [hiddenColumnIds, setHiddenColumnIds] = useState<Set<string>>(() =>
    getInitialHiddenColumnIds(columns),
  )

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
    let result = applyGlobalFilter(rows, visibleColumns, globalFilter)
    result = applyColumnFilters(result, visibleColumns, columnFilters)
    return result
  }, [rows, visibleColumns, globalFilter, columnFilters])

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
    setColumnFilters((current) => {
      if (!value.trim()) {
        return Object.fromEntries(
          Object.entries(current).filter(([key]) => key !== columnId),
        )
      }
      return { ...current, [columnId]: value }
    })
    setPage(1)
  }

  const hasColumnFilters = filterableColumns.length > 0

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <Field label="Search" htmlFor="grid-search">
              <Input
                id="grid-search"
                placeholder="Search rows..."
                value={globalFilter}
                onChange={(event) => {
                  setGlobalFilter(event.target.value)
                  setPage(1)
                }}
              />
            </Field>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="self-start sm:self-auto">
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
                <Field label={column.header} htmlFor={`col-filter-${column.id}`}>
                  <Input
                    id={`col-filter-${column.id}`}
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

        <p className="text-xs font-medium text-slate-600">
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
            <table className="min-w-[640px] w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                <tr>
                  {visibleColumns.map((column) => (
                    <th
                      key={column.id}
                      scope="col"
                      className="border-b border-slate-200 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      <SortableHeader
                        column={column}
                        sortState={sortState}
                        onToggle={handleSortToggle}
                      />
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
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={clsx(
                        'border-b border-slate-100',
                        onRowClick && 'cursor-pointer hover:bg-slate-50/80',
                        rowId && selectedRowId === rowId && 'bg-blue-50/70',
                      )}
                    >
                      {visibleColumns.map((column) => (
                        <td key={column.id} className="px-3 py-2.5 text-slate-700">
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
