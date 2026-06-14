import { cn } from '@/lib/utils'

const QUICK_RPE = [6, 7, 8, 9, 10] as const

interface QuickRpePickerProps {
  value: string
  onValueChange: (value: string) => void
}

export function QuickRpePicker({ value, onValueChange }: QuickRpePickerProps) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {QUICK_RPE.map((rpe) => {
        const active = value === String(rpe)
        return (
          <button
            key={rpe}
            type="button"
            onClick={() => onValueChange(String(rpe))}
            className={cn(
              'h-12 rounded-xl border text-base font-semibold tabular-nums transition-colors touch-manipulation select-none active:scale-[0.97]',
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/60 bg-background hover:bg-muted/50',
            )}
          >
            {rpe}
          </button>
        )
      })}
    </div>
  )
}
