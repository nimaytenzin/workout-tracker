import { getWorkoutDay, WORKOUT_PROGRAM } from '@/data/workoutProgram'
import { USERS } from '@/data/users'
import type { SetLog, UserId, WorkoutSession } from '@/types'

export const WORKOUT_DAY_COLORS: Record<string, string> = {
  push: '#ef4444',
  pull: '#3b82f6',
  'legs-abs': '#22c55e',
  upper: '#a855f7',
  'lower-abs': '#f59e0b',
}

export interface CalendarSessionEntry {
  sessionId: number
  dayId: string
  dayName: string
  dayNumber: number
  focus: string
  color: string
  date: string
  completed: boolean
  setCount: number
  users: { userId: UserId; name: string; color: string; sets: number }[]
}

export function localDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function sessionDateString(session: WorkoutSession): string {
  const when = session.completedAt ?? session.startedAt
  return localDateString(new Date(when))
}

export function buildCalendarSessions(
  sessions: WorkoutSession[],
  setLogs: SetLog[],
): CalendarSessionEntry[] {
  const setsBySession = new Map<number, SetLog[]>()
  for (const log of setLogs) {
    const list = setsBySession.get(log.sessionId) ?? []
    list.push(log)
    setsBySession.set(log.sessionId, list)
  }

  return sessions
    .map((session) => {
      const day = getWorkoutDay(session.dayId)
      const sets = setsBySession.get(session.id!) ?? []
      const users = USERS.map((user) => ({
        userId: user.id,
        name: user.name,
        color: user.color,
        sets: sets.filter((s) => s.userId === user.id).length,
      })).filter((u) => u.sets > 0)

      return {
        sessionId: session.id!,
        dayId: session.dayId,
        dayName: day?.name ?? session.dayId,
        dayNumber: day?.dayNumber ?? 0,
        focus: day?.focus ?? '',
        color: WORKOUT_DAY_COLORS[session.dayId] ?? '#64748b',
        date: sessionDateString(session),
        completed: !!session.completedAt,
        setCount: sets.length,
        users,
      }
    })
    .filter((entry) => entry.setCount > 0 || entry.completed)
    .sort((a, b) => b.date.localeCompare(a.date) || b.sessionId - a.sessionId)
}

export function groupSessionsByDate(
  entries: CalendarSessionEntry[],
): Map<string, CalendarSessionEntry[]> {
  const map = new Map<string, CalendarSessionEntry[]>()
  for (const entry of entries) {
    const list = map.get(entry.date) ?? []
    list.push(entry)
    map.set(entry.date, list)
  }
  return map
}

export interface MonthCell {
  date: string
  day: number
  inMonth: boolean
  isToday: boolean
}

export function getMonthGrid(year: number, month: number): MonthCell[] {
  const today = localDateString(new Date())
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const gridStart = new Date(year, month, 1 - startOffset)

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)
    const dateStr = localDateString(date)
    return {
      date: dateStr,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isToday: dateStr === today,
    }
  })
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

export function formatCalendarDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export const WORKOUT_LEGEND = WORKOUT_PROGRAM.map((day) => ({
  id: day.id,
  name: day.name,
  shortName: day.name.replace(' Day', '').replace(' & Abs', ''),
  color: WORKOUT_DAY_COLORS[day.id] ?? '#64748b',
}))
