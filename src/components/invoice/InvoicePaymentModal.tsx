import { useEffect, useState } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { Button, Input, Modal, Select } from '@/components/ui'
import { DollarSign } from 'lucide-react'
import type { Payment, SelectOption } from '@/types'

interface InvoicePaymentModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (data: { amount: number; method: 'cash' | 'bank_transfer' }) => Promise<void>
  total: number
  paid: number
  remaining: number
  title?: string
  history?: Payment[]
  historyLoading?: boolean
  loading?: boolean
}

export function InvoicePaymentModal({
  open,
  onClose,
  onConfirm,
  total,
  paid,
  remaining,
  title,
  history = [],
  historyLoading = false,
  loading = false,
}: InvoicePaymentModalProps) {
  const { t } = useLocale()
  const methodOptions: SelectOption[] = [
    { value: 'cash', label: t('common.cash') },
    { value: 'bank_transfer', label: t('common.bankTransfer') },
  ]
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<'cash' | 'bank_transfer'>('cash')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setAmount('')
      setMethod('cash')
      setError('')
    }
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(t('credits.validAmount'))
      return
    }
    if (numAmount > remaining) {
      setError(t('credits.amountExceeds'))
      return
    }
    onConfirm({ amount: numAmount, method })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title ?? t('invoices.addPayment')}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading} type="button">
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            loading={loading}
            icon={<DollarSign size={16} />}
          >
            {t('invoices.savePayment')}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3 p-3 bg-surface-secondary rounded-lg text-sm">
          <div>
            <span className="block text-xs text-text-muted">{t('invoices.grandTotal')}</span>
            <p className="font-semibold">DH {total.toFixed(2)}</p>
          </div>
          <div>
            <span className="block text-xs text-text-muted">{t('invoices.amountPaid')}</span>
            <p className="font-semibold text-green-600">DH {paid.toFixed(2)}</p>
          </div>
          <div>
            <span className="block text-xs text-text-muted">{t('invoices.balanceDue')}</span>
            <p className="font-semibold text-primary-600">DH {remaining.toFixed(2)}</p>
          </div>
        </div>

        <Input
          label={t('credits.paymentAmount')}
          type="number"
          step="0.01"
          min="0"
          max={remaining}
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
            setError('')
          }}
          error={error}
          placeholder={t('invoices.paymentPlaceholder')}
          icon={<DollarSign size={16} />}
        />

        <Select
          label={t('common.paymentMethod')}
          value={method}
          onChange={(e) => setMethod(e.target.value as 'cash' | 'bank_transfer')}
          options={methodOptions}
        />

        {history.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('credits.paymentHistory')}
            </label>
            <div className="max-h-36 overflow-y-auto rounded-lg border border-gray-100 divide-y divide-gray-100">
              {history.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-text-primary">
                      DH {p.amount.toFixed(2)}
                    </span>
                    <span className="text-xs text-text-muted">
                      {new Date(p.createdAt).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted capitalize">
                    {p.method === 'cash' ? t('common.cash') : t('common.bankTransfer')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {historyLoading && (
          <div className="flex items-center justify-center py-3">
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        )}
      </form>
    </Modal>
  )
}