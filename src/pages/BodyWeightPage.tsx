import { useEffect, useState, useCallback } from 'react'
import { Pencil, Scale, TrendingDown, TrendingUp } from 'lucide-react'
import { USERS, todayDateString } from '@/data/users'
import { workoutRepository } from '@/db/repository'
import { buildBmiChartData, buildWeightChartData, weightDelta } from '@/utils/bodyWeight'
import {
  bmiBadgeVariant,
  calculateBmi,
  getBmiCategory,
} from '@/utils/bmi'
import type { BmiChartPoint, UserId, WeightChartPoint } from '@/types'
import { BmiSetupScreen } from '@/components/BmiSetupScreen'
import { BmiChart } from '@/components/BmiChart'
import { WeightChart } from '@/components/WeightChart'
import { NumberStepper } from '@/components/NumberStepper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Range = 30 | 90

export function BodyWeightPage() {
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null)
  const [heights, setHeights] = useState<Partial<Record<UserId, number>>>({})
  const [weights, setWeights] = useState<Record<UserId, number>>({ me: 0, partner: 0 })
  const [weightChart, setWeightChart] = useState<WeightChartPoint[]>([])
  const [bmiChart, setBmiChart] = useState<BmiChartPoint[]>([])
  const [range, setRange] = useState<Range>(90)
  const [saving, setSaving] = useState(false)
  const [deltas, setDeltas] = useState<Partial<Record<UserId, number>>>({})
  const [editingHeights, setEditingHeights] = useState(false)
  const [editHeights, setEditHeights] = useState<Record<UserId, number>>({ me: 0, partner: 0 })

  const today = todayDateString()

  const refresh = useCallback(async () => {
    const complete = await workoutRepository.isBmiSetupComplete()
    setSetupComplete(complete)

    if (!complete) return

    const [todayWeights, allLogs, profileHeights] = await Promise.all([
      workoutRepository.getTodayBodyWeights(),
      workoutRepository.getAllBodyWeights(range),
      workoutRepository.getAllUserProfiles(),
    ])

    setHeights(profileHeights)
    setEditHeights({
      me: profileHeights.me ?? 0,
      partner: profileHeights.partner ?? 0,
    })
    setWeights({
      me: todayWeights.me ?? 0,
      partner: todayWeights.partner ?? 0,
    })
    setWeightChart(buildWeightChartData(allLogs, range))
    setBmiChart(buildBmiChartData(allLogs, profileHeights, range))

    const nextDeltas: Partial<Record<UserId, number>> = {}
    for (const user of USERS) {
      const userLogs = allLogs.filter((l) => l.userId === user.id)
      const delta = weightDelta(userLogs)
      if (delta !== null) nextDeltas[user.id] = delta
    }
    setDeltas(nextDeltas)
  }, [range])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleSave() {
    setSaving(true)
    try {
      await Promise.all(
        USERS.map((user) => {
          const w = weights[user.id]
          if (w > 0) return workoutRepository.logBodyWeight(user.id, w, today)
        }),
      )
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveHeights() {
    setSaving(true)
    try {
      await Promise.all(
        USERS.map((user) => {
          const h = editHeights[user.id]
          if (h >= 100) return workoutRepository.saveUserProfile(user.id, h)
        }),
      )
      setEditingHeights(false)
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  if (setupComplete === null) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (!setupComplete) {
    return <BmiSetupScreen onComplete={() => refresh()} />
  }

  const canSave = weights.me > 0 || weights.partner > 0

  return (
    <div className="space-y-4" data-testid="bmi-tracker">
      <div>
        <h2 className="text-xl font-bold tracking-tight">BMI Tracker</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Daily weight & BMI · {today}
        </p>
      </div>

      <div className="space-y-3">
        {USERS.map((user) => {
          const delta = deltas[user.id]
          const heightCm = heights[user.id] ?? 0
          const w = weights[user.id]
          const bmi = w > 0 && heightCm > 0 ? calculateBmi(w, heightCm) : 0
          const { label, category } = getBmiCategory(bmi)

          return (
            <Card
              key={user.id}
              className="overflow-hidden"
              style={{ borderColor: `${user.color}30` }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: user.color }}
                    />
                    {user.name}
                  </CardTitle>
                  <div className="flex flex-col items-end gap-1">
                    {bmi > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-lg font-bold tabular-nums"
                          style={{ color: user.color }}
                          data-testid={`bmi-value-${user.id}`}
                        >
                          {bmi}
                        </span>
                        <Badge variant={bmiBadgeVariant(category)} className="text-[10px]">
                          {label}
                        </Badge>
                      </div>
                    )}
                    {heightCm > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {heightCm} cm
                      </span>
                    )}
                  </div>
                </div>
                {delta !== undefined && (
                  <Badge
                    variant={delta <= 0 ? 'success' : 'secondary'}
                    className="mt-1 w-fit gap-1"
                  >
                    {delta <= 0 ? (
                      <TrendingDown className="size-3" />
                    ) : (
                      <TrendingUp className="size-3" />
                    )}
                    {delta > 0 ? '+' : ''}
                    {delta.toFixed(1)} kg ({range}d)
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <NumberStepper
                  id={`body-${user.id}`}
                  value={weights[user.id]}
                  onChange={(v) => setWeights((prev) => ({ ...prev, [user.id]: v }))}
                  step={0.1}
                  min={0}
                  suffix="kg"
                  inputMode="decimal"
                  placeholder="0"
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Button
        className="w-full"
        size="lg"
        data-testid="save-weight"
        onClick={handleSave}
        disabled={saving || !canSave}
      >
        <Scale className="size-4" />
        {saving ? 'Saving…' : "Save Today's Weight"}
      </Button>

      {editingHeights ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Update height</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {USERS.map((user) => (
              <div key={user.id} className="space-y-1.5">
                <p className="text-xs font-medium" style={{ color: user.color }}>
                  {user.name}
                </p>
                <NumberStepper
                  id={`edit-height-${user.id}`}
                  value={editHeights[user.id]}
                  onChange={(v) => setEditHeights((prev) => ({ ...prev, [user.id]: v }))}
                  step={1}
                  min={100}
                  max={250}
                  suffix="cm"
                  inputMode="numeric"
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingHeights(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveHeights} disabled={saving}>
                Save height
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={() => setEditingHeights(true)}
        >
          <Pencil className="size-3.5" />
          Edit height
        </Button>
      )}

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary/50 p-1">
        {([30, 90] as Range[]).map((r) => (
          <Button
            key={r}
            type="button"
            variant="ghost"
            className={cn('h-9 rounded-lg', range === r && 'bg-background shadow-sm')}
            onClick={() => setRange(r)}
          >
            {r} days
          </Button>
        ))}
      </div>

      <BmiChart data={bmiChart} />
      <WeightChart data={weightChart} />
    </div>
  )
}
