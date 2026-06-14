import { db } from './database'
import { WORKOUT_PROGRAM } from '../data/workoutProgram'
import { calculateOneRm } from '../utils/oneRm'
import { DEFAULT_RECOVERY_HOURS } from '../utils/recovery'
import { resolveExercisesForDay } from '../utils/workout'
import type { RecoveryGroupId, UserId } from '../types'

const USERS: UserId[] = ['me', 'partner']

/** Base working weight (kg) for set 1 — week 1 */
const BASE_WEIGHTS: Record<string, { me: number; partner: number }> = {
  'push-bench-press': { me: 80, partner: 45 },
  'push-shoulder-press': { me: 32.5, partner: 17.5 },
  'push-incline-db-press': { me: 28, partner: 15 },
  'push-hi-lo-cable': { me: 25, partner: 12.5 },
  'push-lateral-raise': { me: 12.5, partner: 7.5 },
  'push-oh-triceps': { me: 20, partner: 10 },
  'push-triceps-pushdown': { me: 35, partner: 20 },
  'pull-lat-pulldown': { me: 70, partner: 40 },
  'pull-cable-row': { me: 32.5, partner: 20 },
  'pull-chest-supported-db-row': { me: 34, partner: 20 },
  'pull-rear-delt-fly': { me: 10, partner: 5 },
  'pull-bayesian-curl': { me: 14, partner: 8 },
  'pull-preacher-curl': { me: 20, partner: 12 },
  'pull-reverse-ez-curl': { me: 25, partner: 15 },
  'legs-extensions': { me: 50, partner: 30 },
  'legs-hack-squat': { me: 100, partner: 60 },
  'legs-hip-thrust': { me: 100, partner: 60 },
  'legs-rdl': { me: 80, partner: 50 },
  'legs-seated-curl': { me: 40, partner: 25 },
  'legs-calf-raise': { me: 80, partner: 50 },
  'legs-cable-crunch': { me: 25, partner: 15 },
  'legs-woodchopper': { me: 20, partner: 12.5 },
  'upper-db-bench': { me: 34, partner: 20 },
  'upper-chest-supported-row': { me: 34, partner: 20 },
  'upper-shoulder-press': { me: 32.5, partner: 17.5 },
  'upper-close-grip-pulldown': { me: 65, partner: 37.5 },
  'upper-cable-lateral-raise': { me: 10, partner: 5 },
  'upper-cable-curl': { me: 20, partner: 12 },
  'upper-cable-pushdown': { me: 35, partner: 20 },
  'lower-back-squat': { me: 100, partner: 62.5 },
  'lower-rdl': { me: 85, partner: 52.5 },
  'lower-leg-press': { me: 160, partner: 100 },
  'lower-seated-curl': { me: 45, partner: 27.5 },
  'lower-seated-calf': { me: 50, partner: 30 },
  'lower-hanging-leg-raise': { me: 0, partner: 0 },
  'lower-cable-crunch': { me: 25, partner: 15 },
}

const BODY_WEIGHT_START = { me: 82.5, partner: 58.0 }
const BODY_WEIGHT_END = { me: 81.0, partner: 57.2 }
const PROFILE_HEIGHTS = { me: 178, partner: 165 }

export interface SeedResult {
  sessions: number
  sets: number
  bodyWeightLogs: number
  recoveryStates: number
}

function dateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function atTime(date: Date, hours: number, minutes = 0): Date {
  const d = new Date(date)
  d.setHours(hours, minutes, 0, 0)
  return d
}

/** Mon–Fri gym dates for the last N complete weeks */
function getGymDates(weekCount: number, endDate = new Date()): Date[] {
  const today = new Date(endDate)
  today.setHours(12, 0, 0, 0)

  let lastFriday = new Date(today)
  while (lastFriday.getDay() !== 5) {
    lastFriday.setDate(lastFriday.getDate() - 1)
  }
  if (lastFriday > today) {
    lastFriday.setDate(lastFriday.getDate() - 7)
  }

  const dates: Date[] = []
  for (let week = 0; week < weekCount; week++) {
    for (let dow = 1; dow <= 5; dow++) {
      const d = new Date(lastFriday)
      d.setDate(d.getDate() - (weekCount - 1 - week) * 7 - (5 - dow))
      d.setHours(12, 0, 0, 0)
      if (d <= today) dates.push(d)
    }
  }

  return dates.sort((a, b) => a.getTime() - b.getTime())
}

function weekProgress(weekIndex: number, weekCount: number): number {
  if (weekCount <= 1) return 0
  return weekIndex / (weekCount - 1)
}

function interpolate(start: number, end: number, t: number): number {
  return Math.round((start + (end - start) * t) * 10) / 10
}

