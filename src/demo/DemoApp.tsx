import { useEffect, useId, useMemo, useState } from 'react'
import { severityToVariant, type Event } from '../shared'
import { useEventViewStore } from '../state/useEventViewStore'
import { DataGrid, EventForm, Timeline, type ColumnDef, type EventDraft } from '../ui'
import { applyColumnFilters } from '../ui/DataGrid/utils'
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

const TOAST_DURATION_MS = 3000

function EmptyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M2 4.5A1.5 1.5 0 0 1 3.5 3h13A1.5 1.5 0 0 1 18 4.5v2A1.5 1.5 0 0 1 16.5 8H3.5A1.5 1.5 0 0 1 2 6.5v-2Zm0 6A1.5 1.5 0 0 1 3.5 9h13A1.5 1.5 0 0 1 18 10.5v5A1.5 1.5 0 0 1 16.5 17h-13A1.5 1.5 0 0 1 2 15.5v-5Z"
      />
    </svg>
  )
}

function LoadingIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M10 2a8 8 0 1 0 8 8h-2a6 6 0 1 1-6-6V2Zm7.07 2.93-1.41 1.41A5.97 5.97 0 0 1 16 10h2a7.96 7.96 0 0 0-.93-3.66Z"
      />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M10 2a1 1 0 0 1 .86.49l6.5 11.25A1 1 0 0 1 16.5 15H3.5a1 1 0 0 1-.86-1.26l6.5-11.25A1 1 0 0 1 10 2Zm0 4a1 1 0 0 0-1 1v3.5a1 1 0 0 0 2 0V7a1 1 0 0 0-1-1Zm0 8a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 10 14Z"
      />
    </svg>
  )
}

