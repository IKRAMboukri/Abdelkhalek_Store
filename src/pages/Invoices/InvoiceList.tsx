import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import type { Invoice, Payment, FilterOptions, PaginatedResult } from '@/types'
import { Button, Card, Table, type TableColumn, Pagination, SearchBar, FilterBar, type FilterConfig, StatusBadge, EmptyState } from '@/components/ui'
import { InvoicePaymentModal } from '@/components/invoice/InvoicePaymentModal'
import { invoiceService, paymentService } from '@/services'
import { useToast } from '@/hooks/useToast'
import { useLocale } from '@/hooks/useLocale'
import { PAGINATION_DEFAULTS } from '@/constants'
import { useDebounce } from '@/hooks/useDebounce'

export function InvoiceList() {
  const navigate = useNavigate()
  const { t } = useLocale()
  const { addToast } = useToast()

  const filterConfig: FilterConfig[] = [
    {
      key: 'paymentMethod',
      label: t('payments.method'),
      type: 'select',
      options: [
        { value: 'cash', label: t('common.cash') },
        { value: 'bank_transfer', label: t('common.bankTransfer') },
      ],
    },
    {
      key: 'status',
      label: t('common.status'),
      type: 'select',
      options: [
        { value: 'completed', label: t('status.completed') },
        { value: 'pending', label: t('status.pending') },
        { value: 'cancelled', label: t('status.cancelled') },
        { value: 'refunded', label: t('status.refunded') },
      ],
    },
  ]

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<number>(PAGINATION_DEFAULTS.pageSize)
  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const debouncedSearch = useDebounce(search, 300)

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const opts: FilterOptions = {
        search: debouncedSearch,
        status: statusFilter,
        category: paymentFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page,
        limit,
      }
      const result: PaginatedResult<Invoice> = await invoiceService.getInvoices(opts)
      setInvoices(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      setError(t('settings.failedToLoadInvoices'))
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, statusFilter, paymentFilter, page, limit, t])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'paymentMethod') setPaymentFilter(value)
    if (key === 'status') setStatusFilter(value)
    setPage(1)
  }

  const openPaymentModal = (invoice: Invoice) => {
    setPaymentInvoice(invoice)
    setPaymentHistory([])
    setPaymentModalOpen(true)
    setHistoryLoading(true)
    paymentService
      .getPaymentsBySale(invoice.saleId)
      .then(setPaymentHistory)
      .catch(() => setPaymentHistory([]))
      .finally(() => setHistoryLoading(false))
  }

  const handleRecordPayment = async ({ amount, method }: { amount: number; method: 'cash' | 'bank_transfer' }) => {
    if (!paymentInvoice) return
    setSubmitting(true)
    try {
      await paymentService.createPayment({
        saleId: paymentInvoice.saleId,
        invoiceNumber: paymentInvoice.invoiceNumber,
        customerId: paymentInvoice.customerId,
        customerName: paymentInvoice.customerName,
        amount,
        method,
        status: 'completed',
        reference: '',
        notes: '',
      })
      addToast({ type: 'success', title: t('credits.paymentRecorded') })
      setPaymentModalOpen(false)
      setPaymentInvoice(null)
      fetchInvoices()
    } catch {
      addToast({ type: 'error', title: t('credits.paymentFailed') })
    } finally {
      setSubmitting(false)
    }
  }

  const columns: TableColumn<Invoice>[] = [
    {
      key: 'invoiceNumber',
      label: t('invoices.invoiceNumber'),
      render: (item) => (
        <span className="font-medium text-text-primary">{item.invoiceNumber}</span>
      ),
    },
    {
      key: 'createdAt',
      label: t('invoices.invoiceDate'),
      render: (item) => new Date(item.createdAt).toLocaleDateString('en-CA'),
    },
    {
      key: 'customerName',
      label: t('common.customer'),
    },
    {
      key: 'total',
      label: t('common.total'),
      render: (item) => <span className="font-semibold">DH {item.total.toFixed(2)}</span>,
    },
    {
      key: 'paymentMethod',
      label: t('invoices.paymentMethod'),
      render: (item) => {
        const labels: Record<string, string> = {
          cash: t('common.cash'),
          bank_transfer: t('common.bankTransfer'),
        }
        return <span className="capitalize">{labels[item.paymentMethod] ?? item.paymentMethod}</span>
      },
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (item) =>
        item.remainingBalance > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            icon={<Wallet size={16} />}
            onClick={(e) => {
              e.stopPropagation()
              openPaymentModal(item)
            }}
          >
            {t('invoices.addPayment')}
          </Button>
        ) : (
          <span className="text-xs text-text-muted">{t('invoices.paidInFull')}</span>
        ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{t('invoices.title')}</h1>
      </div>

      <Card padding={false}>
        <div className="px-4 pt-3 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <SearchBar
              value={search}
              onChange={(val) => { setSearch(val); setPage(1) }}
              placeholder={t('invoices.searchPlaceholder')}
              className="w-full sm:w-72"
            />
            <FilterBar
              filters={filterConfig}
              values={{ paymentMethod: paymentFilter, status: statusFilter }}
              onChange={handleFilterChange}
              compact
              className="flex-1 sm:justify-end"
            />
          </div>
        </div>

        {error ? (
          <div className="p-6">
            <EmptyState
              title={t('errors.loadError')}
              description={error}
              action={{ label: t('common.retry'), onClick: fetchInvoices }}
            />
          </div>
        ) : !loading && invoices.length === 0 ? (
          <EmptyState
            title={t('common.noData')}
            description={t('invoices.noInvoices')}
          />
        ) : (
          <div className="mx-4">
            <Table<Invoice>
              columns={columns}
              data={invoices}
              loading={loading}
              emptyMessage={t('invoices.noInvoices')}
              onRowClick={(item) => navigate(`/invoices/${item.id}`)}
              dense
            />
          </div>
        )}

        {!loading && invoices.length > 0 && (
          <div className="px-4 pb-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1) }}
            />
          </div>
        )}
      </Card>

      <InvoicePaymentModal
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false)
          setPaymentInvoice(null)
        }}
        onConfirm={handleRecordPayment}
        total={paymentInvoice?.total ?? 0}
        paid={paymentInvoice?.amountPaid ?? 0}
        remaining={paymentInvoice?.remainingBalance ?? 0}
        title={`${t('invoices.addPayment')} - ${paymentInvoice?.invoiceNumber ?? ''}`}
        history={paymentHistory}
        historyLoading={historyLoading}
        loading={submitting}
      />
    </div>
  )
}
