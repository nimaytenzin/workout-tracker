import exifr from 'exifr'

const WHATSAPP_FILENAME_RE =
  /(\d{4})-(\d{2})-(\d{2})_at_(\d{1,2})\.(\d{2})\.(\d{2})_(AM|PM)/i

function parseWhatsAppFilename(name: string): Date | null {
  const match = name.match(WHATSAPP_FILENAME_RE)
  if (!match) return null

  let hour = parseInt(match[4], 10)
  const minute = parseInt(match[5], 10)
  const second = parseInt(match[6], 10)
  const ampm = match[7].toUpperCase()

  if (ampm === 'PM' && hour < 12) hour += 12
  if (ampm === 'AM' && hour === 12) hour = 0

  return new Date(
    parseInt(match[1], 10),
    parseInt(match[2], 10) - 1,
    parseInt(match[3], 10),
    hour,
    minute,
    second,
  )
}

function parseExifDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  if (typeof value === 'string') {
    const parsed = new Date(value.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3'))
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return null
}

export async function extractPhotoTimestamp(file: File): Promise<Date> {
  try {
    const exif = await exifr.parse(file, {
      pick: ['DateTimeOriginal', 'CreateDate', 'ModifyDate'],
    })
    const fromExif =
      parseExifDate(exif?.DateTimeOriginal) ??
      parseExifDate(exif?.CreateDate) ??
      parseExifDate(exif?.ModifyDate)
    if (fromExif) return fromExif
  } catch {
    // WhatsApp and some mobile exports strip EXIF — fall through
  }

  const fromFilename = parseWhatsAppFilename(file.name)
  if (fromFilename && !Number.isNaN(fromFilename.getTime())) return fromFilename

  if (file.lastModified > 0) return new Date(file.lastModified)

  return new Date()
}

export function formatPhotoTimestamp(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
