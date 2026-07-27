import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { Button } from './Button'
import { useLocale } from '@/hooks/useLocale'
import clsx from 'clsx'

interface EmptyStateProps {
  icon?: ReactNode
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const { t } = useLocale()
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in',
        className,
      )}
    >
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <div className="text-gray-400 dark:text-gray-500">
          {icon ?? <Inbox size={32} />}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title ?? t('common.noData')}</h3>
      {description && (
        <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>
      )}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}
