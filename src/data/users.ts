import type { UserId, UserProfile } from '@/types'

export const USERS: UserProfile[] = [
  { id: 'me', name: 'Nima', color: '#3b82f6' },
  { id: 'partner', name: 'Yeshi', color: '#ec4899' },
]

export function getUser(id: UserId): UserProfile {
  return USERS.find((u) => u.id === id)!
}

export function todayDateString(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