function exerciseWeight(
  exerciseId: string,
  userId: UserId,
  weekIndex: number,
  setNumber: number,
): number {
  const base = BASE_WEIGHTS[exerciseId]?.[userId] ?? 20
  const weeklyBump = base >= 50 ? 2.5 : base >= 20 ? 2.5 : 1.25
  const userScale = userId === 'partner' ? 0.95 : 1
  let weight = base + weekIndex * weeklyBump * userScale

  if (setNumber >= 3) weight -= weeklyBump * 0.5
  if (base === 0) return 0

  return Math.round(weight * 4) / 4
}

function setReps(setNumber: number, totalSets: number): number {
  if (setNumber === totalSets) return 8
  if (setNumber === 1) return 10
  return 9
}

function setRpe(setNumber: number, totalSets: number): number {
  if (setNumber === totalSets) return 9
  if (setNumber === 1) return 7
  return 8
}

export async function clearAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [db.sessions, db.setLogs, db.recoveryStates, db.bodyWeights, db.userProfiles],
    async () => {
      await db.sessions.clear()
      await db.setLogs.clear()
      await db.recoveryStates.clear()
      await db.bodyWeights.clear()
      await db.userProfiles.clear()
    },
  )
}

export async function seedDemoData(options?: {
  weeks?: number
  replace?: boolean
}): Promise<SeedResult> {
  const weeks = options?.weeks ?? 3
  const replace = options?.replace ?? true

  if (replace) await clearAllData()

  const gymDates = getGymDates(weeks)
  const dayOrder = WORKOUT_PROGRAM.map((d) => d.id)

  let totalSets = 0
  let totalRecovery = 0

  await db.transaction(
    'rw',
    [db.sessions, db.setLogs, db.recoveryStates, db.bodyWeights, db.userProfiles],
    async () => {
      for (const userId of USERS) {
        await db.userProfiles.add({
          userId,
          heightCm: PROFILE_HEIGHTS[userId],
          updatedAt: new Date(),
        })
      }

      for (let dayIdx = 0; dayIdx < gymDates.length; dayIdx++) {
        const gymDate = gymDates[dayIdx]
        const dayId = dayOrder[dayIdx % dayOrder.length]
        const day = WORKOUT_PROGRAM.find((d) => d.id === dayId)!
        const weekIndex = Math.floor(dayIdx / dayOrder.length)
        const progress = weekProgress(weekIndex, weeks)

        const startedAt = atTime(gymDate, 18, 15)
        const completedAt = atTime(gymDate, 19, 45)
        const sessionId = (await db.sessions.add({
          dayId,
          startedAt,
          completedAt,
        })) as number

        for (const userId of USERS) {
          const bodyWeight = interpolate(
            BODY_WEIGHT_START[userId],
            BODY_WEIGHT_END[userId],
            progress,
          )
          await db.bodyWeights.add({
            userId,
            weight: bodyWeight,
            date: dateString(gymDate),
            loggedAt: atTime(gymDate, 7, 30),
          })

          let setOffsetMinutes = 0
          for (const exercise of resolveExercisesForDay(day, gymDate)) {
            for (let setNum = 1; setNum <= exercise.defaultSets; setNum++) {
              const weight = exerciseWeight(exercise.id, userId, weekIndex, setNum)
              const reps = setReps(setNum, exercise.defaultSets)
              const rpe = setRpe(setNum, exercise.defaultSets)
              const loggedAt = new Date(startedAt.getTime() + setOffsetMinutes * 60_000)

              await db.setLogs.add({
                sessionId,
                userId,
                exerciseId: exercise.id,
                setNumber: setNum,
                weight,
                reps,
                rpe,
                estimated1rm: calculateOneRm(weight, reps),
                loggedAt,
              })
              totalSets++
              setOffsetMinutes += 3
            }
            setOffsetMinutes += 2
          }
        }

        const groups = new Set<RecoveryGroupId>()
        for (const exercise of resolveExercisesForDay(day, gymDate)) {
          for (const t of exercise.targets) groups.add(t.recoveryGroup)
        }

        for (const userId of USERS) {
          for (const recoveryGroup of groups) {
            await db.recoveryStates.add({
              userId,
              recoveryGroup,
              fatiguedAt: completedAt,
              recoveryHours: DEFAULT_RECOVERY_HOURS,
              sessionId,
            })
            totalRecovery++
          }
        }
      }
    },
  )

  return {
    sessions: gymDates.length,
    sets: totalSets,
    bodyWeightLogs: gymDates.length * USERS.length,
    recoveryStates: totalRecovery,
  }
}
