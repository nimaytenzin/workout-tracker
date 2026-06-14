export const WEIGHT_UNIT = 'kg' as const

export type UserId = 'me' | 'partner'

export interface UserProfile {
  id: UserId
  name: string
  color: string
}

export type RecoveryGroupId =
  | 'chest'
  | 'triceps'
  | 'shoulders'
  | 'back'
  | 'biceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'

export interface MuscleTarget {
  id: string
  label: string
  recoveryGroup: RecoveryGroupId
}

export interface Exercise {
  id: string
  name: string
  targets: MuscleTarget[]
  restSeconds: number
  defaultSets: number
  /** When set, exercise only appears on alternating Week A or B */
  alternateWeek?: 'A' | 'B'
}

export interface WorkoutDay {
  id: string
  dayNumber: number
  name: string
  focus: string
  exercises: Exercise[]
}

export interface SetLog {
  id?: number
  sessionId: number
  userId: UserId
  exerciseId: string
  setNumber: number
  weight: number
  reps: number
  rpe: number
  estimated1rm: number
  loggedAt: Date
}

export interface WorkoutSession {
  id?: number
  dayId: string
  startedAt: Date
  completedAt?: Date
}

export interface RecoveryState {
  id?: number
  userId: UserId
  recoveryGroup: RecoveryGroupId
  fatiguedAt: Date
  recoveryHours: number
  sessionId: number
}

export interface BodyWeightLog {
  id?: number
  userId: UserId
  weight: number
  date: string
  loggedAt: Date
}

export interface MuscleRecoveryStatus {
  group: RecoveryGroupId
  label: string
  status: 'recovered' | 'recovering' | 'fatigued'
  hoursRemaining: number
  progress: number
}

export interface WeeklyVolumeEntry {
  recoveryGroup: RecoveryGroupId
  label: string
  sets: number
}

export interface WeightChartPoint {
  date: string
  label: string
  me?: number
  partner?: number
}

export type { UserBodyProfile, BmiChartPoint } from './body'
