import type { Slug } from 'react-muscle-highlighter'
import type { RecoveryGroupId } from '@/types'

/** Every trainable muscle slug on the body diagram maps to a recovery group */
export const RECOVERY_TO_SLUGS: Record<RecoveryGroupId, Slug[]> = {
  chest: ['chest'],
  shoulders: ['deltoids'],
  triceps: ['triceps'],
  back: ['upper-back', 'lower-back', 'trapezius'],
  biceps: ['biceps'],
  forearms: ['forearm'],
  quads: ['quadriceps', 'adductors'],
  hamstrings: ['hamstring'],
  glutes: ['gluteal'],
  calves: ['calves', 'tibialis'],
  abs: ['abs', 'obliques'],
}

/** Non-muscle anatomy — hidden so only trackable muscles are visible */
export const HIDDEN_BODY_PARTS: Slug[] = [
  'hair',
  'head',
  'neck',
  'hands',
  'feet',
  'ankles',
  'knees',
]

export const ALL_TRAINABLE_SLUGS: Slug[] = Object.values(RECOVERY_TO_SLUGS).flat()

export const SLUG_TO_RECOVERY_GROUP: Partial<Record<Slug, RecoveryGroupId>> =
  Object.fromEntries(
    Object.entries(RECOVERY_TO_SLUGS).flatMap(([group, slugs]) =>
      slugs.map((slug) => [slug, group as RecoveryGroupId]),
    ),
  ) as Partial<Record<Slug, RecoveryGroupId>>
