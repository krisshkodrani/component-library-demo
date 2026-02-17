import type { ReactNode } from 'react'

export type ColumnDef<T> = {
  id: string
  header: string
  accessor: (row: T) => ReactNode
}
