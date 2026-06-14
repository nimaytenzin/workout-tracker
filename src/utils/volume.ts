import type { RecoveryGroupId, SetLog, WeeklyVolumeEntry } from '../types'
import { RECOVERY_GROUPS } from '../data/muscleGroups'
import { getExercise } from '../data/workoutProgram'

export function computeWeeklyVolume(
  setLogs: SetLog[],
  weekStart: Date,
): WeeklyVolumeEntry[] {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const counts = new Map<RecoveryGroupId, number>()

  for (const log of setLogs) {
    const loggedAt = new Date(log.loggedAt)
    if (loggedAt < weekStart || loggedAt >= weekEnd) continue

    const info = getExercise(log.exerciseId)
    if (!info) continue

    const groups = new Set<RecoveryGroupId>()
    for (const t of info.exercise.targets) {
      groups.add(t.recoveryGroup)
    }

    for (const group of groups) {
      counts.set(group, (counts.get(group) ?? 0) + 1)
    }
  }

  return (Object.keys(RECOVERY_GROUPS) as RecoveryGroupId[]).map((group) => ({
    recoveryGroup: group,
    label: RECOVERY_GROUPS[group].label,
    sets: counts.get(group) ?? 0,
  }))
}

export function getWeekStart(date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

export function getMaxVolume(entries: WeeklyVolumeEntry[]): number {
  return Math.max(1, ...entries.map((e) => e.sets))
}
