import type { RecoveryGroupId } from '@/types'

export type BodySex = 'male' | 'female'
export type BodyView = 'front' | 'back'

export interface MuscleRegion {
  group: RecoveryGroupId
  d: string
}

/** Simplified anatomical regions mapped to recovery groups */
export const BODY_REGIONS: Record<
  BodySex,
  Record<BodyView, MuscleRegion[]>
> = {
  male: {
    front: [
      {
        group: 'shoulders',
        d: 'M 22 38 Q 14 42 12 52 L 16 58 Q 24 54 28 46 Z M 78 38 Q 86 42 88 52 L 84 58 Q 76 54 72 46 Z',
      },
      {
        group: 'chest',
        d: 'M 34 54 Q 50 48 66 54 L 68 72 Q 50 80 32 72 Z',
      },
      {
        group: 'biceps',
        d: 'M 14 58 Q 8 68 10 82 L 18 84 Q 22 70 20 60 Z M 86 58 Q 92 68 90 82 L 82 84 Q 78 70 80 60 Z',
      },
      {
        group: 'abs',
        d: 'M 38 78 Q 50 74 62 78 L 64 108 Q 50 114 36 108 Z',
      },
      {
        group: 'quads',
        d: 'M 34 112 Q 30 130 32 152 L 44 154 Q 46 132 44 114 Z M 66 112 Q 70 130 68 152 L 56 154 Q 54 132 56 114 Z',
      },
      {
        group: 'calves',
        d: 'M 34 156 Q 32 170 34 186 L 42 188 Q 44 172 42 158 Z M 66 156 Q 68 170 66 186 L 58 188 Q 56 172 58 158 Z',
      },
    ],
    back: [
      {
        group: 'shoulders',
        d: 'M 20 38 Q 12 44 10 54 L 16 58 Q 24 52 26 44 Z M 80 38 Q 88 44 90 54 L 84 58 Q 76 52 74 44 Z',
      },
      {
        group: 'back',
        d: 'M 30 52 Q 50 46 70 52 L 72 96 Q 50 102 28 96 Z',
      },
      {
        group: 'triceps',
        d: 'M 12 56 Q 6 68 8 84 L 16 82 Q 18 68 16 58 Z M 88 56 Q 94 68 92 84 L 84 82 Q 82 68 84 58 Z',
      },
      {
        group: 'glutes',
        d: 'M 34 100 Q 50 96 66 100 L 68 118 Q 50 124 32 118 Z',
      },
      {
        group: 'hamstrings',
        d: 'M 32 122 Q 28 140 30 158 L 42 160 Q 44 142 42 124 Z M 68 122 Q 72 140 70 158 L 58 160 Q 56 142 58 124 Z',
      },
      {
        group: 'calves',
        d: 'M 34 162 Q 32 176 34 190 L 42 192 Q 44 176 42 162 Z M 66 162 Q 68 176 66 190 L 58 192 Q 56 176 58 162 Z',
      },
    ],
  },
  female: {
    front: [
      {
        group: 'shoulders',
        d: 'M 24 38 Q 18 42 16 50 L 20 56 Q 26 52 28 46 Z M 76 38 Q 82 42 84 50 L 80 56 Q 74 52 72 46 Z',
      },
      {
        group: 'chest',
        d: 'M 36 54 Q 50 50 64 54 L 66 70 Q 50 76 34 70 Z',
      },
      {
        group: 'biceps',
        d: 'M 16 56 Q 12 66 14 80 L 20 82 Q 22 68 20 58 Z M 84 56 Q 88 66 86 80 L 80 82 Q 78 68 80 58 Z',
      },
      {
        group: 'abs',
        d: 'M 40 76 Q 50 72 60 76 L 62 104 Q 50 110 38 104 Z',
      },
      {
        group: 'quads',
        d: 'M 36 110 Q 32 128 34 150 L 44 152 Q 46 130 44 112 Z M 64 110 Q 68 128 66 150 L 56 152 Q 54 130 56 112 Z',
      },
      {
        group: 'calves',
        d: 'M 36 154 Q 34 168 36 184 L 42 186 Q 44 170 42 156 Z M 64 154 Q 66 168 64 184 L 58 186 Q 56 170 58 156 Z',
      },
    ],
    back: [
      {
        group: 'shoulders',
        d: 'M 22 38 Q 16 44 14 52 L 18 56 Q 24 52 26 46 Z M 78 38 Q 84 44 86 52 L 82 56 Q 76 52 74 46 Z',
      },
      {
        group: 'back',
        d: 'M 32 52 Q 50 48 68 52 L 70 92 Q 50 98 30 92 Z',
      },
      {
        group: 'triceps',
        d: 'M 14 54 Q 10 66 12 80 L 18 78 Q 20 66 18 56 Z M 86 54 Q 90 66 88 80 L 82 78 Q 80 66 82 56 Z',
      },
      {
        group: 'glutes',
        d: 'M 30 96 Q 50 92 70 96 L 72 118 Q 50 126 28 118 Z',
      },
      {
        group: 'hamstrings',
        d: 'M 34 122 Q 30 140 32 156 L 42 158 Q 44 140 42 124 Z M 66 122 Q 70 140 68 156 L 58 158 Q 56 140 58 124 Z',
      },
      {
        group: 'calves',
        d: 'M 36 160 Q 34 174 36 188 L 42 190 Q 44 174 42 160 Z M 64 160 Q 66 174 64 188 L 58 190 Q 56 174 58 160 Z',
      },
    ],
  },
}

