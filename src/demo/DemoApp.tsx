import { useState } from 'react'
import { makeMockEvents, type Event } from '../shared'
import { DataGrid, Timeline, type ColumnDef } from '../ui'
import { Badge } from '../ui/primitives/Badge'
import { Button } from '../ui/primitives/Button'

const severityVariantMap: Record<
  NonNullable<Event['severity']>,
  'neutral' | 'success' | 'warning' | 'danger'
> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
}

export function DemoApp() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [simulateEmpty, setSimulateEmpty] = useState(false)
  const [simulateLoading, setSimulateLoading] = useState(false)
  const [simulateError, setSimulateError] = useState(false)

  const gridEvents = simulateEmpty ? [] : makeMockEvents(200)
  const timelineEvents = makeMockEvents(60)
  const gridColumns: ColumnDef<Event>[] = [
    {
      id: 'title',
      header: 'Title',
      accessor: (row) => row.title,
      sortValue: (row) => row.title,
    },
    {
      id: 'date',
      header: 'Date',
      accessor: (row) => new Date(row.dateISO).toLocaleString(),
      sortValue: (row) => new Date(row.dateISO).getTime(),
    },
    {
      id: 'severity',
      header: 'Severity',
      accessor: (row) =>
        row.severity ? (
          <Badge variant={severityVariantMap[row.severity]}>{row.severity}</Badge>
        ) : (
          '-'
        ),
    },
  ]

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Genetec Take-Home Demo
        </h1>
        <Button variant="primary">New Event</Button>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="flex min-h-0 max-h-[60vh] flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:max-h-[70vh]">
          <header className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">DataGrid</h2>
            <p className="text-sm text-slate-600">Events: {gridEvents.length}</p>
          </header>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              variant={simulateEmpty ? 'primary' : 'secondary'}
              onClick={() => setSimulateEmpty((current) => !current)}
            >
              Simulate empty
            </Button>
            <Button
              variant={simulateLoading ? 'primary' : 'secondary'}
              onClick={() => setSimulateLoading((current) => !current)}
            >
              Simulate loading
            </Button>
            <Button
              variant={simulateError ? 'primary' : 'secondary'}
              onClick={() => setSimulateError((current) => !current)}
            >
              Simulate error
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto pr-1">
            <DataGrid
              rows={gridEvents}
              columns={gridColumns}
              isLoading={simulateLoading}
              error={simulateError ? 'Unable to load events. Please retry.' : null}
              emptyMessage="No matching events."
              getRowId={(event) => event.id}
              selectedRowId={selectedEventId}
              onRowClick={(event) => setSelectedEventId(event.id)}
            />
          </div>
        </article>

        <article className="flex min-h-0 max-h-[60vh] flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:max-h-[70vh]">
          <header className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
            <p className="text-sm text-slate-600">
              Events: {timelineEvents.length}
            </p>
          </header>
          <div className="min-h-0 flex-1 overflow-auto pr-1">
            <Timeline events={timelineEvents} />
          </div>
        </article>
      </section>
    </main>
  )
}
