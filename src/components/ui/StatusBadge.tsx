import { Badge } from './Badge'
import { STATUS_COLORS } from '@/constants'
import { useLocale } from '@/hooks/useLocale'
import type { BadgeVariant } from './Badge'
import clsx from 'clsx'

const statusToVariant: Record<string, BadgeVariant> = {
  active: 'success',
  completed: 'success',
  paid: 'success',
  new_sale: 'success',
  pending: 'warning',
  overdue: 'warning',
  credit_reminder: 'warning',
  inactive: 'neutral',
  viewer: 'neutral',
  cancelled: 'danger',
  refunded: 'info',
  failed: 'danger',
  blocked: 'danger',
  discontinued: 'danger',
  system: 'info',
  admin: 'info',
  manager: 'info',
  sales: 'success',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useLocale()
  const variant = statusToVariant[status] ?? 'neutral'
  const colorClasses = STATUS_COLORS[status]
  const label = t(`status.${status}`) || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')

  return (
    <Badge variant={variant} className={clsx(colorClasses, className)}>
      {label}
    </Badge>
  )
}
