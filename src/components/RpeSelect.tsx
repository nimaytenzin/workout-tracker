import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatRpeLabel, RPE_SCALE } from '@/utils/rpe'
import { cn } from '@/lib/utils'

interface RpeSelectProps {
  value: string
  onValueChange: (value: string) => void
  compact?: boolean
  className?: string
}

export function RpeSelect({ value, onValueChange, compact = false, className }: RpeSelectProps) {
  const selected = RPE_SCALE.find((r) => String(r.value) === value)

  return (
    <div className={cn(compact && 'space-y-1')}>
      {compact && (
        <span className="block text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          RPE
        </span>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={cn(
            'w-full',
            compact ? 'h-10 justify-center text-center text-sm font-semibold' : 'h-12 text-left',
            className,
          )}
        >
          <SelectValue placeholder="RPE">
            {compact ? (
              <span className="font-semibold tabular-nums">{value}</span>
            ) : selected ? (
              <span className="flex min-w-0 flex-col items-start leading-tight">
                <span className="truncate font-medium">{selected.label}</span>
                <span className="truncate text-[10px] text-muted-foreground">
                  {selected.reserve}
                </span>
              </span>
            ) : (
              formatRpeLabel(parseInt(value, 10))
            )}
          </SelectValue>
        </SelectTrigger>
      <SelectContent className="max-h-72">
        {RPE_SCALE.map((option) => (
          <SelectItem key={option.value} value={String(option.value)} className="py-2.5">
            <span className="flex flex-col items-start gap-0.5">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.reserve}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    </div>
  )
}
