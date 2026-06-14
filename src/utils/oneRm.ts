/** Epley's formula: 1RM = Weight × (1 + Reps / 30) */
export function calculateOneRm(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

export function formatOneRm(value: number): string {
  if (value <= 0) return '—'
  return `${value} kg`
}
