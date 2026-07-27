import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Wallet, Calendar, DollarSign, Percent } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { creditService } from '@/services'
import { useToast } from '@/hooks/useToast'
import { useLocale } from '@/hooks/useLocale'

import type { Credit, CreditPayment } from '@/types'
import clsx from 'clsx'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getDueDateColor(dueDate: string): string {
  const now = new Date().getTime()
  const due = new Date(dueDate).getTime()
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'text-red-600'
  if (diffDays <= 7) return 'text-yellow-600'
  return 'text-text-primary'
}

export function CreditDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { t } = useLocale()

  const [credit, setCredit] = useState<Credit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentNotes, setPaymentNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchCredit = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const result = await creditService.getCreditById(id)
      if (!result) {
        setError(t('credits.notFound'))
      } else {
        setCredit(result)
      }
    } catch {
      setError(t('credits.loadError'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCredit()
  }, [fetchCredit])

  const handleRecordPayment = async () => {
    if (!credit) return
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      addToast({ type: 'error', title: t('credits.validAmount') })
      return
    }
    if (amount > credit.remainingBalance) {
      addToast({ type: 'error', title: t('credits.amountExceeds') })
      return
    }
    setSubmitting(true)
    try {
      const payment: Omit<CreditPayment, 'id'> = {
        amount,
        paymentMethod: paymentMethod as CreditPayment['paymentMethod'],
        paymentDate: new Date(paymentDate).toISOString(),
        notes: paymentNotes,
      }
      const updated = await creditService.addPayment(credit.id, payment)
      if (updated) {
        setCredit(updated)
      }
      addToast({ type: 'success', title: t('credits.paymentRecorded') })
      setPaymentModalOpen(false)
    } catch {
      addToast({ type: 'error', title: t('credits.paymentFailed') })
    } finally {
      setSubmitting(false)
    }
  }

  const paymentColumns: TableColumn<CreditPayment>[] = [
    {
      key: 'paymentDate',
      label: t('common.date'),
      render: (payment) => formatDate(payment.paymentDate),
    },
    {
      key: 'amount',
      label: t('credits.paymentAmount'),
      render: (payment) => `DH ${payment.amount.toLocaleString()}`,
    },
    {
      key: 'paymentMethod',
      label: t('payments.method'),
      render: (payment) => {
        const labels: Record<string, string> = { cash: t('common.cash'), card: t('common.card'), bank_transfer: t('common.bankTransfer') }
        return labels[payment.paymentMethod] ?? payment.paymentMethod
      },
    },
    {
      key: 'notes',
      label: t('common.notes'),
      render: (payment) => payment.notes || '-',
    },
  ]

  return (
    <>
    <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate('/credits')}
          >
            {t('common.back')}
          </Button>
        </div>

        {loading && (
          <Card>
            <div className="space-y-4 animate-pulse">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                ))}
              </div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </Card>
        )}

        {error && !loading && (
          <Card>
            <EmptyState
              title={error === t('credits.notFound') ? t('credits.notFound') : 'Error'}
              description={error === t('credits.notFound') ? t('credits.notFoundDesc') : error}
              action={{ label: t('common.goBackToCredits'), onClick: () => navigate('/credits') }}
            />
          </Card>
        )}

        {credit && !loading && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">{credit.customerName}</h1>
                <p className="text-text-muted mt-1">
                  {t('common.creditId')}: {credit.id}
                  {credit.invoiceNumber && <span className="ml-3">{t('common.invoice')}: {credit.invoiceNumber}</span>}
                </p>
              </div>
              <StatusBadge status={credit.status} className="text-sm px-4 py-1.5" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
                  <DollarSign size={16} />
                  <span>{t('credits.initialAmount')}</span>
                </div>
                <p className="text-2xl font-bold text-text-primary">DH {credit.initialAmount.toLocaleString()}</p>
              </Card>
              <Card>
                <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
                  <Wallet size={16} />
                  <span>{t('credits.paidAmount')}</span>
                </div>
                <p className="text-2xl font-bold text-green-600">DH {credit.paidAmount.toLocaleString()}</p>
              </Card>
              <Card>
                <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
                  <Percent size={16} />
                  <span>{t('common.remaining')}</span>
                </div>
                <p className="text-2xl font-bold text-primary-600">DH {credit.remainingBalance.toLocaleString()}</p>
              </Card>
              <Card>
                <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
                  <Calendar size={16} />
                  <span>{t('credits.dueDate')}</span>
                </div>
                <p className={clsx('text-2xl font-bold', getDueDateColor(credit.dueDate))}>
                  {formatDate(credit.dueDate)}
                </p>
              </Card>
            </div>

            <Card title={t('credits.progress')}>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">
                    {`DH ${credit.paidAmount.toLocaleString()} ${t('credits.paidOf')} DH ${credit.initialAmount.toLocaleString()}`}
                  </span>
                  <span className="font-semibold">
                    {credit.initialAmount > 0
                      ? Math.round((credit.paidAmount / credit.initialAmount) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-500',
                      credit.remainingBalance === 0
                        ? 'bg-green-500'
                        : credit.status === 'overdue'
                          ? 'bg-orange-500'
                          : 'bg-primary-500',
                    )}
                    style={{
                      width: `${credit.initialAmount > 0 ? Math.round((credit.paidAmount / credit.initialAmount) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </Card>

            <Card
              title={t('credits.paymentHistory')}
              actions={
                <Button
                  size="sm"
                  icon={<Wallet size={16} />}
                  onClick={() => {
                    setPaymentAmount('')
                    setPaymentMethod('cash')
                    setPaymentDate(new Date().toISOString().split('T')[0])
                    setPaymentNotes('')
                    setPaymentModalOpen(true)
                  }}
                  disabled={credit.status === 'paid' || credit.status === 'cancelled'}
                >
                  {t('credits.recordPayment')}
                </Button>
              }
            >
              <Table<CreditPayment>
                columns={paymentColumns}
                data={credit.payments}
                loading={false}
                emptyMessage={t('credits.noPayments')}
              />
            </Card>
          </>
        )}
      </div>

      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`${t('credits.recordPayment')} - ${credit?.customerName ?? ''}`}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleRecordPayment} loading={submitting} icon={<Wallet size={16} />}>
              {t('credits.recordPayment')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {credit && (
            <div className="grid grid-cols-3 gap-3 p-3 bg-surface-secondary rounded-lg text-sm">
              <div>
                <span className="text-text-muted">{t('common.initial')}</span>
                <p className="font-semibold">DH {credit.initialAmount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-text-muted">{t('common.paid')}</span>
                <p className="font-semibold text-green-600">DH {credit.paidAmount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-text-muted">{t('common.remaining')}</span>
                <p className="font-semibold text-primary-600">DH {credit.remainingBalance.toLocaleString()}</p>
              </div>
            </div>
          )}
          <Input
            label={t('credits.paymentAmount')}
            type="number"
            step="0.01"
            min="0"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder={t('settings.enterPaymentAmount')}
          />
          <Select
            label={t('common.paymentMethod')}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { value: 'cash', label: t('common.cash') },
              { value: 'card', label: t('common.card') },
              { value: 'bank_transfer', label: t('common.bankTransfer') },
            ]}
          />
          <Input
            label={t('credits.paymentDate')}
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
          <Input
            label={t('common.notes')}
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder={t('settings.optionalNotes')}
          />
        </div>
      </Modal>
    </>
  )
}
