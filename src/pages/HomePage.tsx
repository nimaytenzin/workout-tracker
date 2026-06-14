import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Dumbbell } from 'lucide-react'
import { WORKOUT_PROGRAM } from '@/data/workoutProgram'
import { USERS } from '@/data/users'
import { workoutRepository } from '@/db/repository'
import { computeRecoveryStatuses } from '@/utils/recovery'
import { resolveExercisesForDay } from '@/utils/workout'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function HomePage() {
  const [recoveryByUser, setRecoveryByUser] = useState<
    Record<string, ReturnType<typeof computeRecoveryStatuses>>
  >({})

  const refresh = useCallback(async () => {
    const recoveryLists = await Promise.all(
      USERS.map((user) => workoutRepository.getAllRecoveryStates(user.id)),
    )

    const result: typeof recoveryByUser = {}
    USERS.forEach((user, i) => {
      result[user.id] = computeRecoveryStatuses(recoveryLists[i])
    })
    setRecoveryByUser(result)
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 60_000)
    return () => clearInterval(interval)
  }, [refresh])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Workout Template</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          PPL + UL split — log sets separately for {USERS.map((u) => u.name).join(' & ')}
        </p>
      </div>

      <div className="space-y-3">
        {WORKOUT_PROGRAM.map((day) => {
          const exercises = resolveExercisesForDay(day)
          return (
          <Link key={day.id} to={`/workout/${day.id}`} className="block touch-manipulation select-none">
            <Card className="overflow-hidden transition-colors active:bg-accent/40 active:scale-[0.99]">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
                    D{day.dayNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">{day.name}</CardTitle>
                    <CardDescription className="mt-1">{day.focus}</CardDescription>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Dumbbell className="size-3.5" />
                      {exercises.length} exercises · dual logging
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground" />
                </div>
              </CardHeader>

              <CardContent className="space-y-2 pt-0">
                {USERS.map((user) => {
                  const recovery = recoveryByUser[user.id] ?? []
                  const fatigued = recovery.filter(
                    (r) =>
                      r.status !== 'recovered' &&
                      exercises.some((e) =>
                        e.targets.some((t) => t.recoveryGroup === r.group),
                      ),
                  )
                  if (fatigued.length === 0) return null

                  return (
                    <div key={user.id} className="flex flex-wrap items-center gap-1.5">
                      <span
                        className="text-xs font-medium"
                        style={{ color: user.color }}
                      >
                        {user.name}:
                      </span>
                      {fatigued.slice(0, 3).map((r) => (
                        <Badge
                          key={r.group}
                          variant={r.status === 'fatigued' ? 'destructive' : 'warning'}
                          className="text-[10px]"
                        >
                          {r.label}
                        </Badge>
                      ))}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </Link>
          )
        })}
      </div>
    </div>
  )
}
