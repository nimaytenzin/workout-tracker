import type { MuscleRecoveryStatus } from '@/types'
import { recoveryColor } from '@/utils/recovery'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface RecoveryDashboardProps {
  statuses: MuscleRecoveryStatus[]
}

function statusVariant(
  status: MuscleRecoveryStatus['status'],
): 'success' | 'warning' | 'destructive' {
  if (status === 'recovered') return 'success'
  if (status === 'fatigued') return 'destructive'
  return 'warning'
}

export function RecoveryDashboard({ statuses }: RecoveryDashboardProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold">Muscle Recovery</h3>
        <p className="text-sm text-muted-foreground">
          48h timers after completing a workout day
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {statuses.map((s) => {
          const color = recoveryColor(s.status)

          return (
            <Card
              key={s.group}
              className="py-3"
              style={{
                borderColor: s.status !== 'recovered' ? `${color}40` : undefined,
              }}
            >
              <CardHeader className="space-y-0 p-3 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm">{s.label}</CardTitle>
                  <Badge variant={statusVariant(s.status)} className="capitalize">
                    {s.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 px-3 pt-0">
                <Progress
                  value={s.progress * 100}
                  indicatorStyle={{ backgroundColor: color }}
                />
                <CardDescription className="text-xs">
                  {s.status !== 'recovered'
                    ? `${s.hoursRemaining.toFixed(1)}h remaining`
                    : 'Ready to train'}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive" />
          Fatigued
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-amber-400" />
          Recovering
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-emerald-400" />
          Recovered
        </span>
      </div>
    </div>
  )
}
