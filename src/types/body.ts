export type BodyUserId = 'me' | 'partner'

export interface UserBodyProfile {
  id?: number
  userId: BodyUserId
  heightCm: number
  updatedAt: Date
}

export interface BmiChartPoint {
  date: string
  label: string
  me?: number
  partner?: number
}
