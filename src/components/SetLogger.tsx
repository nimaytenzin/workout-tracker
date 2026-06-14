import { useEffect, useState } from 'react'
import { Check, Copy, ChevronRight, Plus, TrendingUp } from 'lucide-react'
import type { Exercise, SetLog, UserId } from '@/types'
import { getUser } from '@/data/users'
import { workoutRepository } from '@/db/repository'
import { calculateOneRm, formatOneRm } from '@/utils/oneRm'
import { NumberStepper } from '@/components/NumberStepper'
import { RpeSelect } from '@/components/RpeSelect'
import { Button } from '@/components/ui/button'
import { formatRpeLabel } from '@/utils/rpe'

interface SetLoggerProps {
  exercise: Exercise
  sessionId: number
  userId: UserId
  existingSets: SetLog[]
  onLogSet: (set: Omit<SetLog, 'id' | 'loggedAt'>) => Promise<void>
  onSetLogged?: () => void
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

    const ref =
      lastHistorical.find((s) => s.setNumber === activeSetNumber) ?? lastHistorical.at(-1)
    if (ref) {
      setWeight(ref.weight)
      setReps(ref.reps)
      setRpe(String(ref.rpe))
    }
  }, [activeSetNumber, sessionLastSet, lastHistorical])

  function applyLastSet(bumpKg = 0) {
    const ref = lastSetForActive
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-muted/20 px-3 py-2">
        <span className="text-sm font-semibold">Set {activeSetNumber}</span>
        {existingSets.length > 0 && (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
            {existingSets.length} logged
          </span>
        )}
      </div>

      {existingSets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {existingSets.map((set) => (
            <span
              key={set.id ?? set.setNumber}
              className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/60 px-2.5 py-1 text-xs tabular-nums"
            >
              <Check className="size-3 text-emerald-500" strokeWidth={3} />
              {set.setNumber}: {set.weight}×{set.reps}
            </span>
          ))}
        </div>
      )}

      <div
        className="overflow-hidden rounded-2xl border-2 shadow-sm"
        style={{ borderColor: user.color, backgroundColor: `${user.color}0c` }}
      >
        {lastSetForActive && (
          <div className="flex items-center gap-2 border-b border-border/30 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            <TrendingUp className="size-3 shrink-0 opacity-60" />
            <span className="shrink-0 font-medium uppercase tracking-wide opacity-70">
              Last
            </span>
            <span className="tabular-nums">
              {lastSetForActive.weight} kg × {lastSetForActive.reps}
            </span>
            <span className="truncate">· {formatRpeLabel(lastSetForActive.rpe)}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 p-3">
          {lastSetForActive && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 flex-1 gap-1.5 rounded-xl text-xs"
                onClick={() => applyLastSet(0)}
              >
                <Copy className="size-3.5" />
                Match last
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 flex-1 gap-1.5 rounded-xl text-xs"
                onClick={() => applyLastSet(2.5)}
              >
                <Plus className="size-3.5" />
                +2.5 kg
              </Button>
            </div>
          )}

          <NumberStepper
            id={`weight-${inputId}`}
            label="Weight"
            value={weight}
            onChange={setWeight}
            step={2.5}
            min={0}
            suffix="kg"
            inputMode="decimal"
          />

          <NumberStepper
            id={`reps-${inputId}`}
            label="Reps"
            value={reps}
            onChange={setReps}
            step={1}
            min={0}
            inputMode="numeric"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              RPE
            </label>
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
              <span className="text-muted-foreground">Best {formatOneRm(best1rm)}</span>
            )}
          </div>

          <Button
            type="submit"
            className="h-12 w-full gap-2 rounded-2xl text-base font-semibold"
            disabled={saving || weight <= 0 || reps <= 0}
            style={{ backgroundColor: user.color }}
          >
            {saving ? (
              'Saving…'
            ) : (
              <>
                {activeSetNumber === 1 ? 'Log set' : 'Next set'}
                <ChevronRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
