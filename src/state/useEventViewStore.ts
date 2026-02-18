import { create } from 'zustand'
import { makeMockEvents, type Event, type Severity } from '../shared'

type EventInput = {
  title: string
  dateISO: string
  description?: string
  severity?: Severity
}

type ColumnFilterState = Record<string, string>

type EventViewStore = {
  events: Event[]
  selectedEventId: string | null
  columnFilters: ColumnFilterState
  setSelectedEventId: (id: string | null) => void
  setColumnFilter: (columnId: string, value: string) => void
  addEvent: (draft: EventInput) => string
  updateEvent: (id: string, draft: EventInput) => void
}

export const useEventViewStore = create<EventViewStore>((set) => ({
  events: makeMockEvents(200),
  selectedEventId: null,
  columnFilters: {},
  setSelectedEventId: (id) => set({ selectedEventId: id }),
  setColumnFilter: (columnId, value) =>
    set((state) => {
      if (!value.trim()) {
        return {
          columnFilters: Object.fromEntries(
            Object.entries(state.columnFilters).filter(([key]) => key !== columnId),
          ),
        }
      }
      return { columnFilters: { ...state.columnFilters, [columnId]: value } }
    }),
  addEvent: (draft) => {
    const nextId =
      globalThis.crypto?.randomUUID?.() ??
      `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const nextEvent: Event = {
      id: nextId,
      title: draft.title,
      dateISO: draft.dateISO,
      description: draft.description,
      severity: draft.severity,
    }

    set((state) => ({ events: [nextEvent, ...state.events] }))
    return nextId
  },
  updateEvent: (id, draft) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id
          ? {
              ...event,
              title: draft.title,
              dateISO: draft.dateISO,
              description: draft.description,
              severity: draft.severity,
            }
          : event,
      ),
    })),
}))
