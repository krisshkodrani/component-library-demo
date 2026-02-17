import { useState } from 'react'
import { makeMockEvents, type Event } from '../shared'
import { DataGrid, EventForm, Timeline, type ColumnDef } from '../ui'
import { Badge } from '../ui/primitives/Badge'
import { Button } from '../ui/primitives/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/radix/Dialog'

const severityVariantMap: Record<
  NonNullable<Event['severity']>,
  'neutral' | 'success' | 'warning' | 'danger'
> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
}

export function DemoApp() {
  const [events, setEvents] = useState<Event[]>(() => makeMockEvents(200))
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [simulateEmpty, setSimulateEmpty] = useState(false)
  const [simulateLoading, setSimulateLoading] = useState(false)
  const [simulateError, setSimulateError] = useState(false)
  const [isNewEventOpen, setIsNewEventOpen] = useState(false)

  const gridEvents = simulateEmpty ? [] : events
  const timelineEvents = events.slice(0, 60)
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
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Event Management Demo
          </h1>
          <p className="text-sm text-slate-600">
            DataGrid + Timeline + Event Form
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-700">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
              Grid: {gridEvents.length}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
              Timeline: {timelineEvents.length}
            </span>
          </div>
        </div>
        <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
          <DialogTrigger asChild>
            <Button variant="primary">New Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Event</DialogTitle>
              <DialogDescription>
                Create a new event using the form below.
              </DialogDescription>
            </DialogHeader>
            <EventForm
              mode="add"
              autoFocusTitle
              onSave={(draft) => {
                const nextId =
                  globalThis.crypto?.randomUUID?.() ??
                  `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
                const newEvent: Event = {
                  id: nextId,
                  title: draft.title,
                  dateISO: draft.dateISO,
                  description: draft.description,
                  severity: draft.severity,
                }
                setEvents((prev) => [newEvent, ...prev])
                setSelectedEventId(nextId)
                console.log('New event save', newEvent)
                setIsNewEventOpen(false)
              }}
              onCancel={() => {
                setIsNewEventOpen(false)
              }}
            />
          </DialogContent>
        </Dialog>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="flex min-h-0 max-h-[60vh] flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:max-h-[70vh]">
          <header className="mb-4 border-b border-slate-100 pb-3">
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

        <article className="flex min-h-0 max-h-[60vh] flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:max-h-[70vh]">
          <header className="mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
            <p className="text-sm text-slate-600">
              Events: {timelineEvents.length}
            </p>
          </header>
          <div className="min-h-0 flex-1 overflow-auto pr-1">
            <Timeline
              events={timelineEvents}
              selectedId={selectedEventId}
              onSelect={(id) => setSelectedEventId(id)}
            />
          </div>
        </article>
      </section>
    </main>
  )
}
