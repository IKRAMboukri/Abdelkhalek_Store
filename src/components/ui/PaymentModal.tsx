import { useState, useEffect } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { Button, Input, Select } from '@/components/ui'
import { DollarSign, Calendar } from 'lucide-react'
import type { SelectOption } from '@/types'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (data: { amount: number; method: string; date: string; notes: string }) => void
  maxAmount: number
  loading?: boolean
}

export function PaymentModal({ open, onClose, onConfirm, maxAmount, loading = false }: PaymentModalProps) {
  const { t } = useLocale()
  const methodOptions: SelectOption[] = [
    { value: 'cash', label: t('common.cash') },
    { value: 'card', label: t('common.card') },
    { value: 'bank_transfer', label: t('common.bankTransfer') },
  ]
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('cash')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setAmount('')
      setMethod('cash')
      setDate(new Date().toISOString().split('T')[0])
      setNotes('')
      setError('')
    }
  }, [open])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(t('credits.validAmount'))
      return
    }
    if (numAmount > maxAmount) {
      setError(t('credits.amountExceeds'))
      return
    }
    onConfirm({ amount: numAmount, method, date, notes })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl animate-scale-in">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{t('credits.recordPayment')}</h2>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Input
            label={t('credits.paymentAmount')}
            type="number"
            step="0.01"
            min="0"
            max={maxAmount}
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError('') }}
            error={error}
            placeholder={`Max: DH ${maxAmount.toFixed(2)}`}
            icon={<DollarSign size={16} />}
            className="!h-12 !rounded-xl"
          />
          <Select
            label={t('common.paymentMethod')}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            options={methodOptions}
            className="!h-12 !rounded-xl"
          />
          <Input
            label={t('credits.paymentDate')}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            icon={<Calendar size={16} />}
            className="!h-12 !rounded-xl"
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('common.notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('common.notes')}
              rows={2}
              className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-300 transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white hover:bg-white resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading} type="button" className="!rounded-xl">
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={loading} className="!rounded-xl">
              {t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
