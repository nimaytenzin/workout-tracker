export interface RpeOption {
  value: number
  label: string
  reserve: string
}

export const RPE_SCALE: RpeOption[] = [
  { value: 1, label: 'Rest only', reserve: '5+ reps in reserve' },
  { value: 2, label: 'Very light', reserve: '4–5 reps in reserve' },
  { value: 3, label: 'Light', reserve: '4 reps in reserve' },
  { value: 4, label: 'Easy', reserve: '3 reps in reserve' },
  { value: 5, label: 'Moderate', reserve: '3 reps in reserve' },
  { value: 6, label: 'Challenging', reserve: '2–3 reps in reserve' },
  { value: 7, label: 'Hard', reserve: '2 reps in reserve' },
  { value: 8, label: 'Very hard', reserve: '2 reps in reserve' },
  { value: 9, label: 'Near max', reserve: '1 rep in reserve' },
  { value: 10, label: 'Max effort', reserve: '0 reps in reserve' },
]

export function getRpeOption(value: number): RpeOption | undefined {
  return RPE_SCALE.find((r) => r.value === value)
}

export function formatRpeLabel(value: number): string {
  return getRpeOption(value)?.label ?? String(value)
}

export function formatRpeSummary(value: number): string {
  const option = getRpeOption(value)
  if (!option) return `RPE ${value}`
  return `${option.label} · ${option.reserve}`
}
