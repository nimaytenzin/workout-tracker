import type { MuscleRecoveryStatus, UserId } from '@/types'
import { MuscleBodyDiagram, sexForUser } from '@/components/MuscleBodyDiagram'

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
          {sexLabel} body map · tap a muscle for details · 48h timers after workouts
        </p>
      </div>

      <MuscleBodyDiagram sex={sex} statuses={statuses} />

      <p className="text-center text-[10px] text-muted-foreground">
        Tap highlighted areas to see recovery time
      </p>
    </div>
  )
}
