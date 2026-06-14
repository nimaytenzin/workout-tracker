import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Minus, Plus, SkipForward, TrendingUp } from 'lucide-react'
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

const MAX_SETS = 12

function initialSetCount(defaultSets: number, loggedCount: number): number {
  return Math.max(defaultSets, loggedCount + 1)
}

function nextActiveSetNumber(
  setCount: number,
  loggedNumbers: Set<number>,
  skippedNumbers: Set<number>,
): number | null {
  for (let n = 1; n <= setCount; n++) {
    if (!loggedNumbers.has(n) && !skippedNumbers.has(n)) return n
  }
  return null
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
  const loggedNumbers = useMemo(
    () => new Set(existingSets.map((s) => s.setNumber)),
    [existingSets],
  )

  const [setCount, setSetCount] = useState(() =>
    initialSetCount(exercise.defaultSets, existingSets.length),
  )
  const [skippedSets, setSkippedSets] = useState<Set<number>>(new Set())
  const [weight, setWeight] = useState(0)
  const [reps, setReps] = useState(0)
  const [rpe, setRpe] = useState('8')
  const [saving, setSaving] = useState(false)
  const [lastHistorical, setLastHistorical] = useState<SetLog[]>([])

  const activeSetNumber = nextActiveSetNumber(setCount, loggedNumbers, skippedSets)
  const lastSetForActive =
    lastHistorical.find((s) => s.setNumber === activeSetNumber) ?? lastHistorical.at(-1)
  const sessionLastSet = existingSets.at(-1)
  const inputId = `${exercise.id}-${userId}-${activeSetNumber ?? 0}`
  const estimated1rm = calculateOneRm(weight, reps)
  const best1rm = existingSets.reduce((max, s) => Math.max(max, s.estimated1rm), 0)
  const allSetsHandled = activeSetNumber === null

  useEffect(() => {
    workoutRepository
      .getPreviousSessionSetsForExercise(exercise.id, userId, sessionId)
      .then(setLastHistorical)
  }, [exercise.id, userId, sessionId])

  useEffect(() => {
    setSetCount((prev) =>
      Math.max(prev, initialSetCount(exercise.defaultSets, existingSets.length)),
    )
    setSkippedSets((prev) => {
      const next = new Set(prev)
      for (const n of prev) {
        if (loggedNumbers.has(n)) next.delete(n)
      }
      return next
    })
  }, [exercise.defaultSets, existingSets.length, loggedNumbers])

  useEffect(() => {
    if (activeSetNumber === null) return

    if (sessionLastSet && activeSetNumber === existingSets.length + 1) {
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
  }, [activeSetNumber, sessionLastSet, lastHistorical, existingSets.length])

  function applyLastSet(bumpKg = 0) {
    const ref = lastSetForActive
    if (!ref) return
    setWeight(Math.round((ref.weight + bumpKg) * 4) / 4)
    setReps(ref.reps)
    setRpe(String(ref.rpe))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (activeSetNumber === null || weight <= 0 || reps <= 0) return

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

  function handleSkip() {
    if (activeSetNumber === null) return
    setSkippedSets((prev) => new Set(prev).add(activeSetNumber))
  }

  function addSet() {
    setSetCount((prev) => Math.min(prev + 1, MAX_SETS))
  }

  function removeEmptySet() {
    if (activeSetNumber === null) {
      setSetCount((prev) => Math.max(prev - 1, existingSets.length, 1))
      return
    }
    setSetCount((prev) => Math.max(prev - 1, activeSetNumber, existingSets.length, 1))
  }

  const canAddSet = setCount < MAX_SETS
  const canRemoveSet = setCount > Math.max(1, existingSets.length)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-muted/20 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {allSetsHandled ? 'Sets complete' : `Set ${activeSetNumber} of ${setCount}`}
          </span>
          {existingSets.length > 0 && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
              {existingSets.length} logged
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-lg"
            disabled={!canRemoveSet}
            onClick={removeEmptySet}
            aria-label="Remove set"
          >
            <Minus className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-lg"
            disabled={!canAddSet}
            onClick={addSet}
            aria-label="Add set"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
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
          {[...skippedSets]
            .filter((n) => !loggedNumbers.has(n))
            .sort((a, b) => a - b)
            .map((n) => (
              <span
                key={`skip-${n}`}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-border/50 px-2.5 py-1 text-xs text-muted-foreground"
              >
                {n}: skipped
              </span>
            ))}
        </div>
      )}

      {allSetsHandled ? (
        <div className="rounded-2xl border border-border/40 bg-muted/20 px-4 py-6 text-center">
          <p className="text-sm font-medium">All sets done for this exercise</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add another set or move to the next exercise
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 rounded-xl"
            disabled={!canAddSet}
            onClick={addSet}
          >
            <Plus className="size-4" />
            Add set
          </Button>
        </div>
      ) : (
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

            <div className="grid grid-cols-3 gap-1.5">
              <NumberStepper
                id={`weight-${inputId}`}
                label="kg"
                value={weight}
                onChange={setWeight}
                step={2.5}
                min={0}
                inputMode="decimal"
                compact
              />
              <NumberStepper
                id={`reps-${inputId}`}
                label="reps"
                value={reps}
                onChange={setReps}
                step={1}
                min={0}
                inputMode="numeric"
                compact
              />
              <RpeSelect value={rpe} onValueChange={setRpe} compact />
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

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="submit"
                className="h-11 rounded-2xl text-sm font-semibold"
                disabled={saving || weight <= 0 || reps <= 0}
                style={{ backgroundColor: user.color }}
              >
                {saving ? 'Saving…' : `Log set ${activeSetNumber}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 gap-1.5 rounded-2xl text-sm font-semibold"
                onClick={handleSkip}
              >
                <SkipForward className="size-4" />
                Skip
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
