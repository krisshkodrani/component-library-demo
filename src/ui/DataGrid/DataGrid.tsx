import { useMemo, useState } from 'react'
import { Button } from '../primitives/Button'
import type { ColumnDef } from './types'

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

  const safePage = Math.min(page, totalPages)
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * safePageSize
    const end = safePage * safePageSize
    return rows.slice(start, end)
  }, [rows, safePage, safePageSize])

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
                  {column.header}
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
