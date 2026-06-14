import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, CircleDashed } from 'lucide-react'
import type { CalendarSessionEntry } from '@/utils/calendar'
import {
  formatCalendarDayLabel,
  formatMonthYear,
  getMonthGrid,
  groupSessionsByDate,
} from '@/utils/calendar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface WorkoutCalendarProps {
  sessions: CalendarSessionEntry[]
}

export function WorkoutCalendar({ sessions }: WorkoutCalendarProps) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(localToday())

  const byDate = useMemo(() => groupSessionsByDate(sessions), [sessions])
  const monthGrid = useMemo(
    () => getMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  )
  const selectedSessions = selectedDate ? (byDate.get(selectedDate) ?? []) : []

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  function goToToday() {
    const today = new Date()
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDate(localToday())
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 rounded-xl"
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="min-w-0 flex-1 text-center">
          <p className="text-sm font-semibold">{formatMonthYear(viewYear, viewMonth)}</p>
          <button
            type="button"
            onClick={goToToday}
            className="text-[10px] font-medium text-primary touch-manipulation"
          >
            Today
          </button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 rounded-xl"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-3">
        <div className="mb-2 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {monthGrid.map((cell) => {
            const daySessions = byDate.get(cell.date) ?? []
            const selected = selectedDate === cell.date
            const hasWorkout = daySessions.length > 0

            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => setSelectedDate(cell.date)}
                className={cn(
                  'relative flex min-h-11 flex-col items-center justify-start rounded-xl p-1 transition-colors touch-manipulation',
                  cell.inMonth ? 'text-foreground' : 'text-muted-foreground/40',
                  selected && 'bg-primary/15 ring-2 ring-primary/40',
                  !selected && hasWorkout && 'bg-muted/40',
                  !selected && !hasWorkout && 'hover:bg-muted/30',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                    cell.isToday && 'bg-primary text-primary-foreground',
                  )}
                >
                  {cell.day}
                </span>

                {hasWorkout && (
                  <div className="mt-0.5 flex max-w-full flex-wrap justify-center gap-0.5">
                    {daySessions.slice(0, 3).map((session) => (
                      <span
                        key={session.sessionId}
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: session.color }}
                      />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{formatCalendarDayLabel(selectedDate)}</h3>

          {selectedSessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/50 px-4 py-6 text-center text-sm text-muted-foreground">
              No workouts logged this day
            </div>
          ) : (
            selectedSessions.map((session) => (
              <SessionCard key={session.sessionId} session={session} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function SessionCard({ session }: { session: CalendarSessionEntry }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/50 bg-card"
      style={{ borderLeftWidth: 4, borderLeftColor: session.color }}
    >
      <div className="flex items-start justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0">
          <p className="font-semibold">{session.dayName}</p>
          <p className="text-xs text-muted-foreground">{session.focus}</p>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
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
          {session.completed ? 'Done' : 'In progress'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/30 px-3 py-2 text-xs">
        <span className="text-muted-foreground">{session.setCount} sets</span>
        {session.users.map((user) => (
          <span
            key={user.userId}
            className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 font-medium"
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: user.color }} />
            {user.name} · {user.sets}
          </span>
        ))}
      </div>
    </div>
  )
}

function localToday(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
