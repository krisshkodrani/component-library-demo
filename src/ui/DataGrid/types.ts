import type { ReactNode } from 'react'

export type ColumnDef<T> = {
  id: string
  header: string
  accessor: (row: T) => ReactNode
  sortValue?: (row: T) => string | number | boolean | null
  sortable?: boolean
}
