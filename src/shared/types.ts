export type Event = {
  id: string
  title: string
  dateISO: string
  description?: string
  severity?: 'low' | 'medium' | 'high'
}
