import type { ColumnDef } from './types'

export function DataGrid<T>({
  rows,
  columns,
}: {
  rows: T[]
  columns: ColumnDef<T>[]
}) {
  return (
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
          {rows.map((row, rowIndex) => (
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
  )
}
