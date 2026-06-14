import { useState, useEffect, useCallback } from 'react'
import { Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface RestTimerProps {
  restSeconds: number
  autoStart?: boolean
}

export function RestTimer({ restSeconds, autoStart = false }: RestTimerProps) {
  const [remaining, setRemaining] = useState(restSeconds)
  const [running, setRunning] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setRemaining(restSeconds)
    if (autoStart) {
      setRunning(true)
      setExpanded(true)
    }
  }, [restSeconds, autoStart])

  useEffect(() => {
    if (!running || remaining <= 0) return
    const id = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(id)
  }, [running, remaining])

  useEffect(() => {
    if (remaining === 0 && running) setRunning(false)
  }, [remaining, running])

  const progress = ((restSeconds - remaining) / restSeconds) * 100
  const done = remaining <= 0

  const start = useCallback(() => {
    setRemaining(restSeconds)
    setRunning(true)
    setExpanded(true)
  }, [restSeconds])

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border/50 bg-secondary/20 transition-all',
        expanded && 'shadow-sm',
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-3 px-3 py-2.5 touch-manipulation"
      >
        <Timer className="size-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1 text-left">
          <p className="text-xs font-medium">Rest</p>
          <p className="text-[10px] text-muted-foreground">{restSeconds}s recommended</p>
        </div>
        <span
          className={cn(
            'font-mono text-lg font-bold tabular-nums',
            done ? 'text-emerald-400' : 'text-foreground',
          )}
        >
          {done ? 'Go!' : formatTime(remaining)}
        </span>
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-border/30 px-3 pb-3 pt-2">
          <Progress
            value={progress}
            className="h-1.5"
            indicatorClassName={done ? 'bg-emerald-500' : undefined}
          />
          <div className="flex justify-end gap-2">
            {!running && (
              <Button type="button" size="sm" className="h-9 rounded-xl" onClick={start}>
                {done ? (
                  <>
                    <RotateCcw className="size-3.5" />
                    Restart
                  </>
                ) : (
                  <>
                    <Play className="size-3.5" />
                    Start
                  </>
                )}
              </Button>
            )}
            {running && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-9 rounded-xl"
                onClick={() => setRunning(false)}
              >
                <Pause className="size-3.5" />
                Pause
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
