import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Timer,
} from 'lucide-react'
import { getWorkoutDay } from '@/data/workoutProgram'
import { USERS } from '@/data/users'
import { workoutRepository } from '@/db/repository'
import { DualExerciseLogger } from '@/components/DualExerciseLogger'
import type { SetLog, UserId } from '@/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export function WorkoutPage() {
  const { dayId } = useParams<{ dayId: string }>()
  const day = dayId ? getWorkoutDay(dayId) : undefined

  const [sessionId, setSessionId] = useState<number | null>(null)
  const [setsByExerciseUser, setSetsByExerciseUser] = useState<
    Record<string, Partial<Record<UserId, SetLog[]>>>
  >({})
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)

  const exercise = day?.exercises[exerciseIndex]
  const totalExercises = day?.exercises.length ?? 0
  const isFirst = exerciseIndex === 0
  const isLast = exerciseIndex === totalExercises - 1

  const loadSets = useCallback(async (sid: number) => {
    const allSets = await workoutRepository.getSessionSets(sid)
    const grouped: Record<string, Partial<Record<UserId, SetLog[]>>> = {}

    for (const s of allSets) {
      if (!grouped[s.exerciseId]) grouped[s.exerciseId] = {}
      if (!grouped[s.exerciseId][s.userId]) grouped[s.exerciseId][s.userId] = []
      grouped[s.exerciseId][s.userId]!.push(s)
    }
    setSetsByExerciseUser(grouped)
  }, [])

  useEffect(() => {
    if (!day) return

    async function init() {
      let session = await workoutRepository.getActiveSession(day!.id)
      if (!session?.id) {
        const id = await workoutRepository.startSession(day!.id)
        session = { id, dayId: day!.id, startedAt: new Date() }
      }
      setSessionId(session.id!)
      if (session.completedAt) setCompleted(true)
      await loadSets(session.id!)
      setExerciseIndex(0)
    }

    init()
  }, [day, loadSets])

  if (!day) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Workout day not found.</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Back to schedule
          </Link>
        </Button>
      </div>
    )
  }

  async function handleLogSet(data: Omit<SetLog, 'id' | 'loggedAt'>) {
    await workoutRepository.logSet(data)
    if (sessionId) await loadSets(sessionId)
  }

  async function handleComplete() {
    if (!sessionId || !dayId) return
    setCompleting(true)
    try {
      await workoutRepository.completeSession(sessionId, dayId)
      setCompleted(true)
    } finally {
      setCompleting(false)
    }
  }

  const totalSets = Object.values(setsByExerciseUser).reduce(
    (n, byUser) =>
      n + Object.values(byUser).reduce((sum, sets) => sum + (sets?.length ?? 0), 0),
    0,
  )

  const byUser = exercise ? (setsByExerciseUser[exercise.id] ?? {}) : {}
  const exerciseSets = Object.values(byUser).reduce(
    (n, sets) => n + (sets?.length ?? 0),
    0,
  )

  const progressPct = totalExercises > 0 ? ((exerciseIndex + 1) / totalExercises) * 100 : 0

  return (
    <div className="relative -mx-4 flex min-h-[calc(100dvh-8rem)] flex-col">
      {/* Sticky workout header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-md">
        <div className="space-y-2 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Button asChild variant="ghost" size="sm" className="-ml-2 h-9 px-2">
              <Link to="/">
                <ArrowLeft className="size-4" />
                {day.name}
              </Link>
            </Button>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold tabular-nums">
              {exerciseIndex + 1}/{totalExercises}
            </span>
          </div>

          <Progress value={progressPct} className="h-1" />

          {completed && (
            <Alert variant="success">
              <CheckCircle2 />
              <AlertTitle>Workout complete</AlertTitle>
              <AlertDescription>
                Recovery timers activated for muscle groups trained today.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {exercise && !completed && (
        <>
          {/* Exercise hero */}
          <div className="space-y-3 px-4 pb-2 pt-4">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Dumbbell className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold leading-snug tracking-tight">
                  {exercise.name}
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Timer className="size-3" />
                    {exercise.restSeconds}s rest
                  </span>
                  {USERS.map((u) => {
                    const n = byUser[u.id]?.length ?? 0
                    return (
                      <span key={u.id} className="inline-flex items-center gap-1">
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: u.color }}
                        />
                        {n} sets
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {exercise.targets.map((t) => t.label).join(' · ')}
            </p>
          </div>

          {/* Logger */}
          <div className="flex-1 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))]">
            {sessionId && (
              <DualExerciseLogger
                exercise={exercise}
                sessionId={sessionId}
                setsByUser={byUser}
                onLogSet={handleLogSet}
              />
            )}
          </div>
        </>
      )}

      {completed && (
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <CheckCircle2 className="mb-3 size-12 text-emerald-400" />
          <p className="text-lg font-semibold">Great session!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalSets} sets logged across {totalExercises} exercises
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Back to schedule</Link>
          </Button>
        </div>
      )}

      {/* Bottom exercise nav */}
      {!completed && exercise && (
        <div
          className={cn(
            'fixed inset-x-0 z-30 border-t bg-background/95 backdrop-blur-md',
            'bottom-[calc(4.25rem+env(safe-area-inset-bottom))]',
          )}
        >
          <div className="mx-auto flex max-w-lg items-center gap-2 px-3 py-2.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 shrink-0 rounded-xl"
              disabled={isFirst}
              onClick={() => setExerciseIndex((i) => i - 1)}
              aria-label="Previous exercise"
            >
              <ChevronLeft className="size-5" />
            </Button>

            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
                {isLast ? 'Final exercise' : 'Next up'}
              </p>
              <p className="truncate text-sm font-medium">
                {isLast ? exercise.name : day.exercises[exerciseIndex + 1]?.name}
              </p>
            </div>

            {isLast ? (
              <Button
                type="button"
                variant="success"
                className="h-11 shrink-0 rounded-xl px-4 font-semibold"
                onClick={handleComplete}
                disabled={completing || totalSets === 0}
              >
                {completing ? '…' : 'Finish'}
              </Button>
            ) : (
              <Button
                type="button"
                className="h-11 shrink-0 gap-1 rounded-xl px-4 font-semibold"
                onClick={() => setExerciseIndex((i) => i + 1)}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>

          {exerciseSets > 0 && (
            <p className="pb-2 text-center text-[10px] text-muted-foreground">
              {exerciseSets} sets this exercise · {totalSets} total today
            </p>
          )}
        </div>
      )}
    </div>
  )
}
