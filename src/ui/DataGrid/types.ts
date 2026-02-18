import type { ReactNode } from 'react'
import type { ColumnFilterState } from './utils'

export type ColumnDef<T> = {
  id: string
  header: string
  accessor: (row: T) => ReactNode
  sortValue?: (row: T) => string | number | boolean | null
  filterValue?: (row: T) => string
  sortable?: boolean
  filterable?: boolean
  hideable?: boolean
  initialHidden?: boolean
}

export type DataGridProps<T> = {
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
}
