import { useEffect, useState } from 'react'
import { Check, Copy, ChevronRight, Plus, RotateCcw } from 'lucide-react'
import type { Exercise, SetLog, UserId } from '@/types'
import { getUser } from '@/data/users'
import { workoutRepository } from '@/db/repository'
import { calculateOneRm, formatOneRm } from '@/utils/oneRm'
import { NumberStepper } from '@/components/NumberStepper'
import { QuickRpePicker } from '@/components/QuickRpePicker'
import { ExerciseHistoryPanel } from '@/components/ExerciseHistoryPanel'
import { Button } from '@/components/ui/button'
import { formatRpeLabel } from '@/utils/rpe'
import { cn } from '@/lib/utils'

interface SetLoggerProps {
  exercise: Exercise
  sessionId: number
  userId: UserId
  existingSets: SetLog[]
  onLogSet: (set: Omit<SetLog, 'id' | 'loggedAt'>) => Promise<void>
  onDeleteSet?: (setId: number) => Promise<void>
  onSetLogged?: () => void
}

function weightDelta(today: number, last?: number): string | null {
  if (last === undefined || today === last) return null
  const delta = Math.round((today - last) * 4) / 4
  return `${delta > 0 ? '+' : ''}${delta} kg`
}

export function SetLogger({
  exercise,
  sessionId,
  userId,
  existingSets,
  onLogSet,
  onDeleteSet,
  onSetLogged,
}: SetLoggerProps) {
  const user = getUser(userId)
  const activeSetNumber = existingSets.length + 1
  const sessionLastSet = existingSets.at(-1)

  const [weight, setWeight] = useState(sessionLastSet?.weight ?? 0)
  const [reps, setReps] = useState(sessionLastSet?.reps ?? 0)
  const [rpe, setRpe] = useState(String(sessionLastSet?.rpe ?? 8))
  const [saving, setSaving] = useState(false)
  const [lastHistorical, setLastHistorical] = useState<SetLog[]>([])

  const lastSetForActive =
    lastHistorical.find((s) => s.setNumber === activeSetNumber) ?? lastHistorical.at(-1)
  const inputId = `${exercise.id}-${userId}-${activeSetNumber}`
  const estimated1rm = calculateOneRm(weight, reps)
  const canLog = weight > 0 && reps > 0 && !saving
  const deltaLabel = weightDelta(weight, lastSetForActive?.weight)

  useEffect(() => {
    workoutRepository
      .getPreviousSessionSetsForExercise(exercise.id, userId, sessionId)
      .then(setLastHistorical)
  }, [exercise.id, userId, sessionId, existingSets.length])

  useEffect(() => {
    const historicalMatch = lastHistorical.find((s) => s.setNumber === activeSetNumber)
    const ref =
      historicalMatch ?? sessionLastSet ?? lastHistorical.at(-1)
    if (!ref) return

    setWeight(ref.weight)
    setReps(ref.reps)
    setRpe(String(ref.rpe))
  }, [activeSetNumber, sessionLastSet, lastHistorical])

  function applyLastSet(bumpKg = 0) {
    const ref = lastSetForActive
    if (!ref) return
    setWeight(Math.round((ref.weight + bumpKg) * 4) / 4)
    setReps(ref.reps)
    setRpe(String(ref.rpe))
  }

  async function submitSet() {
    if (!canLog) return

    setSaving(true)
    try {
      await onLogSet({
        sessionId,
        userId,
        exerciseId: exercise.id,
        setNumber: activeSetNumber,
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await submitSet()
  }

  return (
    <div className="space-y-3">
      <ExerciseHistoryPanel
        exerciseId={exercise.id}
        userId={userId}
        sessionId={sessionId}
        activeSetNumber={activeSetNumber}
        userColor={user.color}
      />

      {existingSets.length > 0 && (
        <div className="rounded-2xl border border-border/40 bg-background/40 px-3 py-2">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Today
          </p>
          <div className="space-y-1">
            {existingSets.map((set) => {
              const lastRef = lastHistorical.find((s) => s.setNumber === set.setNumber)
              const delta = weightDelta(set.weight, lastRef?.weight)
              return (
                <div
                  key={set.id ?? set.setNumber}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <Check className="size-3.5 text-emerald-500" strokeWidth={3} />
                    <span className="font-medium">Set {set.setNumber}</span>
                    <span>
                      {set.weight}×{set.reps} @{set.rpe}
                    </span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {delta && (
                      <span
                        className={cn(
                          'text-[10px] font-semibold tabular-nums',
                          delta.startsWith('+') ? 'text-emerald-500' : 'text-amber-500',
                        )}
                      >
                        {delta}
                      </span>
                    )}
                    {onDeleteSet && set.id && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg text-muted-foreground"
                        onClick={() => onDeleteSet(set.id!)}
                        aria-label={`Undo set ${set.setNumber}`}
                      >
                        <RotateCcw className="size-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div
        className="overflow-hidden rounded-2xl border-2 shadow-sm"
        style={{ borderColor: user.color, backgroundColor: `${user.color}0c` }}
      >
        <div className="flex items-center justify-between border-b border-border/30 px-3 py-2">
          <span className="text-sm font-bold">Set {activeSetNumber}</span>
          {deltaLabel && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 tabular-nums">
              {deltaLabel} vs last
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 p-3">
          {lastSetForActive && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-11 flex-1 gap-1.5 rounded-xl text-xs font-semibold"
                onClick={() => applyLastSet(0)}
              >
                <Copy className="size-3.5" />
                Use last ({lastSetForActive.weight}×{lastSetForActive.reps})
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-11 shrink-0 gap-1 rounded-xl px-3 text-xs font-semibold"
                onClick={() => applyLastSet(2.5)}
              >
                <Plus className="size-3.5" />
                +2.5
              </Button>
            </div>
          )}

          <NumberStepper
            id={`weight-${inputId}`}
            label="Weight (kg)"
            value={weight}
            onChange={setWeight}
            step={2.5}
            min={0}
            inputMode="decimal"
            hideHint
          />

          <NumberStepper
            id={`reps-${inputId}`}
            label="Reps"
            value={reps}
            onChange={setReps}
            step={1}
            min={0}
            inputMode="numeric"
            hideHint
          />

          <div className="space-y-1.5">
            <label className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              RPE · {formatRpeLabel(parseInt(rpe, 10))}
            </label>
            <QuickRpePicker value={rpe} onValueChange={setRpe} />
          </div>

          <p className="text-center text-[10px] text-muted-foreground">
            Est. 1RM <span className="font-semibold text-foreground">{formatOneRm(estimated1rm)}</span>
          </p>

          <Button
            type="submit"
            className="h-[3.25rem] w-full gap-2 rounded-2xl text-base font-bold shadow-md active:scale-[0.98]"
            disabled={!canLog}
            style={{ backgroundColor: user.color }}
          >
            {saving ? (
              'Saving…'
            ) : (
              <>
                {activeSetNumber === 1 ? 'Log set' : 'Next set'}
                <ChevronRight className="size-5" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
