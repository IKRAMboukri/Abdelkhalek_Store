import { AlertTriangle, Trash2 } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { useLocale } from '@/hooks/useLocale'
import clsx from 'clsx'

type ConfirmVariant = 'danger' | 'warning'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
}

const variantConfig: Record<ConfirmVariant, {
  icon: React.ReactNode
  buttonVariant: 'danger' | 'primary'
  iconBg: string
  iconColor: string
}> = {
  danger: {
    icon: <Trash2 size={24} />,
    buttonVariant: 'danger',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  warning: {
    icon: <AlertTriangle size={24} />,
    buttonVariant: 'primary',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
}: ConfirmDialogProps) {
  const { t } = useLocale()
  const config = variantConfig[variant]

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center py-2">
        <div
          className={clsx(
            'w-12 h-12 rounded-full flex items-center justify-center mb-4',
            config.iconBg,
            config.iconColor,
          )}
        >
          {config.icon}
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title ?? t('common.confirmAction')}</h3>
        <p className="text-sm text-text-secondary mb-6 max-w-sm">{message}</p>
        <div className="flex items-center gap-3 w-full">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {cancelText ?? t('common.cancel')}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="flex-1"
          >
            {confirmText ?? t('common.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
