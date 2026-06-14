import type { RecoveryGroupId } from '../types'

export const RECOVERY_GROUPS: Record<
  RecoveryGroupId,
  { label: string; color: string }
> = {
  chest: { label: 'Chest', color: '#ef4444' },
  triceps: { label: 'Triceps', color: '#f97316' },
  shoulders: { label: 'Shoulders', color: '#eab308' },
  back: { label: 'Back', color: '#22c55e' },
  biceps: { label: 'Biceps', color: '#06b6d4' },
  forearms: { label: 'Forearms', color: '#0d9488' },
  quads: { label: 'Quads', color: '#3b82f6' },
  hamstrings: { label: 'Hamstrings', color: '#8b5cf6' },
  glutes: { label: 'Glutes', color: '#ec4899' },
  calves: { label: 'Calves', color: '#14b8a6' },
  abs: { label: 'Abs', color: '#a855f7' },
}

export function target(
  id: string,
  label: string,
  recoveryGroup: RecoveryGroupId,
  involvement: 'primary' | 'secondary' = 'primary',
) {
  return { id, label, recoveryGroup, involvement }
}
