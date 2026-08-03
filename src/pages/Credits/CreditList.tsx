import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Wallet, Trash2, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { SearchBar } from '@/components/ui/SearchBar'
import { FilterBar } from '@/components/ui/FilterBar'
import type { FilterConfig } from '@/components/ui/FilterBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { KPICard } from '@/components/ui/KPICard'
import { creditService } from '@/services'
import { useToast } from '@/hooks/useToast'
import { useLocale } from '@/hooks/useLocale'
import { PAGINATION_DEFAULTS } from '@/constants'
import type { Credit, FilterOptions, CreditPayment } from '@/types'
import clsx from 'clsx'

function getDueDateColor(dueDate: string): string {
  const now = new Date().getTime()
  const due = new Date(dueDate).getTime()
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'text-red-600 font-semibold'
  if (diffDays <= 7) return 'text-yellow-600 font-semibold'
  return 'text-text-primary'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function CreditList() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { t } = useLocale()

  const statusFilters: FilterConfig[] = [
    {
      key: 'status',
      label: t('common.status'),
      type: 'select',
      options: [
        { value: 'active', label: t('status.active') },
        { value: 'overdue', label: t('status.overdue') },
        { value: 'paid', label: t('status.paid') },
        { value: 'cancelled', label: t('status.cancelled') },
      ],
    },
  ]

  const quickFilters = [
    { label: t('credits.all'), value: '' },
    { label: t('status.active'), value: 'active' },
    { label: t('status.overdue'), value: 'overdue' },
    { label: t('status.paid'), value: 'paid' },
  ] as const

  const [credits, setCredits] = useState<Credit[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<number>(PAGINATION_DEFAULTS.pageSize)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentCredit, setPaymentCredit] = useState<Credit | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentNotes, setPaymentNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchCredits = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const options: FilterOptions = {
        search,
        status,
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        category: '',
      }
      const result = await creditService.getCredits(options)
      setCredits(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      setError(t('credits.loadError'))
    } finally {
      setLoading(false)
    }
  }, [search, status, page, limit])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  const handleQuickFilter = (value: string) => {
    setStatus(value)
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') {
      setStatus(value)
      setPage(1)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await creditService.deleteCredit(deleteTarget)
      addToast({ type: 'success', title: t('credits.deleteSuccess') })
      fetchCredits()
    } catch {
      addToast({ type: 'error', title: t('credits.deleteError') })
    }
    setDeleteTarget(null)
  }

  const openDeleteConfirm = (id: string) => {
    setDeleteTarget(id)
    setDeleteConfirmOpen(true)
  }

  const openPaymentModal = (credit: Credit) => {
    setPaymentCredit(credit)
    setPaymentAmount('')
    setPaymentMethod('cash')
    setPaymentDate(new Date().toISOString().split('T')[0])
    setPaymentNotes('')
    setPaymentModalOpen(true)
  }

  const handleRecordPayment = async () => {
    if (!paymentCredit) return
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      addToast({ type: 'error', title: t('credits.validAmount') })
      return
    }
    if (amount > paymentCredit.remainingBalance) {
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
      await creditService.addPayment(paymentCredit.id, payment)
      addToast({ type: 'success', title: t('credits.paymentRecorded') })
      setPaymentModalOpen(false)
      fetchCredits()
    } catch {
      addToast({ type: 'error', title: t('credits.paymentFailed') })
    } finally {
      setSubmitting(false)
    }
  }

  const summary = {
    totalOutstanding: credits.reduce((sum, c) => sum + c.remainingBalance, 0),
    overdueAmount: credits.filter(c => c.status === 'overdue').reduce((sum, c) => sum + c.remainingBalance, 0),
    activeCount: credits.filter(c => c.status === 'active').length,
  }

  const columns: TableColumn<Credit>[] = [
    {
      key: 'customerName',
      label: t('common.customer'),
      render: (credit) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-primary">{credit.customerName}</span>
          {credit.invoiceNumber && (
            <span className="text-xs text-text-muted">{credit.invoiceNumber}</span>
          )}
        </div>
      ),
    },
    {
      key: 'initialAmount',
      label: t('credits.initialAmount'),
      render: (credit) => `DH ${credit.initialAmount.toLocaleString()}`,
    },
    {
      key: 'paidAmount',
      label: t('credits.paidAmount'),
      render: (credit) => `DH ${credit.paidAmount.toLocaleString()}`,
    },
    {
      key: 'remainingBalance',
      label: t('credits.remainingBalance'),
      render: (credit) => (
        <span className="font-semibold">DH {credit.remainingBalance.toLocaleString()}</span>
      ),
    },
    {
      key: 'dueDate',
      label: t('credits.dueDate'),
      render: (credit) => (
        <span className={getDueDateColor(credit.dueDate)}>
          {formatDate(credit.dueDate)}
        </span>
      ),
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (credit) => <StatusBadge status={credit.status} />,
    },
    {
      key: 'progress',
      label: t('credits.progress'),
      render: (credit) => {
        const pct = credit.initialAmount > 0
          ? Math.round((credit.paidAmount / credit.initialAmount) * 100)
          : 0
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-medium text-text-muted whitespace-nowrap">{pct}%</span>
          </div>
        )
      },
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (credit) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye size={16} />}
            onClick={() => navigate(`/credits/${credit.id}`)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Wallet size={16} />}
            onClick={(e) => {
              e.stopPropagation()
              openPaymentModal(credit)
            }}
            disabled={credit.status === 'paid' || credit.status === 'cancelled'}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={16} />}
            onClick={(e) => {
              e.stopPropagation()
              openDeleteConfirm(credit.id)
            }}
          />
        </div>
      ),
    },
  ]

  return (
    <>
    <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('credits.title')}</h1>
            <p className="text-text-muted mt-1">{t('common.manageCredits')}</p>
          </div>
          <Button
            icon={<Plus size={18} />}
            onClick={() => navigate('/credits/new')}
          >
            {t('credits.newCredit')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title={t('credits.totalOutstanding')}
            value={`DH ${summary.totalOutstanding.toLocaleString()}`}
            icon={<DollarSign size={20} />}
          />
          <KPICard
            title={t('credits.overdueAmount')}
            value={`DH ${summary.overdueAmount.toLocaleString()}`}
            icon={<AlertCircle size={20} />}
          />
          <KPICard
            title={t('credits.activeCredits')}
            value={summary.activeCount}
            icon={<CheckCircle size={20} />}
          />
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {quickFilters.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => handleQuickFilter(f.value)}
                  className={clsx(
                    'px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer',
                    status === f.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-surface-secondary text-text-secondary hover:bg-surface-border',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <SearchBar
                value={search}
                onChange={handleSearchChange}
                placeholder={t('common.searchDot')}
                className="w-full sm:w-72"
              />
              <div className="w-full sm:w-44">
                <FilterBar
                  filters={statusFilters}
                  values={{ status }}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </div>
        </Card>

        {error ? (
          <Card>
            <EmptyState
              icon={<AlertCircle size={32} />}
              title={t('credits.loadError')}
              description={error}
              action={{ label: t('common.retry'), onClick: fetchCredits }}
            />
          </Card>
        ) : (
          <>
            <Table<Credit>
              columns={columns}
              data={credits}
              loading={loading}
              emptyMessage={t('credits.noCredits')}
              onRowClick={(credit) => navigate(`/credits/${credit.id}`)}
            />

            {!loading && credits.length > 0 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l)
                  setPage(1)
                }}
              />
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        title={t('credits.deleteTitle')}
        message={t('settings.deleteCreditConfirm')}
        confirmText={t('common.delete')}
        variant="danger"
      />

      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`${t('credits.recordPayment')} - ${paymentCredit?.customerName ?? ''}`}
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setPaymentModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleRecordPayment}
              loading={submitting}
              icon={<Wallet size={16} />}
            >
              {t('credits.recordPayment')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {paymentCredit && (
            <div className="grid grid-cols-3 gap-3 p-3 bg-surface-secondary rounded-lg text-sm">
              <div>
                <span className="text-text-muted">{t('common.initial')}</span>
                <p className="font-semibold">DH {paymentCredit.initialAmount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-text-muted">{t('common.paid')}</span>
                <p className="font-semibold text-green-600">DH {paymentCredit.paidAmount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-text-muted">{t('common.remaining')}</span>
                <p className="font-semibold text-primary-600">DH {paymentCredit.remainingBalance.toLocaleString()}</p>
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
