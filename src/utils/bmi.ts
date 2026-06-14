/** BMI = weight (kg) / height (m)² */
export function calculateBmi(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese'

export function getBmiCategory(bmi: number): {
  label: string
  category: BmiCategory
} {
  if (bmi <= 0) return { label: '—', category: 'normal' }
  if (bmi < 18.5) return { label: 'Underweight', category: 'underweight' }
  if (bmi < 25) return { label: 'Normal', category: 'normal' }
  if (bmi < 30) return { label: 'Overweight', category: 'overweight' }
  return { label: 'Obese', category: 'obese' }
}

export function bmiBadgeVariant(
  category: BmiCategory,
): 'success' | 'secondary' | 'warning' | 'destructive' {
  switch (category) {
    case 'underweight':
      return 'warning'
    case 'normal':
      return 'success'
    case 'overweight':
      return 'warning'
    case 'obese':
      return 'destructive'
  }
}
