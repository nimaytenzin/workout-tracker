import { useEffect, useState } from 'react'
import { Check, Copy, Plus, TrendingUp } from 'lucide-react'
import type { Exercise, SetLog, UserId } from '@/types'
import { getUser } from '@/data/users'
import { workoutRepository } from '@/db/repository'
import { calculateOneRm, formatOneRm } from '@/utils/oneRm'
import { NumberStepper } from '@/components/NumberStepper'
import { RpeSelect } from '@/components/RpeSelect'
import { Button } from '@/components/ui/button'
import { formatRpeLabel } from '@/utils/rpe'
import { cn } from '@/lib/utils'

interface SetLoggerProps {
  exercise: Exercise
  sessionId: number
  userId: UserId
  existingSets: SetLog[]
  onLogSet: (set: Omit<SetLog, 'id' | 'loggedAt'>) => Promise<void>
  onSetLogged?: () => void
}

function weightDelta(today: number, last?: number): number | null {
  if (last === undefined || today === last) return null
  return Math.round((today - last) * 4) / 4
}

export function SetLogger({
  exercise,
  sessionId,
  userId,
  existingSets,
  onLogSet,
  onSetLogged,
}: SetLoggerProps) {
  const user = getUser(userId)
  const nextSetNumber = existingSets.length + 1
  const sessionLastSet = existingSets.at(-1)

  const [weight, setWeight] = useState(sessionLastSet?.weight ?? 0)
  const [reps, setReps] = useState(sessionLastSet?.reps ?? 0)
  const [rpe, setRpe] = useState(String(sessionLastSet?.rpe ?? 8))
  const [saving, setSaving] = useState(false)
  const [lastHistorical, setLastHistorical] = useState<SetLog[]>([])

  const totalSetRows = Math.max(
    exercise.defaultSets,
    lastHistorical.length,
    existingSets.length + (existingSets.length < exercise.defaultSets ? 1 : 0),
  )

  const lastSetForNext = lastHistorical[nextSetNumber - 1] ?? lastHistorical.at(-1)
  const inputId = `${exercise.id}-${userId}`
  const estimated1rm = calculateOneRm(weight, reps)
  const best1rm = existingSets.reduce((max, s) => Math.max(max, s.estimated1rm), 0)

  useEffect(() => {
    workoutRepository
      .getPreviousSessionSetsForExercise(exercise.id, userId, sessionId)
      .then(setLastHistorical)
  }, [exercise.id, userId, sessionId])

  useEffect(() => {
    if (sessionLastSet) {
      setWeight(sessionLastSet.weight)
      setReps(sessionLastSet.reps)
      setRpe(String(sessionLastSet.rpe))
      return
    }

    const ref = lastHistorical[nextSetNumber - 1] ?? lastHistorical.at(-1)
    if (ref) {
      setWeight(ref.weight)
      setReps(ref.reps)
      setRpe(String(ref.rpe))
    }
  }, [nextSetNumber, sessionLastSet, lastHistorical])

  function applyLastSet(bumpKg = 0) {
    const ref = lastSetForNext
    if (!ref) return
    setWeight(Math.round((ref.weight + bumpKg) * 4) / 4)
    setReps(ref.reps)
    setRpe(String(ref.rpe))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (weight <= 0 || reps <= 0) return

    setSaving(true)
    try {
      await onLogSet({
        sessionId,
        userId,
        exerciseId: exercise.id,
        setNumber: nextSetNumber,
        weight,
        reps,
        rpe: parseInt(rpe, 10),
        estimated1rm,
      })
      onSetLogged?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Set comparison list */}
      <div className="space-y-2">
        {Array.from({ length: totalSetRows }, (_, i) => {
          const setNum = i + 1
          const todaySet = existingSets.find((s) => s.setNumber === setNum)
          const lastSet = lastHistorical.find((s) => s.setNumber === setNum)
          const isActive = !todaySet && setNum === nextSetNumber
          const isDone = !!todaySet
          const delta = todaySet ? weightDelta(todaySet.weight, lastSet?.weight) : null

          return (
            <div
              key={setNum}
              className={cn(
                'overflow-hidden rounded-2xl border transition-colors',
                isActive && 'border-2 shadow-sm',
                isDone && 'border-border/50 bg-background/40',
                !isActive && !isDone && 'border-border/30 bg-background/20 opacity-60',
              )}
              style={
                isActive
                  ? { borderColor: user.color, backgroundColor: `${user.color}0c` }
                  : undefined
              }
            >
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex size-7 items-center justify-center rounded-full text-xs font-bold',
                      isDone && 'bg-emerald-500/15 text-emerald-500',
                      isActive && 'text-white',
                      !isDone && !isActive && 'bg-muted text-muted-foreground',
                    )}
                    style={isActive ? { backgroundColor: user.color } : undefined}
                  >
                    {isDone ? <Check className="size-3.5" strokeWidth={3} /> : setNum}
                  </span>
                  <span className="text-sm font-semibold">Set {setNum}</span>
                </div>
                {delta !== null && delta !== 0 && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums',
                      delta > 0 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500',
                    )}
                  >
                    {delta > 0 ? '+' : ''}
                    {delta} kg
                  </span>
                )}
              </div>

              {lastSet && (
                <div className="flex items-center gap-2 border-t border-border/30 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                  <TrendingUp className="size-3 shrink-0 opacity-60" />
                  <span className="shrink-0 font-medium uppercase tracking-wide opacity-70">
                    Last
                  </span>
                  <span className="tabular-nums">
                    {lastSet.weight} kg × {lastSet.reps}
                  </span>
                  <span className="truncate">· {formatRpeLabel(lastSet.rpe)}</span>
                </div>
              )}

              {todaySet && (
                <div
                  className="flex items-center gap-2 border-t border-border/30 px-3 py-2.5 text-sm"
                  style={{ color: user.color }}
                >
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-foreground">
                    Today
                  </span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {todaySet.weight} kg × {todaySet.reps}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    · {formatRpeLabel(todaySet.rpe)}
                  </span>
                  <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                    {formatOneRm(todaySet.estimated1rm)}
                  </span>
                </div>
              )}

              {isActive && (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-3 border-t border-border/30 bg-background/60 p-3"
                >
                  {lastSet && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-9 flex-1 gap-1.5 rounded-xl text-xs"
                        onClick={() => applyLastSet(0)}
                      >
                        <Copy className="size-3.5" />
                        Match last
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-9 flex-1 gap-1.5 rounded-xl text-xs"
                        onClick={() => applyLastSet(2.5)}
                      >
                        <Plus className="size-3.5" />
                        +2.5 kg
                      </Button>
                    </div>
                  )}

                  <NumberStepper
                    id={`weight-${inputId}`}
                    value={weight}
                    onChange={setWeight}
                    step={2.5}
                    min={0}
                    suffix="kg"
                    inputMode="decimal"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <NumberStepper
                      id={`reps-${inputId}`}
                      value={reps}
                      onChange={setReps}
                      step={1}
                      min={0}
                      suffix="reps"
                      inputMode="numeric"
                    />
                    <RpeSelect value={rpe} onValueChange={setRpe} />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">
                      Est. 1RM{' '}
                      <span className="font-semibold text-foreground">
                        {formatOneRm(estimated1rm)}
                      </span>
                    </span>
                    {best1rm > 0 && (
                      <span className="text-muted-foreground">
                        Best {formatOneRm(best1rm)}
                      </span>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-2xl text-base font-semibold"
                    disabled={saving || weight <= 0 || reps <= 0}
                    style={{ backgroundColor: user.color }}
                  >
                    {saving ? 'Saving…' : `Log set ${nextSetNumber}`}
                  </Button>
                </form>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
