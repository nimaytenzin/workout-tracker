import type { Exercise, WorkoutDay } from '@/types'

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
}

export function getAlternatingWeek(date = new Date()): 'A' | 'B' {
  return getISOWeek(date) % 2 === 1 ? 'A' : 'B'
}

export function resolveExercisesForDay(day: WorkoutDay, date = new Date()): Exercise[] {
  const week = getAlternatingWeek(date)
  return day.exercises.filter((exercise) => !exercise.alternateWeek || exercise.alternateWeek === week)
}

export function getAlternatingWeekLabel(date = new Date()): string {
  return `Week ${getAlternatingWeek(date)}`
}
