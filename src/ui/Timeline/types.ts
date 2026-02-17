export type TimelineEvent = {
  id: string
  title: string
  dateISO: string
  severity?: 'low' | 'medium' | 'high'
}