export function DemoApp() {
  const timelineInstructionsId = useId()
  const events = useEventViewStore((state) => state.events)
  const selectedEventId = useEventViewStore((state) => state.selectedEventId)
  const columnFilters = useEventViewStore((state) => state.columnFilters)
  const setSelectedEventId = useEventViewStore((state) => state.setSelectedEventId)
  const setColumnFilter = useEventViewStore((state) => state.setColumnFilter)
  const addEvent = useEventViewStore((state) => state.addEvent)
  const updateEvent = useEventViewStore((state) => state.updateEvent)
  const [simulateEmpty, setSimulateEmpty] = useState(false)
  const [simulateLoading, setSimulateLoading] = useState(false)
  const [simulateError, setSimulateError] = useState(false)
  const [timelineSortDirection, setTimelineSortDirection] = useState<'asc' | 'desc'>('desc')
  const [isNewEventOpen, setIsNewEventOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!statusMessage) return
    const timer = setTimeout(() => setStatusMessage(null), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [statusMessage])

  const visibleEvents = useMemo(
    () => (simulateEmpty ? [] : events),
    [simulateEmpty, events],
  )

  const gridColumns: ColumnDef<Event>[] = useMemo(
    () => [
      {
        id: 'title',
        header: 'Title',
        accessor: (row) => row.title,
        sortValue: (row) => row.title,
        filterable: true,
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
            <Badge variant={severityToVariant[row.severity]}>{row.severity}</Badge>
          ) : (
            '-'
          ),
        filterValue: (row) => row.severity ?? '',
        filterable: true,
      },
    ],
    [],
  )

  const filterColumns = useMemo(
    () =>
      gridColumns.filter(
        (column) =>
          column.filterable ?? Boolean(column.filterValue ?? column.sortValue),
      ),
    [gridColumns],
  )

  const filteredEvents = useMemo(() => {
    return applyColumnFilters(visibleEvents, filterColumns, columnFilters)
  }, [visibleEvents, filterColumns, columnFilters])

  const gridEvents = filteredEvents
  const timelineEvents = filteredEvents

  const selectedEvent = selectedEventId
    ? events.find((e) => e.id === selectedEventId) ?? null
    : null

  function handleNewEventSave(draft: EventDraft) {
    const nextId = addEvent(draft)
    setSelectedEventId(nextId)
    setIsNewEventOpen(false)
    setStatusMessage('Event created.')
  }

  function handleEditSave(draft: EventDraft) {
    if (!editingEvent) return
    updateEvent(editingEvent.id, draft)
    setEditingEvent(null)
    setStatusMessage('Event saved.')
  }

  function setSimulationMode(mode: 'empty' | 'loading' | 'error' | null) {
    setSimulateEmpty(mode === 'empty')
    setSimulateLoading(mode === 'loading')
    setSimulateError(mode === 'error')
  }

  const simulationControls = (
    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 sm:pb-0">
      <Button
        variant={simulateEmpty ? 'warning' : 'secondary'}
        aria-pressed={simulateEmpty}
        onClick={() => setSimulationMode(simulateEmpty ? null : 'empty')}
        className="shrink-0 gap-1.5 px-3 py-1.5 text-xs"
      >
        <EmptyIcon />
        Simulate empty views
      </Button>
      <Button
        variant={simulateLoading ? 'info' : 'secondary'}
        aria-pressed={simulateLoading}
        onClick={() => setSimulationMode(simulateLoading ? null : 'loading')}
        className="shrink-0 gap-1.5 px-3 py-1.5 text-xs"
      >
        <LoadingIcon />
        Simulate loading
      </Button>
      <Button
        variant={simulateError ? 'danger' : 'secondary'}
        aria-pressed={simulateError}
        onClick={() => setSimulationMode(simulateError ? null : 'error')}
        className="shrink-0 gap-1.5 px-3 py-1.5 text-xs"
      >
        <ErrorIcon />
        Simulate error
      </Button>
    </div>
  )

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
      >
        {statusMessage && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 shadow-md">
            {statusMessage}
          </div>
        )}
      </div>

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

        <div className="flex items-center gap-2">
          {selectedEvent && (
            <Button variant="secondary" onClick={() => setEditingEvent(selectedEvent)}>
              Edit Event
            </Button>
          )}
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
                onSave={handleNewEventSave}
                onCancel={() => setIsNewEventOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <Dialog open={editingEvent !== null} onOpenChange={(open) => { if (!open) setEditingEvent(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the event details below.
            </DialogDescription>
          </DialogHeader>
          {editingEvent && (
            <EventForm
              mode="edit"
              autoFocusTitle
              initialValue={{
                title: editingEvent.title,
                dateISO: editingEvent.dateISO,
                description: editingEvent.description,
                severity: editingEvent.severity,
              }}
              onSave={handleEditSave}
              onCancel={() => setEditingEvent(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:max-h-[70vh]">
          <header className="mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-lg font-semibold text-slate-900">DataGrid</h2>
            <p className="text-sm text-slate-600">Events: {gridEvents.length}</p>
          </header>
          <div className="min-h-0 flex-1">
            <DataGrid
              rows={gridEvents}
              columns={gridColumns}
              columnFilters={columnFilters}
              onColumnFilterChange={setColumnFilter}
              totalRowsCount={visibleEvents.length}
              toolbarStart={simulationControls}
              isLoading={simulateLoading}
              error={simulateError ? 'Unable to load events. Please retry.' : null}
              emptyMessage="No matching events."
              getRowId={(event) => event.id}
              selectedRowId={selectedEventId}
              onRowClick={(event) => setSelectedEventId(event.id)}
            />
          </div>
        </article>

        <article className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:max-h-[70vh]">
          <header className="mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-xs"
                onClick={() =>
                  setTimelineSortDirection((current) =>
                    current === 'desc' ? 'asc' : 'desc',
                  )
                }
              >
                {timelineSortDirection === 'desc' ? 'Newest first' : 'Oldest first'}
              </Button>
            </div>
            <p className="text-sm text-slate-600">
              Events: {timelineEvents.length}
            </p>
            <p id={timelineInstructionsId} className="mt-1 text-xs text-slate-600">
              Keyboard: tab to an item. Use Up and Down to move within the same
              day. Use Left and Right to jump between days. Press Enter or Space
              to select the focused event.
            </p>
          </header>
          <div className="min-h-0 flex-1 overflow-auto pr-1">
            {simulateError ? (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700"
                role="alert"
              >
                Unable to load events. Please retry.
              </div>
            ) : simulateLoading ? (
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
                Loading...
              </div>
            ) : timelineEvents.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                No matching events.
              </div>
            ) : (
              <Timeline
                events={timelineEvents}
                selectedId={selectedEventId}
                onSelect={(id) => setSelectedEventId(id)}
                sortDirection={timelineSortDirection}
                instructionsId={timelineInstructionsId}
              />
            )}
          </div>
        </article>
      </section>
    </main>
  )
}
