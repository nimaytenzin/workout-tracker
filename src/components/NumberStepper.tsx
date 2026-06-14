import { useEffect, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

interface NumberStepperProps {
  id?: string
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  label?: string
  suffix?: string
  placeholder?: string
  inputMode?: 'decimal' | 'numeric'
  compact?: boolean
  className?: string
}

function roundStep(value: number, step: number): number {
  const decimals = step % 1 !== 0 ? 1 : 0
  const rounded = Math.round(value / step) * step
  return Number(rounded.toFixed(decimals))
}

function formatDisplay(value: number): string {
  return value > 0 ? String(value) : ''
}

function sanitizeDraft(raw: string, inputMode: 'decimal' | 'numeric'): string {
  if (inputMode === 'numeric') return raw.replace(/\D/g, '')

  let out = ''
  let hasDot = false
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') out += ch
    else if (ch === '.' && !hasDot) {
      out += ch
      hasDot = true
    }
  }
  return out
}

export function NumberStepper({
  id,
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  label,
  suffix,
  placeholder = '0',
  inputMode = 'numeric',
  compact = false,
  className,
}: NumberStepperProps) {
  const [draft, setDraft] = useState(() => formatDisplay(value))
  const focusedRef = useRef(false)

  useEffect(() => {
    if (!focusedRef.current) {
      setDraft(formatDisplay(value))
    }
  }, [value])

  function clamp(valueToClamp: number): number {
    let next = Math.max(min, valueToClamp)
    if (max !== undefined) next = Math.min(max, next)
    return next
  }

  function parseDraft(raw: string): number | null {
    if (raw === '' || raw === '.') return null
    const parsed = inputMode === 'decimal' ? parseFloat(raw) : parseInt(raw, 10)
    return Number.isNaN(parsed) ? null : parsed
  }

  function commitDraft(raw: string, finalize: boolean) {
    const parsed = parseDraft(raw)
    if (parsed === null) {
      if (finalize) onChange(0)
      return
    }

    if (!finalize && raw.endsWith('.')) return

    onChange(clamp(parsed))
  }

  function adjust(delta: number) {
    const next = roundStep(Math.max(min, value + delta), step)
    const clamped = max !== undefined ? Math.min(max, next) : next
    onChange(clamped)
    if (!focusedRef.current) setDraft(formatDisplay(clamped))
  }

  function handleInput(raw: string) {
    const nextDraft = sanitizeDraft(raw, inputMode)
    setDraft(nextDraft)
    commitDraft(nextDraft, false)
  }

  function handleBlur() {
    focusedRef.current = false

    const parsed = parseDraft(draft)
    if (parsed === null) {
      onChange(0)
      setDraft('')
      return
    }

    const final = clamp(parsed)
    onChange(final)
    setDraft(formatDisplay(final))
  }

  const suffixLabel = suffix ?? label

  return (
    <div className={cn(compact ? 'space-y-1' : 'space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
        >
          {label}
        </label>
      )}

      <InputGroup className={compact ? 'h-10' : 'h-12'}>
        <InputGroupAddon align="inline-start">
          <InputGroupButton
            type="button"
            size="xs"
            aria-label="Decrease"
            disabled={value <= min}
            onClick={() => adjust(-step)}
          >
            <Minus className={compact ? 'size-3.5' : 'size-4 sm:size-5'} />
          </InputGroupButton>
        </InputGroupAddon>

        <InputGroupInput
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => {
            focusedRef.current = true
          }}
          onBlur={handleBlur}
          className={cn(
            'min-w-0 flex-1 px-0.5 text-center font-semibold tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            compact ? 'text-base' : 'min-w-[3rem] px-1 text-lg sm:px-2 sm:text-xl',
          )}
        />

        {suffix && !label && (
          <span
            className={cn(
              'flex shrink-0 items-center border-l border-border/60 font-medium text-muted-foreground',
              compact ? 'px-1.5 text-[10px]' : 'px-2 text-xs sm:px-3 sm:text-sm',
            )}
          >
            {suffix}
          </span>
        )}

        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            size="xs"
            aria-label="Increase"
            disabled={max !== undefined && value >= max}
            onClick={() => adjust(step)}
          >
            <Plus className={compact ? 'size-3.5' : 'size-4 sm:size-5'} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {!compact && (
        <p className="text-center text-xs text-muted-foreground">
          Tap ± to adjust by {step}
          {suffixLabel ? ` ${suffixLabel}` : ''}
        </p>
      )}
    </div>
  )
}
