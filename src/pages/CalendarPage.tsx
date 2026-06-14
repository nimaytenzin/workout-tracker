import { useCallback, useEffect, useState } from 'react'
import { workoutRepository } from '@/db/repository'
import { WorkoutCalendar } from '@/components/WorkoutCalendar'
import { buildCalendarSessions, WORKOUT_LEGEND } from '@/utils/calendar'
import type { CalendarSessionEntry } from '@/utils/calendar'

export function CalendarPage() {
  const [sessions, setSessions] = useState<CalendarSessionEntry[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [allSessions, allSets] = await Promise.all([
      workoutRepository.getAllSessions(),
      workoutRepository.getAllSetLogs(),
    ])
    setSessions(buildCalendarSessions(allSessions, allSets))
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const trainedDays = new Set(sessions.map((s) => s.date)).size

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Workout Calendar</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading
            ? 'Loading history…'
            : trainedDays > 0
              ? `${trainedDays} training days logged`
              : 'Tap a day to see what you trained'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {WORKOUT_LEGEND.map((day) => (
          <span
            key={day.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-[10px] font-medium"
          >
            <span className="size-2 rounded-full" style={{ backgroundColor: day.color }} />
            {day.shortName}
          </span>
        ))}
      </div>

      <WorkoutCalendar sessions={sessions} />
    </div>
  )
}
