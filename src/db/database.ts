import Dexie, { type EntityTable } from 'dexie'
import type {
  BodyWeightLog,
  RecoveryState,
  SetLog,
  UserBodyProfile,
  WorkoutSession,
} from '../types'

class WorkoutDatabase extends Dexie {
  sessions!: EntityTable<WorkoutSession, 'id'>
  setLogs!: EntityTable<SetLog, 'id'>
  recoveryStates!: EntityTable<RecoveryState, 'id'>
  bodyWeights!: EntityTable<BodyWeightLog, 'id'>
  userProfiles!: EntityTable<UserBodyProfile, 'id'>

  constructor() {
    super('WorkoutTrackerDB')

    this.version(1).stores({
      sessions: '++id, dayId, startedAt, completedAt',
      setLogs: '++id, sessionId, exerciseId, loggedAt',
      recoveryStates: '++id, recoveryGroup, fatiguedAt, sessionId',
    })

    this.version(2)
      .stores({
        sessions: '++id, dayId, startedAt, completedAt',
        setLogs: '++id, sessionId, exerciseId, userId, loggedAt',
        recoveryStates: '++id, recoveryGroup, userId, fatiguedAt, sessionId',
        bodyWeights: '++id, userId, date, [userId+date]',
      })
      .upgrade(async (tx) => {
        await tx
          .table('setLogs')
          .toCollection()
          .modify((log: SetLog & { userId?: string }) => {
            log.userId = (log.userId as SetLog['userId']) ?? 'me'
          })
        await tx
          .table('recoveryStates')
          .toCollection()
          .modify((state: RecoveryState & { userId?: string }) => {
            state.userId = (state.userId as RecoveryState['userId']) ?? 'me'
          })
      })

    this.version(3).stores({
      sessions: '++id, dayId, startedAt, completedAt',
      setLogs: '++id, sessionId, exerciseId, userId, loggedAt',
      recoveryStates: '++id, recoveryGroup, userId, fatiguedAt, sessionId',
      bodyWeights: '++id, userId, date, [userId+date]',
      userProfiles: '++id, userId',
    })

    this.version(4).stores({
      sessions: '++id, dayId, startedAt, completedAt',
      setLogs: '++id, sessionId, exerciseId, userId, loggedAt',
      recoveryStates: '++id, recoveryGroup, userId, fatiguedAt, sessionId',
      bodyWeights: '++id, userId, date, [userId+date]',
      userProfiles: '++id, userId',
      progressPhotos: '++id, capturedAt, addedAt',
    })

    this.version(5).stores({
      sessions: '++id, dayId, startedAt, completedAt',
      setLogs: '++id, sessionId, exerciseId, userId, loggedAt',
      recoveryStates: '++id, recoveryGroup, userId, fatiguedAt, sessionId',
      bodyWeights: '++id, userId, date, [userId+date]',
      userProfiles: '++id, userId',
    })
  }
}

export const db = new WorkoutDatabase()
