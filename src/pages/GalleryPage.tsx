import { useCallback, useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2, X, ZoomIn } from 'lucide-react'
import { workoutRepository } from '@/db/repository'
import { seedProgressPhotosIfEmpty } from '@/db/seedProgressPhotos'
import type { ProgressPhoto } from '@/types'
import { extractPhotoTimestamp, formatPhotoTimestamp } from '@/utils/photoTimestamp'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function useObjectUrl(blob: Blob | null): string {
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (!blob) {
      setUrl('')
      return
    }
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  return url
}

function PhotoThumb({
  photo,
  onOpen,
}: {
  photo: ProgressPhoto
  onOpen: () => void
}) {
  const url = useObjectUrl(photo.blob)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted touch-manipulation"
    >
      {url ? (
        <img
          src={url}
          alt="Progress"
          className="size-full object-cover transition-transform group-active:scale-[1.02]"
          loading="lazy"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
          Loading…
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2.5 pb-2.5 pt-8 text-left">
        <p className="text-[11px] font-semibold text-white">
          {formatPhotoTimestamp(photo.capturedAt)}
        </p>
      </div>
      <span className="absolute right-2 top-2 rounded-full bg-black/45 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
        <ZoomIn className="size-3.5" />
      </span>
    </button>
  )
}

function PhotoLightbox({
  photo,
  onClose,
  onDelete,
}: {
  photo: ProgressPhoto
  onClose: () => void
  onDelete: () => void
}) {
  const url = useObjectUrl(photo.blob)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 safe-top safe-bottom safe-x">
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {formatPhotoTimestamp(photo.capturedAt)}
          </p>
          <p className="text-[11px] text-white/60">Photo timestamp</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-xl text-white hover:bg-white/10"
            onClick={onDelete}
            aria-label="Delete photo"
          >
            <Trash2 className="size-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-xl text-white hover:bg-white/10"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden px-2 pb-4">
        {url && (
          <img
            src={url}
            alt="Progress full view"
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>
    </div>
  )
}

export function GalleryPage() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<ProgressPhoto | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      await seedProgressPhotosIfEmpty()
      setPhotos(await workoutRepository.getAllProgressPhotos())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return

    setUploading(true)
    try {
      for (const file of Array.from(fileList)) {
        if (!file.type.startsWith('image/')) continue

        const capturedAt = await extractPhotoTimestamp(file)
        await workoutRepository.addProgressPhoto({
          blob: file,
          mimeType: file.type,
          capturedAt,
        })
      }
      await refresh()
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(id: number) {
    await workoutRepository.deleteProgressPhoto(id)
    setSelected(null)
    await refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Progress Gallery</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? 'Loading photos…'
              : photos.length > 0
                ? `${photos.length} photo${photos.length === 1 ? '' : 's'} · sorted by date taken`
                : 'Add gym progress photos — date is read from the image'}
          </p>
        </div>
        <Button
          type="button"
          className="h-11 shrink-0 gap-2 rounded-xl px-4"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-4" />
          {uploading ? 'Adding…' : 'Add'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {!loading && photos.length === 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60',
            'bg-muted/20 px-6 py-14 text-center touch-manipulation active:bg-muted/40',
          )}
        >
          <ImagePlus className="size-10 text-muted-foreground" />
          <div>
            <p className="font-semibold">Add your first progress photo</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Timestamp is pulled from photo metadata or filename
            </p>
          </div>
        </button>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo) => (
            <PhotoThumb
              key={photo.id}
              photo={photo}
              onOpen={() => setSelected(photo)}
            />
          ))}
        </div>
      )}

      {selected?.id && (
        <PhotoLightbox
          photo={selected}
          onClose={() => setSelected(null)}
          onDelete={() => handleDelete(selected.id!)}
        />
      )}
    </div>
  )
}
