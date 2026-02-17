export type EventDraft = {
  title: string
  dateISO: string
  description?: string
  severity?: 'low' | 'medium' | 'high'
}
