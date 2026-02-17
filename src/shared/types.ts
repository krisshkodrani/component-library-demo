export type Severity = 'low' | 'medium' | 'high'

export type Event = {
  id: string
  title: string
  dateISO: string
  description?: string
  severity?: Severity
}

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger'

export const severityToVariant: Record<Severity, BadgeVariant> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
}
