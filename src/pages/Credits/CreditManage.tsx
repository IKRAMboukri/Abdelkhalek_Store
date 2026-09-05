import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X, DollarSign, Calendar, Wallet, AlertCircle, ArrowLeft, FileText } from 'lucide-react'
import type { Customer, Credit, CreditPayment } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { customerService, creditService } from '@/services'
import { useToast } from '@/hooks/useToast'
import { useLocale } from '@/hooks/useLocale'
import { PAGINATION_DEFAULTS } from '@/constants'
import { Pagination } from '@/components/ui/Pagination'

export function CreditManage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { t } = useLocale()

  const [searchQuery, setSearchQuery] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loadingCustomers, setLoadingCustomers] = useState(false)

  const [credits, setCredits] = useState<Credit[]>([])
  const [loadingCredits, setLoadingCredits] = useState(false)
  const [creditsError, setCreditsError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<number>(PAGINATION_DEFAULTS.pageSize)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [initialAmount, setInitialAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [creditNotes, setCreditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentCredit, setPaymentCredit] = useState<Credit | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentNotes, setPaymentNotes] = useState('')
  const [submittingPayment, setSubmittingPayment] = useState(false)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchCustomers = useCallback(async (query: string) => {
    setLoadingCustomers(true)
    try {
      const result = await customerService.getCustomers({
        search: query,
        status: '',
        category: '',
        sortBy: 'name',
        sortOrder: 'asc',
        page: 1,
        limit: 20,
      })
      setCustomers(result.data)
      setShowDropdown(true)
    } catch {
      setCustomers([])
    } finally {
      setLoadingCustomers(false)
    }
  }, [])

  useEffect(() => {
    if (searchQuery.length >= 1) {
      const timer = setTimeout(() => searchCustomers(searchQuery), 200)
      return () => clearTimeout(timer)
    } else {
      setCustomers([])
      setShowDropdown(false)
    }
  }, [searchQuery, searchCustomers])

  const fetchCredits = useCallback(async () => {
    if (!selectedCustomer) return
    setLoadingCredits(true)
    setCreditsError(null)
    try {
      const result = await creditService.getCredits({
        search: '',
        status: '',
        category: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page,
        limit,
        customerId: selectedCustomer.id,
      })
      setCredits(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      setCreditsError(t('errors.loadError'))
    } finally {
      setLoadingCredits(false)
    }
  }, [selectedCustomer, page, limit, t])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setSearchQuery(customer.name)
    setShowDropdown(false)
    setPage(1)
  }

  const handleClearCustomer = () => {
    setSelectedCustomer(null)
    setSearchQuery('')
    setCredits([])
    setTotal(0)
    setTotalPages(0)
    setPage(1)
  }

  const handleCreateCredit = async () => {
    if (!selectedCustomer) return
    const amount = parseFloat(initialAmount)
    if (isNaN(amount) || amount <= 0) {
      showToast('error', t('credits.validAmount'))
      return
    }
    if (!dueDate) {
      showToast('error', t('common.requiredField'))
      return
    }
    setSaving(true)
    try {
      await creditService.createCredit({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        initialAmount: amount,
        paidAmount: 0,
        remainingBalance: amount,
        dueDate: new Date(dueDate).toISOString(),
        status: 'active',
        notes: creditNotes,
        payments: [],
      })
      showToast('success', t('credits.created'))
      setCreateModalOpen(false)
      setInitialAmount('')
      setDueDate('')
      setCreditNotes('')
      fetchCredits()
    } catch {
      showToast('error', t('credits.saveError'))
    } finally {
      setSaving(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!paymentCredit) return
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      showToast('error', t('credits.validAmount'))
      return
    }
    if (amount > paymentCredit.remainingBalance) {
      showToast('error', t('credits.amountExceeds'))
      return
    }
    setSubmittingPayment(true)
    try {
      await creditService.addPayment(paymentCredit.id, {
        amount,
        paymentMethod: paymentMethod as CreditPayment['paymentMethod'],
        paymentDate: new Date(paymentDate).toISOString(),
        notes: paymentNotes,
      })
      showToast('success', t('credits.paymentRecorded'))
      setPaymentModalOpen(false)
      fetchCredits()
    } catch {
      showToast('error', t('credits.paymentFailed'))
    } finally {
      setSubmittingPayment(false)
    }
  }

  const handleDeleteCredit = async () => {
    if (!deleteTarget) return
    try {
      await creditService.deleteCredit(deleteTarget)
      showToast('success', t('credits.deleteSuccess'))
      fetchCredits()
    } catch {
      showToast('error', t('credits.deleteError'))
    }
    setDeleteTarget(null)
  }

  const totalOutstanding = credits.reduce((sum, c) => sum + c.remainingBalance, 0)
  const totalPaid = credits.reduce((sum, c) => sum + c.paidAmount, 0)

  const creditColumns: TableColumn<Credit>[] = [
    {
      key: 'initialAmount',
      label: t('credits.initialAmount'),
      render: (c) => <span className="font-medium">DH {c.initialAmount.toLocaleString()}</span>,
    },
    {
      key: 'paidAmount',
      label: t('credits.paidAmount'),
      render: (c) => <span className="text-green-600 font-medium">DH {c.paidAmount.toLocaleString()}</span>,
    },
    {
      key: 'remainingBalance',
      label: t('credits.remainingBalance'),
      render: (c) => <span className="font-semibold">DH {c.remainingBalance.toLocaleString()}</span>,
    },
    {
      key: 'dueDate',
      label: t('credits.dueDate'),
      render: (c) => {
        const now = new Date().getTime()
        const due = new Date(c.dueDate).getTime()
        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
        return (
          <span className={diffDays < 0 ? 'text-red-600 font-semibold' : diffDays <= 7 ? 'text-yellow-600 font-semibold' : ''}>
            {new Date(c.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: 'progress',
      label: t('credits.progress'),
      render: (c) => {
        const pct = c.initialAmount > 0 ? Math.round((c.paidAmount / c.initialAmount) * 100) : 0
        return (
          <div className="flex items-center gap-2 min-w-[100px]">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-medium text-text-muted">{pct}%</span>
          </div>
        )
      },
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (c) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<Wallet size={16} />}
            onClick={(e) => {
              e.stopPropagation()
              setPaymentCredit(c)
              setPaymentAmount('')
              setPaymentMethod('cash')
              setPaymentDate(new Date().toISOString().split('T')[0])
              setPaymentNotes('')
              setPaymentModalOpen(true)
            }}
            disabled={c.status === 'paid' || c.status === 'cancelled'}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<DollarSign size={16} />}
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/credits/${c.id}`)
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<X size={16} className="text-red-500" />}
            onClick={(e) => {
              e.stopPropagation()
              setDeleteTarget(c.id)
              setDeleteConfirmOpen(true)
            }}
          />
        </div>
      ),
    },
  ]

  function renderCustomerSearch() {
    return (
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (selectedCustomer) setSelectedCustomer(null)
            }}
            placeholder={t('customers.searchPlaceholder')}
            className="block w-full rounded-lg border border-border bg-white pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder-text-muted transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearCustomer}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {showDropdown && customers.length > 0 && (
          <div className="absolute z-20 mt-1 w-full bg-white rounded-lg border border-border shadow-lg max-h-72 overflow-y-auto">
            {customers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectCustomer(c)}
                className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors cursor-pointer border-b border-border last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{c.name}</p>
                    <p className="text-xs text-text-muted">{c.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted">{c.phone}</p>
                    {c.creditBalance > 0 && (
                      <p className="text-xs font-medium text-primary-600">
                        {t('customers.creditBalance')}: DH {c.creditBalance.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        {showDropdown && !loadingCustomers && customers.length === 0 && searchQuery.length >= 1 && (
          <div className="absolute z-20 mt-1 w-full bg-white rounded-lg border border-border shadow-lg p-4 text-center text-sm text-text-muted">
            {t('common.noSearchResults')}
          </div>
        )}
      </div>
    )
  }

  function renderCustomerInfo() {
    if (!selectedCustomer) return null
    const c = selectedCustomer
    return (
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-lg font-bold text-primary-600">{c.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">{c.name}</h3>
              <p className="text-sm text-text-muted">{c.email} | {c.phone}</p>
              {c.company && <p className="text-sm text-text-muted">{c.company}</p>}
            </div>
          </div>
          <StatusBadge status={c.status} />
        </div>
        {c.address && (
          <p className="mt-3 text-sm text-text-muted">{c.address}</p>
        )}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-text-muted">{t('customers.totalPurchases')}</p>
            <p className="text-lg font-bold text-text-primary">{c.totalPurchases}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">{t('credits.totalOutstanding')}</p>
            <p className="text-lg font-bold text-primary-600">DH {totalOutstanding.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">{t('credits.totalPaid')}</p>
            <p className="text-lg font-bold text-green-600">DH {totalPaid.toLocaleString()}</p>
          </div>
        </div>
      </Card>
    )
  }

  function renderCreditsSection() {
    if (!selectedCustomer) return null
    return (
      <Card title={t('credits.title')} actions={
        <Button icon={<Plus size={16} />} size="sm" onClick={() => {
          setInitialAmount('')
          setDueDate('')
          setCreditNotes('')
          setCreateModalOpen(true)
        }}>
          {t('credits.newCredit')}
        </Button>
      }>
        {creditsError ? (
          <EmptyState
            icon={<AlertCircle size={32} />}
            title={t('errors.loadError')}
            description={creditsError}
            action={{ label: t('common.retry'), onClick: fetchCredits }}
          />
        ) : (
          <>
            <Table<Credit>
              columns={creditColumns}
              data={credits}
              loading={loadingCredits}
              emptyMessage={t('credits.noCredits')}
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(nextLimit) => {
                setLimit(nextLimit)
                setPage(1)
              }}
            />
          </>
        )}
      </Card>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('credits.newCredit')}</h1>
          <p className="text-text-muted mt-1">{t('common.manageCredits')}</p>
        </div>
        <Button variant="outline" icon={<ArrowLeft size={16} />} onClick={() => navigate('/credits')}>
          {t('common.back')}
        </Button>
      </div>

      {!selectedCustomer ? (
        <Card title={t('customers.searchPlaceholder')} subtitle={t('common.selectCustomerFirst')}>
          {renderCustomerSearch()}
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1">{renderCustomerSearch()}</div>
            <Button variant="ghost" size="sm" icon={<X size={16} />} onClick={handleClearCustomer}>
              {t('common.change')}
            </Button>
          </div>
          {renderCustomerInfo()}
          {renderCreditsSection()}
        </>
      )}

      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={t('credits.newCredit')}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreateCredit} loading={saving} icon={<Plus size={16} />}>
              {t('common.create')}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {selectedCustomer && (
            <div className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="font-bold text-primary-600">{selectedCustomer.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{selectedCustomer.name}</p>
                <p className="text-xs text-text-muted">{selectedCustomer.email}</p>
              </div>
            </div>
          )}
          <Input
            label={t('credits.initialAmount')}
            type="number"
            step="0.01"
            min="0"
            value={initialAmount}
            onChange={(e) => setInitialAmount(e.target.value)}
            placeholder="0.00"
            icon={<DollarSign size={16} />}
            className="h-10"
          />
          <Input
            label={t('credits.dueDate')}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            icon={<Calendar size={16} />}
            className="h-10"
          />
          <Input
            label={t('common.notes')}
            value={creditNotes}
            onChange={(e) => setCreditNotes(e.target.value)}
            placeholder={t('common.optional')}
            icon={<FileText size={16} />}
            className="h-10"
          />
        </div>
      </Modal>

      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`${t('credits.recordPayment')}${paymentCredit ? ` - ${paymentCredit.customerName}` : ''}`}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleRecordPayment} loading={submittingPayment} icon={<Wallet size={16} />}>
              {t('credits.recordPayment')}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
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
            placeholder="0.00"
            icon={<DollarSign size={16} />}
            className="h-10"
          />
          <Select
            label={t('common.paymentMethod')}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { value: 'cash', label: t('common.cash') },
              { value: 'bank_transfer', label: t('common.bankTransfer') },
            ]}
            className="h-10"
          />
          <Input
            label={t('credits.paymentDate')}
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            icon={<Calendar size={16} />}
            className="h-10"
          />
          <Input
            label={t('common.notes')}
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder={t('common.optional')}
            icon={<FileText size={16} />}
            className="h-10"
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleDeleteCredit}
        title={t('credits.deleteTitle')}
        message={t('common.deleteConfirmMessage')}
        confirmText={t('common.delete')}
        variant="danger"
      />
    </div>
  )
}
