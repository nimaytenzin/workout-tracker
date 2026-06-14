import { useEffect, useState, useCallback } from 'react'
import { Activity, BarChart3 } from 'lucide-react'
import { USERS, getUser } from '@/data/users'
import { RecoveryDashboard } from '@/components/RecoveryDashboard'
import { VolumeDashboard } from '@/components/VolumeDashboard'
import { workoutRepository } from '@/db/repository'
import { computeRecoveryStatuses } from '@/utils/recovery'
import { computeWeeklyVolume, getWeekStart } from '@/utils/volume'
import type { MuscleRecoveryStatus, UserId, WeeklyVolumeEntry } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Tab = 'recovery' | 'volume'

export function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('recovery')
  const [activeUser, setActiveUser] = useState<UserId>('me')
  const [recovery, setRecovery] = useState<MuscleRecoveryStatus[]>([])
  const [volume, setVolume] = useState<WeeklyVolumeEntry[]>([])
  const [weekStart] = useState(() => getWeekStart())

  const refresh = useCallback(async () => {
    const [states, setLogs] = await Promise.all([
      workoutRepository.getAllRecoveryStates(activeUser),
      workoutRepository.getAllSetLogs(activeUser),
    ])
    setRecovery(computeRecoveryStatuses(states))
    setVolume(computeWeeklyVolume(setLogs, weekStart))
  }, [weekStart, activeUser])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 30_000)
    return () => clearInterval(interval)
  }, [refresh])

  const weekLabel = `${weekStart.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })} – ${new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`

  const user = getUser(activeUser)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Stats</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Per-person recovery and weekly volume
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary/50 p-1">
        {USERS.map((u) => (
          <Button
            key={u.id}
            type="button"
            variant="ghost"
            className={cn(
              'h-10 rounded-lg gap-2',
              activeUser === u.id && 'bg-background shadow-sm',
            )}
            onClick={() => setActiveUser(u.id)}
          >
            <span className="size-2 rounded-full" style={{ backgroundColor: u.color }} />
            {u.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary/50 p-1">
        <Button
          type="button"
          variant="ghost"
          className={cn('h-10 rounded-lg', tab === 'recovery' && 'bg-background shadow-sm')}
          onClick={() => setTab('recovery')}
        >
          <Activity className="size-4" />
          Recovery
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={cn('h-10 rounded-lg', tab === 'volume' && 'bg-background shadow-sm')}
          onClick={() => setTab('volume')}
        >
          <BarChart3 className="size-4" />
          Volume
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing stats for{' '}
        <span className="font-medium" style={{ color: user.color }}>
          {user.name}
        </span>
      </p>

      {tab === 'recovery' ? (
        <RecoveryDashboard statuses={recovery} />
      ) : (
        <VolumeDashboard entries={volume} weekLabel={weekLabel} />
      )}
    </div>
  )
}
