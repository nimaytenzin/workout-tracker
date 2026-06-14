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
  suffix?: string
  placeholder?: string
  inputMode?: 'decimal' | 'numeric'
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
  suffix,
  placeholder = '0',
  inputMode = 'numeric',
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

  return (
    <div className={cn('space-y-1.5', className)}>
      <InputGroup className="h-12">
        <InputGroupAddon align="inline-start">
          <InputGroupButton
            type="button"
            aria-label="Decrease"
            disabled={value <= min}
            onClick={() => adjust(-step)}
          >
            <Minus className="size-5" />
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
          className="text-center text-xl font-semibold tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        {suffix && (
          <span className="flex shrink-0 items-center border-l border-border/60 px-3 text-sm font-medium text-muted-foreground">
            {suffix}
          </span>
        )}

        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            aria-label="Increase"
            disabled={max !== undefined && value >= max}
            onClick={() => adjust(step)}
          >
            <Plus className="size-5" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <p className="text-center text-xs text-muted-foreground">
        Tap ± to adjust by {step}
        {suffix ? ` ${suffix}` : ''}
      </p>
    </div>
  )
}
