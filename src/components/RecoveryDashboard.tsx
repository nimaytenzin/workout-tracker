import type { MuscleRecoveryStatus, UserId } from '@/types'
import { MuscleBodyDiagram, sexForUser } from '@/components/MuscleBodyDiagram'
import { RECOVERY_TO_SLUGS } from '@/utils/recoveryBodyMap'

interface RecoveryDashboardProps {
  statuses: MuscleRecoveryStatus[]
  userId: UserId
}

export function RecoveryDashboard({ statuses, userId }: RecoveryDashboardProps) {
  const sex = sexForUser(userId)
  const sexLabel = sex === 'male' ? 'Male' : 'Female'

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold">Muscle Recovery</h3>
        <p className="text-sm text-muted-foreground">
          {sexLabel} anatomy · tap a muscle · {Object.keys(RECOVERY_TO_SLUGS).length} muscle groups tracked
        </p>
      </div>

      <MuscleBodyDiagram sex={sex} statuses={statuses} />

      <p className="text-center text-[10px] text-muted-foreground">
        Tap highlighted areas to see recovery time
      </p>
    </div>
  )
}