export const BODY_SILHOUETTE: Record<BodySex, Record<BodyView, string>> = {
  male: {
    front:
      'M 50 10 Q 58 10 60 18 L 62 28 Q 64 34 58 36 L 56 40 Q 72 44 88 52 L 92 80 L 88 120 L 84 154 L 80 190 L 68 192 L 66 156 L 64 120 L 56 120 L 54 156 L 52 192 L 40 190 L 36 154 L 32 120 L 28 80 L 32 52 Q 28 44 44 40 L 42 36 Q 36 34 38 28 L 40 18 Q 42 10 50 10 Z',
    back:
      'M 50 10 Q 58 10 60 18 L 62 28 Q 64 34 58 36 L 56 40 Q 72 44 88 52 L 92 80 L 88 120 L 84 154 L 80 190 L 68 192 L 66 156 L 64 120 L 56 120 L 54 156 L 52 192 L 40 190 L 36 154 L 32 120 L 28 80 L 32 52 Q 28 44 44 40 L 42 36 Q 36 34 38 28 L 40 18 Q 42 10 50 10 Z',
  },
  female: {
    front:
      'M 50 10 Q 57 10 59 17 L 61 26 Q 63 32 58 35 L 56 39 Q 70 42 84 50 L 86 78 L 82 116 L 76 148 Q 74 162 68 168 L 64 190 L 56 192 L 54 158 L 52 120 L 48 120 L 46 158 L 44 192 L 36 190 L 32 168 Q 26 162 24 148 L 18 116 L 14 78 L 28 50 Q 30 42 44 39 L 42 35 Q 37 32 39 26 L 41 17 Q 43 10 50 10 Z',
    back:
      'M 50 10 Q 57 10 59 17 L 61 26 Q 63 32 58 35 L 56 39 Q 70 42 84 50 L 86 78 L 82 116 L 78 148 Q 76 164 70 170 L 66 190 L 58 192 L 56 158 L 54 120 L 46 120 L 44 158 L 42 192 L 34 190 L 30 170 Q 24 164 22 148 L 18 116 L 14 78 L 28 50 Q 30 42 44 39 L 42 35 Q 37 32 39 26 L 41 17 Q 43 10 50 10 Z',
  },
}
