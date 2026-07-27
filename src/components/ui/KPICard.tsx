import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Skeleton } from './Skeleton'
import { useLocale } from '@/hooks/useLocale'
import clsx from 'clsx'

type ChangeType = 'positive' | 'negative' | 'neutral'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  changeType?: ChangeType
  icon?: ReactNode
  loading?: boolean
  className?: string
}

export function KPICard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  loading = false,
  className,
}: KPICardProps) {
  const { t } = useLocale()
  if (loading) {
    return (
      <div
        className={clsx(
          'bg-surface rounded-xl border border-border shadow-sm p-6 animate-fade-in',
          className,
        )}
      >
        <Skeleton variant="text" width="6rem" />
        <Skeleton variant="text" width="4rem" className="mt-3 h-8" />
        <Skeleton variant="text" width="5rem" className="mt-2" />
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'bg-surface rounded-xl border border-border shadow-sm p-6 animate-fade-in hover:shadow-md transition-shadow duration-150',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-text-muted">{title}</span>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-text-primary mb-1">{value}</div>
      {change !== undefined && (
        <div className="flex items-center gap-1 text-sm">
          {changeType === 'positive' && (
            <TrendingUp size={16} className="text-green-600" />
          )}
          {changeType === 'negative' && (
            <TrendingDown size={16} className="text-red-600" />
          )}
          {changeType === 'neutral' && (
            <Minus size={16} className="text-text-muted" />
          )}
          <span
            className={clsx(
              changeType === 'positive' && 'text-green-600',
              changeType === 'negative' && 'text-red-600',
              changeType === 'neutral' && 'text-text-muted',
            )}
          >
            {change > 0 ? '+' : ''}
            {change}%
          </span>
          <span className="text-text-muted">{t('settings.vsPrev')}</span>
        </div>
      )}
    </div>
  )
}
