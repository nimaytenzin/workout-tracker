import type { WeeklyVolumeEntry } from '@/types'
import { getMaxVolume } from '@/utils/volume'
import { RECOVERY_GROUPS } from '@/data/muscleGroups'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface VolumeDashboardProps {
  entries: WeeklyVolumeEntry[]
  weekLabel: string
}

export function VolumeDashboard({ entries, weekLabel }: VolumeDashboardProps) {
  const maxSets = getMaxVolume(entries)
  const totalSets = entries.reduce((sum, e) => sum + e.sets, 0)
  const hasVolume = entries.some((e) => e.sets > 0)
  const sorted = entries.filter((e) => e.sets > 0).sort((a, b) => b.sets - a.sets)

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold">Weekly Volume</h3>
        <p className="text-sm text-muted-foreground">
          Working sets per muscle group · {weekLabel}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-3xl font-bold tabular-nums">
            {totalSets}
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
              total sets
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sorted.map((entry) => {
            const pct = (entry.sets / maxSets) * 100
            const color = RECOVERY_GROUPS[entry.recoveryGroup].color

            return (
              <div key={entry.recoveryGroup} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span>{entry.label}</span>
                  <span className="font-medium tabular-nums">{entry.sets} sets</span>
                </div>
                <Progress
                  value={pct}
                  indicatorStyle={{ backgroundColor: color }}
                />
              </div>
            )
          })}

          {!hasVolume && (
            <CardDescription className="py-6 text-center">
              No sets logged this week yet. Start a workout to track volume.
            </CardDescription>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
