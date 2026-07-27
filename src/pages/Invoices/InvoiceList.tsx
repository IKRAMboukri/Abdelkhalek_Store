import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Invoice, FilterOptions, PaginatedResult } from '@/types'
import { Card, Table, type TableColumn, Pagination, SearchBar, FilterBar, type FilterConfig, StatusBadge, EmptyState } from '@/components/ui'
import { invoiceService } from '@/services'
import { useLocale } from '@/hooks/useLocale'
import { PAGINATION_DEFAULTS } from '@/constants'

export function InvoiceList() {
  const navigate = useNavigate()
  const { t } = useLocale()

  const filterConfig: FilterConfig[] = [
    {
      key: 'paymentMethod',
      label: t('payments.method'),
      type: 'select',
      options: [
        { value: 'cash', label: t('common.cash') },
        { value: 'card', label: t('common.card') },
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

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const opts: FilterOptions = {
        search,
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
  }, [search, statusFilter, paymentFilter, page, limit])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'paymentMethod') setPaymentFilter(value)
    if (key === 'status') setStatusFilter(value)
    setPage(1)
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
          card: t('common.card'),
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
  ]

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{t('invoices.title')}</h1>
      </div>

      <Card padding={false}>
        <div className="p-4 pb-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
              value={search}
              onChange={(val) => { setSearch(val); setPage(1) }}
              placeholder={t('invoices.searchPlaceholder')}
              className="flex-1"
            />
            <FilterBar
              filters={filterConfig}
              values={{ paymentMethod: paymentFilter, status: statusFilter }}
              onChange={handleFilterChange}
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
          <Table<Invoice>
            columns={columns}
            data={invoices}
            loading={loading}
            emptyMessage={t('invoices.noInvoices')}
            onRowClick={(item) => navigate(`/invoices/${item.id}`)}
          />
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
    </div>
  )
}
