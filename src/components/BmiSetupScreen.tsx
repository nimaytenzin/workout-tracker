import { useState } from 'react'
import { Ruler, Scale, UserRound } from 'lucide-react'
import { USERS, todayDateString } from '@/data/users'
import { workoutRepository } from '@/db/repository'
import { calculateBmi, getBmiCategory, bmiBadgeVariant } from '@/utils/bmi'
import type { UserId } from '@/types'
import { NumberStepper } from '@/components/NumberStepper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface BmiSetupScreenProps {
  onComplete: () => void
}

export function BmiSetupScreen({ onComplete }: BmiSetupScreenProps) {
  const [heights, setHeights] = useState<Record<UserId, number>>({ me: 170, partner: 165 })
  const [weights, setWeights] = useState<Record<UserId, number>>({ me: 0, partner: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    for (const user of USERS) {
      if (heights[user.id] < 100 || heights[user.id] > 250) {
        setError(`${user.name}: enter height between 100–250 cm`)
        return
      }
      if (weights[user.id] <= 0) {
        setError(`${user.name}: enter starting weight`)
        return
      }
    }

    setSaving(true)
    try {
      const today = todayDateString()
      await Promise.all(
        USERS.flatMap((user) => [
          workoutRepository.saveUserProfile(user.id, heights[user.id]),
          workoutRepository.logBodyWeight(user.id, weights[user.id], today),
        ]),
      )
      onComplete()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4" data-testid="bmi-setup">
      <div className="text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Scale className="size-7" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">BMI Setup</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter height and current weight for both of you to start tracking BMI.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {USERS.map((user, i) => {
          const bmi = calculateBmi(weights[user.id], heights[user.id])
          const { label, category } = getBmiCategory(bmi)

          return (
            <div key={user.id}>
              {i > 0 && <Separator className="my-4" />}
              <Card style={{ borderColor: `${user.color}40` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserRound className="size-4" style={{ color: user.color }} />
                    {user.name}
                  </CardTitle>
                  <CardDescription>Height is saved · weight updates daily</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Ruler className="size-3.5" />
                      Height
                    </label>
                    <NumberStepper
                      id={`setup-height-${user.id}`}
                      value={heights[user.id]}
                      onChange={(v) => setHeights((prev) => ({ ...prev, [user.id]: v }))}
                      step={1}
                      min={100}
                      max={250}
                      suffix="cm"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Scale className="size-3.5" />
                      Current weight
                    </label>
        <NumberStepper
          id={`setup-weight-${user.id}`}
          value={weights[user.id]}
          onChange={(v) => setWeights((prev) => ({ ...prev, [user.id]: v }))}
          step={0.5}
          min={0}
          suffix="kg"
          inputMode="decimal"
        />
                  </div>
                  {bmi > 0 && (
                    <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2">
                      <span className="text-sm text-muted-foreground">Starting BMI</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold tabular-nums" style={{ color: user.color }}>
                          {bmi}
                        </span>
                        <Badge variant={bmiBadgeVariant(category)}>{label}</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        })}

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={saving}>
          {saving ? 'Saving…' : 'Start BMI Tracking'}
        </Button>
      </form>
    </div>
  )
}
