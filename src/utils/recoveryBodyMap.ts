import type { Slug } from 'react-muscle-highlighter'
import type { RecoveryGroupId } from '@/types'

/** Maps app recovery groups to react-muscle-highlighter muscle slugs */
export const RECOVERY_TO_SLUGS: Record<RecoveryGroupId, Slug[]> = {
  chest: ['chest'],
  triceps: ['triceps'],
  shoulders: ['deltoids'],
  back: ['upper-back', 'lower-back', 'trapezius'],
  biceps: ['biceps'],
  quads: ['quadriceps'],
  hamstrings: ['hamstring'],
  glutes: ['gluteal'],
  calves: ['calves'],
  abs: ['abs', 'obliques'],
}

export const SLUG_TO_RECOVERY_GROUP: Partial<Record<Slug, RecoveryGroupId>> =
  Object.fromEntries(
    Object.entries(RECOVERY_TO_SLUGS).flatMap(([group, slugs]) =>
      slugs.map((slug) => [slug, group as RecoveryGroupId]),
    ),
  ) as Partial<Record<Slug, RecoveryGroupId>>
