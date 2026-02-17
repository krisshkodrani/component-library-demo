import type { Severity } from '../../shared/types'

export type EventDraft = {
  title: string
  dateISO: string
  description?: string
  severity?: Severity
}

export const SEVERITY_OPTIONS: ReadonlyArray<{ value: '' | Severity; label: string }> = [
  { value: '', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]
