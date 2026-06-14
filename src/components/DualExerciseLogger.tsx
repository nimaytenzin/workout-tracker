import { useState } from 'react'
import { USERS, getUser } from '@/data/users'
import type { Exercise, SetLog, UserId } from '@/types'
import { SetLogger } from '@/components/SetLogger'
import { RestTimer } from '@/components/RestTimer'
import { cn } from '@/lib/utils'

interface DualExerciseLoggerProps {
  exercise: Exercise
  sessionId: number
  setsByUser: Partial<Record<UserId, SetLog[]>>
  onLogSet: (set: Omit<SetLog, 'id' | 'loggedAt'>) => Promise<void>
}

export function DualExerciseLogger({
  exercise,
  sessionId,
  setsByUser,
  onLogSet,
}: DualExerciseLoggerProps) {
  const [activeUser, setActiveUser] = useState<UserId>('me')
  const [restTrigger, setRestTrigger] = useState(0)

  const activeSets = setsByUser[activeUser] ?? []
  const user = getUser(activeUser)

  return (
    <div className="space-y-4">
      {/* User switcher */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/40 p-1">
        {USERS.map((u) => {
          const count = setsByUser[u.id]?.length ?? 0
          const active = activeUser === u.id
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => setActiveUser(u.id)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all touch-manipulation',
                active ? 'bg-background shadow-sm' : 'text-muted-foreground',
              )}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: u.color }}
              />
              {u.name}
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                  active ? 'bg-muted' : 'opacity-60',
                )}
              >
                {count} sets
              </span>
            </button>
          )
        })}
      </div>

      {/* Progress hint */}
      <div
        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs"
        style={{ backgroundColor: `${user.color}12` }}
      >
        <span style={{ color: user.color }} className="font-medium">
          {user.name}&apos;s turn
        </span>
        <span className="text-muted-foreground">
          {activeSets.length} sets logged
        </span>
      </div>

      <SetLogger
        key={`${exercise.id}-${activeUser}`}
        exercise={exercise}
        sessionId={sessionId}
        userId={activeUser}
        existingSets={activeSets}
        onLogSet={onLogSet}
        onSetLogged={() => setRestTrigger((n) => n + 1)}
      />

      <RestTimer
        key={restTrigger}
        restSeconds={exercise.restSeconds}
        autoStart={restTrigger > 0}
      />
    </div>
  )
}
