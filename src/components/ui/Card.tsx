import type { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  title?: string
  subtitle?: string
  className?: string
  children: ReactNode
  actions?: ReactNode
  padding?: boolean
}

export function Card({
  title,
  subtitle,
  className,
  children,
  actions,
  padding = true,
}: CardProps) {
  return (
    <div
      className={clsx(
        'bg-surface rounded-xl border border-border shadow-sm',
        'animate-fade-in',
        padding && 'p-6',
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="min-w-0">
            {title && (
              <h3 className="text-base font-semibold text-text-primary truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
