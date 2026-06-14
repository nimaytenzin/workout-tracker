import { Link, useLocation } from 'react-router-dom'
import { BarChart3, CalendarDays, Dumbbell, Heart, Scale } from 'lucide-react'
import { USERS } from '@/data/users'
import { useIsStandalone } from '@/hooks/useIsStandalone'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Workouts', icon: Dumbbell },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/weight', label: 'BMI', icon: Scale },
  { to: '/analytics', label: 'Stats', icon: BarChart3 },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isStandalone = useIsStandalone()
  const isWorkout = location.pathname.startsWith('/workout')

  return (
    <div
      className={cn(
        'mx-auto flex min-h-dvh w-full flex-col bg-background safe-x',
        isStandalone ? 'max-w-none' : 'max-w-lg',
      )}
    >
      {!isWorkout && (
        <header className="safe-top sticky top-0 z-20 border-b bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Heart className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold tracking-tight">
                Couple Tracker
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                {USERS.map((u) => u.name).join(' & ')} · workouts · BMI
              </p>
            </div>
          </div>
        </header>
      )}

      <main
        className={cn(
          'flex-1',
          isWorkout ? 'pb-workout' : 'px-4 py-4 pb-nav',
        )}
      >
        {children}
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex h-[4.75rem] max-w-lg items-stretch px-1 safe-x">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active =
              to === '/'
                ? location.pathname === '/' || location.pathname.startsWith('/workout')
                : location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium transition-colors touch-manipulation select-none active:opacity-70',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground active:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex size-11 items-center justify-center rounded-xl transition-colors',
                    active && 'bg-primary/15',
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.25 : 2} />
                </span>
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
