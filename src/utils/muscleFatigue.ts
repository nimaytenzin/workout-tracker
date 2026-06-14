import { getExercise } from '@/data/workoutProgram'
import type { RecoveryGroupId, SetLog } from '@/types'

const INVOLVEMENT_WEIGHT = { primary: 1, secondary: 0.35 } as const

/** Score from logged sets — higher = more fatigue for that muscle group */
export function computeGroupFatigueFromSets(
  sets: SetLog[],
): Map<RecoveryGroupId, number> {
  const scores = new Map<RecoveryGroupId, number>()

  for (const set of sets) {
    const info = getExercise(set.exerciseId)
    if (!info) continue

    const rpeMultiplier = 0.45 + (set.rpe / 10) * 0.55

    for (const target of info.exercise.targets) {
      const weight = INVOLVEMENT_WEIGHT[target.involvement ?? 'primary']
      const prev = scores.get(target.recoveryGroup) ?? 0
      scores.set(target.recoveryGroup, prev + weight * rpeMultiplier)
    }
  }

  return scores
}

/** Heavier sessions need longer before green */
export function fatigueToRecoveryHours(score: number): number {
  if (score <= 0) return 36
  return Math.min(72, Math.max(24, 30 + score * 3.5))
}

/**
 * Fraction of recovery window spent in red (fatigued) before yellow.
 * High-volume / high-RPE work stays red longer.
 */
export function fatigueToRedThreshold(score: number): number {
  if (score >= 8) return 0.45
  if (score >= 5) return 0.34
  if (score >= 2.5) return 0.24
  return 0.15
}
