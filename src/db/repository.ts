import { db } from './database'
import { WORKOUT_PROGRAM, getExercise } from '../data/workoutProgram'
import { todayDateString } from '../data/users'
import { DEFAULT_RECOVERY_HOURS } from '../utils/recovery'
import type {
  BodyWeightLog,
  ExerciseSessionHistory,
  RecoveryGroupId,
  RecoveryState,
  SetLog,
  UserId,
  WorkoutSession,
} from '../types'
import { formatShortDate } from '../data/users'
import { localDateString } from '../utils/calendar'

/** Data access layer — swap implementation for Supabase later */
export const workoutRepository = {
  async startSession(dayId: string): Promise<number> {
    const id = await db.sessions.add({ dayId, startedAt: new Date() })
    return id as number
  },

  async getActiveSession(dayId: string): Promise<WorkoutSession | undefined> {
    return db.sessions
      .where('dayId')
      .equals(dayId)
      .filter((s) => !s.completedAt)
      .reverse()
      .first()
  },

  async completeSession(sessionId: number, dayId: string): Promise<void> {
    await db.sessions.update(sessionId, { completedAt: new Date() })

    const day = WORKOUT_PROGRAM.find((d) => d.id === dayId)
    if (!day) return

    const sessionSets = await db.setLogs.where('sessionId').equals(sessionId).toArray()
    const activeUsers = new Set(sessionSets.map((s) => s.userId))
    const exercisedIds = new Set(sessionSets.map((s) => s.exerciseId))

    const groups = new Set<RecoveryGroupId>()
    for (const exerciseId of exercisedIds) {
      const info = getExercise(exerciseId)
      if (!info) continue
      for (const t of info.exercise.targets) groups.add(t.recoveryGroup)
    }

    const now = new Date()
    const entries: Omit<RecoveryState, 'id'>[] = []
    for (const userId of activeUsers) {
      for (const recoveryGroup of groups) {
        entries.push({
          userId,
          recoveryGroup,
          fatiguedAt: now,
          recoveryHours: DEFAULT_RECOVERY_HOURS,
          sessionId,
        })
      }
    }
    if (entries.length > 0) await db.recoveryStates.bulkAdd(entries)
  },

  async logSet(data: Omit<SetLog, 'id' | 'loggedAt'>): Promise<number> {
    const id = await db.setLogs.add({ ...data, loggedAt: new Date() })
    return id as number
  },

  async deleteSet(setId: number): Promise<void> {
    const set = await db.setLogs.get(setId)
    if (!set) return

    await db.setLogs.delete(setId)

    const toRenumber = await db.setLogs
      .where('sessionId')
      .equals(set.sessionId)
      .filter(
        (s) =>
          s.exerciseId === set.exerciseId &&
          s.userId === set.userId &&
          s.setNumber > set.setNumber,
      )
      .toArray()

    for (const s of toRenumber) {
      if (s.id) await db.setLogs.update(s.id, { setNumber: s.setNumber - 1 })
    }
  },

  async getSessionSets(sessionId: number): Promise<SetLog[]> {
    return db.setLogs.where('sessionId').equals(sessionId).sortBy('setNumber')
  },

  async getLastSetForExercise(
    exerciseId: string,
    userId: UserId,
    excludeSessionId?: number,
  ): Promise<SetLog | undefined> {
    const sets = await this.getPreviousSessionSetsForExercise(
      exerciseId,
      userId,
      excludeSessionId,
    )
    return sets.at(-1)
  },

  async getPreviousSessionSetsForExercise(
    exerciseId: string,
    userId: UserId,
    excludeSessionId?: number,
  ): Promise<SetLog[]> {
    let sets = await db.setLogs
      .where('exerciseId')
      .equals(exerciseId)
      .filter((s) => s.userId === userId)
      .toArray()

    if (excludeSessionId) {
      sets = sets.filter((s) => s.sessionId !== excludeSessionId)
    }
    if (sets.length === 0) return []

    let latestSessionId = sets[0].sessionId
    let latestTime = 0
    for (const set of sets) {
      const time = new Date(set.loggedAt).getTime()
      if (time > latestTime) {
        latestTime = time
        latestSessionId = set.sessionId
      }
    }

    return sets
      .filter((s) => s.sessionId === latestSessionId)
      .sort((a, b) => a.setNumber - b.setNumber)
  },

  async getExerciseSessionHistory(
    exerciseId: string,
    userId: UserId,
    excludeSessionId?: number,
    limit = 4,
  ): Promise<ExerciseSessionHistory[]> {
    let sets = await db.setLogs
      .where('exerciseId')
      .equals(exerciseId)
      .filter((s) => s.userId === userId)
      .toArray()

    if (excludeSessionId) {
      sets = sets.filter((s) => s.sessionId !== excludeSessionId)
    }
    if (sets.length === 0) return []

    const bySession = new Map<number, SetLog[]>()
    for (const set of sets) {
      const list = bySession.get(set.sessionId) ?? []
      list.push(set)
      bySession.set(set.sessionId, list)
    }

    const sessions = await db.sessions.toArray()
    const sessionMap = new Map(sessions.map((s) => [s.id!, s]))

    return [...bySession.entries()]
      .map(([sessionId, sessionSets]) => {
        const session = sessionMap.get(sessionId)
        const when = session?.completedAt ?? session?.startedAt ?? sessionSets[0]?.loggedAt
        const date = localDateString(new Date(when))
        return {
          sessionId,
          date,
          label: formatShortDate(date),
          sets: sessionSets.sort((a, b) => a.setNumber - b.setNumber),
          time: new Date(when).getTime(),
        }
      })
      .sort((a, b) => b.time - a.time)
      .slice(0, limit)
      .map(({ time: _time, ...entry }) => entry)
  },

  async getAllSetLogs(userId?: UserId): Promise<SetLog[]> {
    const logs = await db.setLogs.orderBy('loggedAt').reverse().toArray()
    return userId ? logs.filter((l) => l.userId === userId) : logs
  },

  async getAllRecoveryStates(userId?: UserId) {
    const states = await db.recoveryStates.orderBy('fatiguedAt').reverse().toArray()
    return userId ? states.filter((s) => s.userId === userId) : states
  },

  async getRecentSessions(limit = 10): Promise<WorkoutSession[]> {
    return db.sessions.orderBy('startedAt').reverse().limit(limit).toArray()
  },

  async getAllSessions(): Promise<WorkoutSession[]> {
    return db.sessions.orderBy('startedAt').reverse().toArray()
  },

  async getSessionsByDayId(dayId: string): Promise<WorkoutSession[]> {
    const sessions = await db.sessions.where('dayId').equals(dayId).toArray()
    return sessions.sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    )
  },

  async logBodyWeight(userId: UserId, weight: number, date = todayDateString()): Promise<void> {
    const existing = await db.bodyWeights
      .where('[userId+date]')
      .equals([userId, date])
      .first()

    if (existing?.id) {
      await db.bodyWeights.update(existing.id, { weight, loggedAt: new Date() })
    } else {
      await db.bodyWeights.add({ userId, weight, date, loggedAt: new Date() })
    }
  },

  async getBodyWeightHistory(userId: UserId, days = 90): Promise<BodyWeightLog[]> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = todayDateString(cutoff)

    return db.bodyWeights
      .where('userId')
      .equals(userId)
      .filter((w) => w.date >= cutoffStr)
      .sortBy('date')
  },

  async getAllBodyWeights(days = 90): Promise<BodyWeightLog[]> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = todayDateString(cutoff)

    return db.bodyWeights.filter((w) => w.date >= cutoffStr).sortBy('date')
  },

  async getTodayBodyWeights(): Promise<Partial<Record<UserId, number>>> {
    const today = todayDateString()
    const logs = await db.bodyWeights.where('date').equals(today).toArray()
    const result: Partial<Record<UserId, number>> = {}
    for (const log of logs) result[log.userId] = log.weight
    return result
  },

  async getUserProfile(userId: UserId) {
    return db.userProfiles.where('userId').equals(userId).first()
  },

  async getAllUserProfiles(): Promise<Partial<Record<UserId, number>>> {
    const profiles = await db.userProfiles.toArray()
    const result: Partial<Record<UserId, number>> = {}
    for (const p of profiles) {
      if (p.heightCm > 0) result[p.userId as UserId] = p.heightCm
    }
    return result
  },

  async saveUserProfile(userId: UserId, heightCm: number): Promise<void> {
    const existing = await db.userProfiles.where('userId').equals(userId).first()
    if (existing?.id) {
      await db.userProfiles.update(existing.id, {
        heightCm,
        updatedAt: new Date(),
      })
    } else {
      await db.userProfiles.add({ userId, heightCm, updatedAt: new Date() })
    }
  },

  async isBmiSetupComplete(): Promise<boolean> {
    for (const userId of ['me', 'partner'] as UserId[]) {
      const profile = await db.userProfiles.where('userId').equals(userId).first()
      if (!profile?.heightCm || profile.heightCm <= 0) return false
    }
    return true
  },

  async getSessionCount(): Promise<number> {
    return db.sessions.count()
  },
}
