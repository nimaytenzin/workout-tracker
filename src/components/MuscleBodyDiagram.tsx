import { useMemo, useState } from 'react'
import Body, { type ExtendedBodyPart, type Slug } from 'react-muscle-highlighter'
import type { MuscleRecoveryStatus, RecoveryGroupId, UserId } from '@/types'
import { recoveryColor } from '@/utils/recovery'
import {
  RECOVERY_TO_SLUGS,
  SLUG_TO_RECOVERY_GROUP,
} from '@/utils/recoveryBodyMap'
import { cn } from '@/lib/utils'

interface MuscleBodyDiagramProps {
  sex: 'male' | 'female'
  statuses: MuscleRecoveryStatus[]
  className?: string
}

function buildBodyData(statuses: MuscleRecoveryStatus[]): ExtendedBodyPart[] {
  const statusMap = new Map(statuses.map((s) => [s.group, s]))

  return (Object.keys(RECOVERY_TO_SLUGS) as RecoveryGroupId[]).flatMap((group) => {
    const status = statusMap.get(group)?.status ?? 'recovered'
    const color = recoveryColor(status)
    return RECOVERY_TO_SLUGS[group].map((slug) => ({ slug, color }))
  })
}

function BodyView({
  side,
  sex,
  data,
  onSelect,
}: {
  side: 'front' | 'back'
  sex: 'male' | 'female'
  data: ExtendedBodyPart[]
  onSelect: (group: RecoveryGroupId) => void
}) {
  return (
    <div className="flex flex-col items-center">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {side}
      </p>
      <div className="w-full max-w-[168px]">
        <Body
          data={data}
          side={side}
          gender={sex}
          scale={0.82}
          border="#64748b"
          defaultFill="#1e293b"
          defaultStroke="#334155"
          defaultStrokeWidth={0.5}
          hiddenParts={['hair']}
          onBodyPartPress={(part) => {
            const group = part.slug
              ? SLUG_TO_RECOVERY_GROUP[part.slug as Slug]
              : undefined
            if (!group) return
            onSelect(group)
          }}
        />
      </div>
    </div>
  )
}

export function MuscleBodyDiagram({ sex, statuses, className }: MuscleBodyDiagramProps) {
  const [selected, setSelected] = useState<RecoveryGroupId | null>(null)
  const bodyData = useMemo(() => buildBodyData(statuses), [statuses])
  const selectedMeta = selected
    ? statuses.find((s) => s.group === selected)
    : undefined

  const handleSelect = (group: RecoveryGroupId) => {
    setSelected((prev) => (prev === group ? null : group))
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border/50 bg-gradient-to-b from-muted/25 to-muted/10 px-2 py-4 sm:gap-4 sm:px-4">
        <BodyView
          side="front"
          sex={sex}
          data={bodyData}
          onSelect={handleSelect}
        />
        <BodyView
          side="back"
          sex={sex}
          data={bodyData}
          onSelect={handleSelect}
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

export function sexForUser(userId: UserId): 'male' | 'female' {
  return userId === 'partner' ? 'female' : 'male'
}
