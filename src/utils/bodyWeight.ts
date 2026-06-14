import type { BodyWeightLog, BmiChartPoint, UserId, WeightChartPoint } from '@/types'
import { formatShortDate } from '@/data/users'
import { calculateBmi } from '@/utils/bmi'

export function buildWeightChartData(
  logs: BodyWeightLog[],
  days = 90,
): WeightChartPoint[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const byDate = new Map<string, WeightChartPoint>()

  for (const log of logs) {
    if (log.date < cutoffStr) continue
    const point = byDate.get(log.date) ?? {
      date: log.date,
      label: formatShortDate(log.date),
    }
    point[log.userId] = log.weight
    byDate.set(log.date, point)
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export function weightDelta(logs: BodyWeightLog[]): number | null {
  if (logs.length < 2) return null
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date))
  return sorted[sorted.length - 1].weight - sorted[0].weight
}

export function buildBmiChartData(
  logs: BodyWeightLog[],
  heights: Partial<Record<UserId, number>>,
  days = 90,
): BmiChartPoint[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const byDate = new Map<string, BmiChartPoint>()

  for (const log of logs) {
    if (log.date < cutoffStr) continue
    const heightCm = heights[log.userId]
    if (!heightCm || heightCm <= 0) continue

    const bmi = calculateBmi(log.weight, heightCm)
    if (bmi <= 0) continue

    const point = byDate.get(log.date) ?? {
      date: log.date,
      label: formatShortDate(log.date),
    }
    point[log.userId] = bmi
    byDate.set(log.date, point)
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}
