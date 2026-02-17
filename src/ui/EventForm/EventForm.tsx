import { useState } from 'react'
import { Button } from '../primitives/Button'
import { Field } from '../primitives/Field'
import { Input } from '../primitives/Input'
import type { EventDraft } from './types'

function toLocalDateTimeInputValue(dateISO: string): string {
  const date = new Date(dateISO)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

type EventFormProps = {
  mode: 'add' | 'edit'
  initialValue?: EventDraft
  onSave: (draft: EventDraft) => void
  onCancel: () => void
}

export function EventForm({
  mode,
  initialValue,
  onSave,
  onCancel,
}: EventFormProps) {
  const initialDateISO = initialValue?.dateISO ?? new Date().toISOString()
  const [draft, setDraft] = useState<EventDraft>({
    title: initialValue?.title ?? '',
    dateISO: initialDateISO,
    description: initialValue?.description ?? '',
    severity: initialValue?.severity,
  })
  const [dateInputValue, setDateInputValue] = useState(
    toLocalDateTimeInputValue(initialDateISO),
  )

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSave(draft)
      }}
    >
      <Field label="Title" htmlFor="event-form-title">
        <Input
          id="event-form-title"
          value={draft.title}
          onChange={(event) =>
            setDraft((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="Event title"
        />
      </Field>

      <Field label="Date & Time" htmlFor="event-form-date">
        <Input
          id="event-form-date"
          type="datetime-local"
          value={dateInputValue}
          onChange={(event) => {
            const value = event.target.value
            setDateInputValue(value)
            const nextDate = new Date(value)
            if (!Number.isNaN(nextDate.getTime())) {
              setDraft((current) => ({
                ...current,
                dateISO: nextDate.toISOString(),
              }))
            }
          }}
        />
      </Field>

      <Field label="Severity" htmlFor="event-form-severity">
        <select
          id="event-form-severity"
          value={draft.severity ?? ''}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              severity:
                event.target.value === ''
                  ? undefined
                  : (event.target.value as EventDraft['severity']),
            }))
          }
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <option value="">None</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </Field>

      <Field label="Description" htmlFor="event-form-description">
        <textarea
          id="event-form-description"
          value={draft.description ?? ''}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          rows={3}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          placeholder="Optional details"
        />
      </Field>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{mode === 'add' ? 'Save' : 'Save changes'}</Button>
      </div>
    </form>
  )
}
