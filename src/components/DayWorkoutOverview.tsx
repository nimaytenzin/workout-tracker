import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, CircleDashed, History, X } from 'lucide-react'
import type { WorkoutDay } from '@/types'
import { RECOVERY_GROUPS } from '@/data/muscleGroups'
import { workoutRepository } from '@/db/repository'
import { buildCalendarSessions, WORKOUT_DAY_COLORS } from '@/utils/calendar'
import { formatShortDate } from '@/data/users'
import { getAlternatingWeekLabel, resolveExercisesForDay } from '@/utils/workout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DayWorkoutOverviewProps {
  day: WorkoutDay
  open: boolean
  onClose: () => void
  currentSessionId?: number | null
}

export function DayWorkoutOverview({
  day,
  open,
  onClose,
  currentSessionId,
}: DayWorkoutOverviewProps) {
  const [history, setHistory] = useState<
    ReturnType<typeof buildCalendarSessions>
  >([])
  const [loading, setLoading] = useState(false)

  const activeExercises = useMemo(() => resolveExercisesForDay(day), [day])

  const musclesWorked = useMemo(() => {
    const groups = new Set<string>()
    for (const exercise of activeExercises) {
      for (const target of exercise.targets) {
        groups.add(target.recoveryGroup)
      }
    }
    return [...groups].map((group) => ({
      id: group,
      ...RECOVERY_GROUPS[group as keyof typeof RECOVERY_GROUPS],
    }))
  }, [activeExercises])

  useEffect(() => {
    if (!open) return

    setLoading(true)
    Promise.all([
      workoutRepository.getSessionsByDayId(day.id),
      workoutRepository.getAllSetLogs(),
    ])
      .then(([sessions, sets]) => {
        setHistory(buildCalendarSessions(sessions, sets))
      })
      .finally(() => setLoading(false))
  }, [open, day.id])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const dayColor = WORKOUT_DAY_COLORS[day.id] ?? '#64748b'

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end safe-x">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close overview"
      />

      <div className="relative mx-auto flex max-h-[min(85dvh,calc(100dvh-env(safe-area-inset-top,0px)-1rem))] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border-t bg-background shadow-2xl safe-bottom">
        <div
          className="flex items-start justify-between gap-3 border-b px-4 py-4"
          style={{ borderLeftWidth: 4, borderLeftColor: dayColor }}
        >
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Day {day.dayNumber} overview
            </p>
            <h2 className="text-lg font-bold">{day.name}</h2>
            <p className="text-sm text-muted-foreground">{day.focus}</p>
            {day.id === 'legs-abs' && (
              <p className="mt-1 text-xs text-primary">{getAlternatingWeekLabel()} · hinge alternates weekly</p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 rounded-xl"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-5 overflow-y-auto px-4 py-4">
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Muscles worked
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {musclesWorked.map((muscle) => (
                <Badge
                  key={muscle.id}
                  variant="outline"
                  className="gap-1.5 text-[11px]"
                  style={{ borderColor: `${muscle.color}55`, color: muscle.color }}
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: muscle.color }}
                  />
                  {muscle.label}
                </Badge>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Exercises ({activeExercises.length})
            </h3>
            <div className="space-y-2">
              {activeExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5"
                >
                  <p className="text-sm font-medium">
                    {index + 1}. {exercise.name}
                  </p>
                  {exercise.sectionLabel && (
                    <p className="text-[10px] font-medium text-primary">{exercise.sectionLabel}</p>
                  )}
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {exercise.targets
                      .map((t) =>
                        t.involvement === 'secondary' ? `${t.label} (secondary)` : t.label,
                      )
                      .join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <History className="size-3.5" />
              Past workouts
            </h3>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading history…</p>
            ) : history.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/50 px-3 py-4 text-center text-sm text-muted-foreground">
                No past {day.name} sessions yet
              </p>
            ) : (
              <div className="space-y-2">
                {history.map((session) => (
                  <div
                    key={session.sessionId}
                    className={cn(
                      'rounded-xl border border-border/50 px-3 py-2.5',
                      session.sessionId === currentSessionId && 'ring-2 ring-primary/30',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {formatShortDate(session.date)}
                      </p>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          session.completed
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : 'bg-amber-500/15 text-amber-500',
                        )}
                      >
                        {session.completed ? (
                          <CheckCircle2 className="size-3" />
                        ) : (
                          <CircleDashed className="size-3" />
                        )}
                        {session.sessionId === currentSessionId
                          ? 'Today'
                          : session.completed
                            ? 'Done'
                            : 'In progress'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {session.setCount} sets
                      {session.users.length > 0 &&
                        ` · ${session.users.map((u) => `${u.name} ${u.sets}`).join(' · ')}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
