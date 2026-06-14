import { db } from './database'
import { workoutRepository } from './repository'
import { extractPhotoTimestamp } from '@/utils/photoTimestamp'

const SEED_PHOTOS = [
  { url: '/progress/gym-progress-1.jpg', name: 'WhatsApp_Image_2026-06-14_at_7.56.59_PM.jpg' },
  { url: '/progress/gym-progress-2.jpg', name: 'WhatsApp_Image_2026-06-14_at_7.56.59_PM__1_.jpg' },
] as const

export async function seedProgressPhotosIfEmpty(): Promise<void> {
  const count = await db.progressPhotos.count()
  if (count > 0) return

  for (const seed of SEED_PHOTOS) {
    const response = await fetch(seed.url)
    if (!response.ok) continue

    const blob = await response.blob()
    const file = new File([blob], seed.name, {
      type: blob.type || 'image/jpeg',
    })
    const capturedAt = await extractPhotoTimestamp(file)

    await workoutRepository.addProgressPhoto({
      blob,
      mimeType: file.type,
      capturedAt,
    })
  }
}
