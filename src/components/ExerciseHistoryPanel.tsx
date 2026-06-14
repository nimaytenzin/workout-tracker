import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, History } from 'lucide-react'
import type { ExerciseSessionHistory } from '@/types'
import { workoutRepository } from '@/db/repository'
import type { UserId } from '@/types'
import { formatRpeLabel } from '@/utils/rpe'
import { cn } from '@/lib/utils'

interface ExerciseHistoryPanelProps {
  exerciseId: string
  userId: UserId
  sessionId: number
  activeSetNumber: number
  userColor: string
}

export function ExerciseHistoryPanel({
  exerciseId,
  userId,
  sessionId,
  activeSetNumber,
  userColor,
}: ExerciseHistoryPanelProps) {
  const [history, setHistory] = useState<ExerciseSessionHistory[]>([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    workoutRepository
      .getExerciseSessionHistory(exerciseId, userId, sessionId, 4)
      .then(setHistory)
  }, [exerciseId, userId, sessionId])

  if (history.length === 0) return null

  const lastSession = history[0]
  const targetSet = lastSession.sets.find((s) => s.setNumber === activeSetNumber) ?? lastSession.sets.at(-1)

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-muted/20">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="flex w-full items-center gap-2 px-3 py-3 text-left touch-manipulation select-none active:bg-muted/30"
      >
        <History className="size-4 shrink-0" style={{ color: userColor }} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold">Last session · {lastSession.label}</p>
          {targetSet && (
            <p className="truncate text-sm tabular-nums text-muted-foreground">
              Set {targetSet.setNumber}: {targetSet.weight} kg × {targetSet.reps} ·{' '}
              {formatRpeLabel(targetSet.rpe)}
            </p>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-border/30 px-3 py-2">
          {history.map((session) => (
            <div key={session.sessionId} className="rounded-xl bg-background/60 px-2.5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {session.label}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {session.sets.map((set) => (
                  <span
                    key={set.id ?? `${session.sessionId}-${set.setNumber}`}
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs tabular-nums',
                      set.setNumber === activeSetNumber && 'ring-1 ring-primary/40',
                    )}
                    style={
                      set.setNumber === activeSetNumber
                        ? { backgroundColor: `${userColor}18`, color: userColor }
                        : undefined
                    }
                  >
                    {set.setNumber}: {set.weight}×{set.reps}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
