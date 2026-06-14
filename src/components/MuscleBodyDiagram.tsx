import { useMemo, useState } from 'react'
import type { MuscleRecoveryStatus, RecoveryGroupId, UserId } from '@/types'
import { RECOVERY_GROUPS } from '@/data/muscleGroups'
import {
  BODY_REGIONS,
  BODY_SILHOUETTE,
  type BodySex,
  type BodyView,
} from '@/data/bodyDiagramPaths'
import { recoveryColor } from '@/utils/recovery'
import { cn } from '@/lib/utils'

interface MuscleBodyDiagramProps {
  sex: BodySex
  statuses: MuscleRecoveryStatus[]
  className?: string
}

function statusMap(statuses: MuscleRecoveryStatus[]) {
  return new Map(statuses.map((s) => [s.group, s]))
}

function regionFill(
  group: RecoveryGroupId,
  map: Map<RecoveryGroupId, MuscleRecoveryStatus>,
): { fill: string; opacity: number } {
  const status = map.get(group)?.status ?? 'recovered'
  const fill = recoveryColor(status)
  const opacity = status === 'fatigued' ? 1 : status === 'recovering' ? 0.88 : 0.62
  return { fill, opacity }
}

function BodyFigure({
  sex,
  view,
  statuses,
  selected,
  onSelect,
}: {
  sex: BodySex
  view: BodyView
  statuses: MuscleRecoveryStatus[]
  selected: RecoveryGroupId | null
  onSelect: (group: RecoveryGroupId | null) => void
}) {
  const map = useMemo(() => statusMap(statuses), [statuses])
  const regions = BODY_REGIONS[sex][view]
  const silhouette = BODY_SILHOUETTE[sex][view]

  return (
    <div className="flex flex-col items-center">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {view}
      </p>
      <svg
        viewBox="0 0 100 200"
        className="h-auto w-full max-w-[140px]"
        role="img"
        aria-label={`${sex} body ${view} view muscle recovery`}
      >
        <path
          d={silhouette}
          fill="currentColor"
          className="text-muted/25"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
        {regions.map((region) => {
          const { fill, opacity } = regionFill(region.group, map)
          const active = selected === region.group
          const meta = map.get(region.group)
          const label = RECOVERY_GROUPS[region.group].label

          return (
            <path
              key={`${view}-${region.group}`}
              d={region.d}
              fill={fill}
              fillOpacity={opacity}
              stroke={active ? fill : 'rgba(255,255,255,0.35)'}
              strokeWidth={active ? 1.2 : 0.4}
              className="cursor-pointer touch-manipulation transition-opacity"
              onClick={() => onSelect(active ? null : region.group)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(active ? null : region.group)
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`${label}: ${meta?.status ?? 'recovered'}`}
            />
          )
        })}
      </svg>
    </div>
  )
}

export function MuscleBodyDiagram({ sex, statuses, className }: MuscleBodyDiagramProps) {
  const [selected, setSelected] = useState<RecoveryGroupId | null>(null)
  const map = useMemo(() => statusMap(statuses), [statuses])
  const selectedMeta = selected ? map.get(selected) : undefined

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/50 bg-muted/15 px-4 py-5">
        <BodyFigure
          sex={sex}
          view="front"
          statuses={statuses}
          selected={selected}
          onSelect={setSelected}
        />
        <BodyFigure
          sex={sex}
          view="back"
          statuses={statuses}
          selected={selected}
          onSelect={setSelected}
        />
      </div>

      {selected && selectedMeta && (
        <div
          className="rounded-xl border px-3 py-2.5 text-sm"
          style={{ borderColor: `${recoveryColor(selectedMeta.status)}55` }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">{selectedMeta.label}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize text-white"
              style={{ backgroundColor: recoveryColor(selectedMeta.status) }}
            >
              {selectedMeta.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {selectedMeta.status === 'recovered'
              ? 'Ready to train'
              : `${selectedMeta.hoursRemaining.toFixed(1)}h until fully recovered`}
          </p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-[#ef4444]" />
          Sore / fatigued
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-[#f59e0b]" />
          Recovering
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-[#22c55e]" />
          Recovered
        </span>
      </div>
    </div>
  )
}

export function sexForUser(userId: UserId): BodySex {
  return userId === 'partner' ? 'female' : 'male'
}
