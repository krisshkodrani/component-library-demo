import type { Event } from '../../shared'

export type TimelineEvent = Pick<Event, 'id' | 'title' | 'dateISO' | 'severity'>
