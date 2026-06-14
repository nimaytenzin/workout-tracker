import type { RecoveryGroupId, MuscleRecoveryStatus } from '../types'
import { RECOVERY_GROUPS } from '../data/muscleGroups'
import type { RecoveryState } from '../types'
import { fatigueToRedThreshold } from './muscleFatigue'

const DEFAULT_RECOVERY_HOURS = 48

export function getRecoveryProgress(
  fatiguedAt: Date,
  recoveryHours: number,
  now = new Date(),
  fatigueScore = 0,
): { hoursRemaining: number; progress: number; status: MuscleRecoveryStatus['status'] } {
  const elapsedMs = now.getTime() - fatiguedAt.getTime()
  const totalMs = recoveryHours * 60 * 60 * 1000
  const progress = Math.min(1, elapsedMs / totalMs)
  const hoursRemaining = Math.max(0, (totalMs - elapsedMs) / (60 * 60 * 1000))

  const redThreshold = fatigueToRedThreshold(fatigueScore)

  let status: MuscleRecoveryStatus['status'] = 'recovered'
  if (progress < redThreshold) status = 'fatigued'
  else if (progress < 1) status = 'recovering'

  return { hoursRemaining, progress, status }
}

export function computeRecoveryStatuses(
  states: RecoveryState[],
  now = new Date(),
): MuscleRecoveryStatus[] {
  const latestByGroup = new Map<RecoveryGroupId, RecoveryState>()

  for (const state of states) {
    const existing = latestByGroup.get(state.recoveryGroup)
    if (!existing || state.fatiguedAt > existing.fatiguedAt) {
      latestByGroup.set(state.recoveryGroup, state)
    }
  }

  return (Object.keys(RECOVERY_GROUPS) as RecoveryGroupId[]).map((group) => {
    const state = latestByGroup.get(group)
    const label = RECOVERY_GROUPS[group].label

    if (!state) {
      return { group, label, status: 'recovered' as const, hoursRemaining: 0, progress: 1 }
    }

    const fatigueScore = state.fatigueScore ?? 0
    const { hoursRemaining, progress, status } = getRecoveryProgress(
      state.fatiguedAt,
      state.recoveryHours,
      now,
      fatigueScore,
    )

    return {
      group,
      label,
      status,
      hoursRemaining,
      progress,
      recoveryHours: state.recoveryHours,
      fatigueScore,
    }
  })
}

export function recoveryColor(status: MuscleRecoveryStatus['status']): string {
  switch (status) {
    case 'fatigued':
      return '#ef4444'
    case 'recovering':
      return '#f59e0b'
    case 'recovered':
      return '#22c55e'
  }
}

export { DEFAULT_RECOVERY_HOURS }
