import { useRef, useState } from 'react'
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
  autoFocusTitle?: boolean
}

type EventFormErrors = {
  title?: string
  dateISO?: string
}

export function EventForm({
  mode,
  initialValue,
  onSave,
  onCancel,
  autoFocusTitle = false,
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
  const [errors, setErrors] = useState<EventFormErrors>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const titleRef = useRef<HTMLInputElement | null>(null)
  const dateRef = useRef<HTMLInputElement | null>(null)

  function validate(nextDraft: EventDraft, nextDateInputValue: string): EventFormErrors {
    const nextErrors: EventFormErrors = {}

    if (!nextDraft.title.trim()) {
      nextErrors.title = 'Title is required.'
    }

    if (!nextDateInputValue.trim()) {
      nextErrors.dateISO = 'Date and time are required.'
    } else {
      const date = new Date(nextDateInputValue)
      if (Number.isNaN(date.getTime())) {
        nextErrors.dateISO = 'Please enter a valid date and time.'
      }
    }

    return nextErrors
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        const nextErrors = validate(draft, dateInputValue)
        if (Object.keys(nextErrors).length > 0) {
          setErrors(nextErrors)
          setSuccessMessage(null)
          queueMicrotask(() => {
            if (nextErrors.title) {
              titleRef.current?.focus()
              return
            }

            if (nextErrors.dateISO) {
              dateRef.current?.focus()
            }
          })
          return
        }

        setErrors({})
        onSave(draft)
        setSuccessMessage(mode === 'add' ? 'Event created.' : 'Event saved.')
      }}
    >
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="min-h-5 text-sm text-emerald-700"
      >
        {successMessage ?? ''}
      </div>

      <Field label="Title" htmlFor="event-form-title" error={errors.title}>
        <Input
          ref={titleRef}
          id="event-form-title"
          autoFocus={autoFocusTitle}
          value={draft.title}
          aria-invalid={Boolean(errors.title)}
          onChange={(event) => {
            setDraft((current) => ({ ...current, title: event.target.value }))
            if (successMessage) {
              setSuccessMessage(null)
            }
            if (errors.title) {
              setErrors((current) => ({ ...current, title: undefined }))
            }
          }}
          placeholder="Event title"
        />
      </Field>

      <Field label="Date & Time" htmlFor="event-form-date" error={errors.dateISO}>
        <Input
          ref={dateRef}
          id="event-form-date"
          type="datetime-local"
          value={dateInputValue}
          aria-invalid={Boolean(errors.dateISO)}
          onChange={(event) => {
            const value = event.target.value
            setDateInputValue(value)
            if (successMessage) {
              setSuccessMessage(null)
            }
            if (errors.dateISO) {
              setErrors((current) => ({ ...current, dateISO: undefined }))
            }
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
          onChange={(event) => {
            setDraft((current) => ({
              ...current,
              severity:
                event.target.value === ''
                  ? undefined
                  : (event.target.value as EventDraft['severity']),
            }))
            if (successMessage) {
              setSuccessMessage(null)
            }
          }}
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
          onChange={(event) => {
            setDraft((current) => ({
              ...current,
              description: event.target.value,
            }))
            if (successMessage) {
              setSuccessMessage(null)
            }
          }}
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
