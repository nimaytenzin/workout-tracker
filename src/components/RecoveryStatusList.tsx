import type { MuscleRecoveryStatus } from '@/types'
import { RECOVERY_GROUPS } from '@/data/muscleGroups'
import { recoveryColor } from '@/utils/recovery'
import { cn } from '@/lib/utils'

interface RecoveryStatusListProps {
  statuses: MuscleRecoveryStatus[]
  className?: string
}

export function RecoveryStatusList({ statuses, className }: RecoveryStatusListProps) {
  const statusMap = new Map(statuses.map((s) => [s.group, s]))

  return (
    <div
      data-testid="recovery-status-list"
      className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3', className)}
    >
      {(Object.keys(RECOVERY_GROUPS) as MuscleRecoveryStatus['group'][]).map((group) => {
        const meta = statusMap.get(group)
        const status = meta?.status ?? 'recovered'
        const color = recoveryColor(status)

        return (
          <div
            key={group}
            data-testid={`recovery-group-${group}`}
            data-status={status}
            className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/20 px-2.5 py-2"
          >
            <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium">
              <span
                className="size-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="truncate">{RECOVERY_GROUPS[group].label}</span>
            </span>
            <span
              className="shrink-0 text-[10px] font-semibold capitalize text-muted-foreground"
              data-testid={`recovery-group-${group}-label`}
            >
              {status}
            </span>
          </div>
        )
      })}
    </div>
  )
}
