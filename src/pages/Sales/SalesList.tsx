import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Trash2, FileText } from 'lucide-react'
import type { Sale, PaginatedResult } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { SearchBar } from '@/components/ui/SearchBar'
import { FilterBar } from '@/components/ui/FilterBar'
import type { FilterConfig } from '@/components/ui/FilterBar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { saleService } from '@/services'
import { useToast } from '@/hooks/useToast'
import { useLocale } from '@/hooks/useLocale'
import { PAGINATION_DEFAULTS } from '@/constants'

export function SalesList() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { t } = useLocale()

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

  const [sales, setSales] = useState<Sale[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<number>(PAGINATION_DEFAULTS.pageSize)
  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [viewSale, setViewSale] = useState<Sale | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchSales = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result: PaginatedResult<Sale> = await saleService.getSales({
        search,
        status: statusFilter,
        category: paymentFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page,
        limit,
      })
      setSales(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      setError(t('errors.loadError'))
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, paymentFilter, page, limit])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const handleView = (sale: Sale) => {
    setViewSale(sale)
    setViewModalOpen(true)
  }

  const handleDeleteRequest = (id: string) => {
    setDeletingId(id)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingId) return
    try {
      await saleService.deleteSale(deletingId)
      showToast('success', t('sales.saleDeleted'))
      fetchSales()
    } catch {
      showToast('error', t('products.deleteError'))
    } finally {
      setDeletingId(null)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'paymentMethod') setPaymentFilter(value)
    if (key === 'status') setStatusFilter(value)
    setPage(1)
  }

  const columns: TableColumn<Sale>[] = [
    {
      key: 'invoiceNumber',
      label: t('sales.invoiceNumber'),
      render: (item) => (
        <span className="font-medium text-text-primary">{item.invoiceNumber}</span>
      ),
    },
    {
      key: 'createdAt',
      label: t('common.date'),
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      key: 'customerName',
      label: t('common.customer'),
    },
    {
      key: 'items',
      label: t('sales.itemsCount'),
      render: (item) => item.items.reduce((sum, i) => sum + i.quantity, 0),
    },
    {
      key: 'subtotal',
      label: t('common.subtotal'),
      render: (item) => `DH ${item.subtotal.toFixed(2)}`,
    },
    {
      key: 'discount',
      label: t('common.discount'),
      render: (item) => (item.discount > 0 ? `-DH ${item.discount.toFixed(2)}` : '-'),
    },
    {
      key: 'total',
      label: t('common.total'),
      render: (item) => <span className="font-semibold">DH {item.total.toFixed(2)}</span>,
    },
    {
      key: 'paymentMethod',
      label: t('common.paymentMethod'),
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
      render: (item) => (
        <div className="flex items-center gap-0.5">
          {item.status === 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<FileText size={14} className="text-blue-500" />}
              onClick={(e) => {
                e.stopPropagation()
                const invId = item.id.replace('sale-', 'inv-')
                navigate(`/invoices/${invId}`)
              }}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye size={14} />}
            onClick={(e) => { e.stopPropagation(); handleView(item) }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={14} className="text-red-500" />}
            onClick={(e) => { e.stopPropagation(); handleDeleteRequest(item.id) }}
          />
        </div>
      ),
    },
  ]

  const paymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: t('common.cash'),
      bank_transfer: t('common.bankTransfer'),
    }
    return labels[method] ?? method
  }

  return (
    <>
    <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">{t('sales.title')}</h1>
          <Button
            icon={<Plus size={16} />}
            onClick={() => navigate('/sales/new')}
          >
            {t('sales.newSale')}
          </Button>
        </div>

        <Card padding={false}>
          <div className="p-4 pb-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchBar
                value={search}
                onChange={(val) => {
                  setSearch(val)
                  setPage(1)
                }}
                placeholder={t('sales.searchInvoicePlaceholder')}
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
                action={{ label: t('common.retry'), onClick: fetchSales }}
              />
            </div>
          ) : !loading && sales.length === 0 ? (
            <EmptyState
              title={t('common.noData')}
              description={
                search || statusFilter || paymentFilter
                  ? t('common.noSearchResults')
                  : t('sales.noSales')
              }
              action={
                !search && !statusFilter && !paymentFilter
                  ? { label: t('sales.newSale'), onClick: () => navigate('/sales/new') }
                  : undefined
              }
            />
          ) : (
            <Table<Sale>
              columns={columns}
              data={sales}
              loading={loading}
              emptyMessage={t('sales.noSales')}
              onRowClick={(item) => handleView(item)}
            />
          )}

          {!loading && sales.length > 0 && (
            <div className="px-4 pb-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit)
                  setPage(1)
                }}
              />
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={t('sales.invoicePreview')}
        size="lg"
      >
        {viewSale && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-muted">{t('common.customer')}</p>
                <p className="font-medium text-text-primary">{viewSale.customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-muted">{t('common.date')}</p>
                <p className="font-medium text-text-primary">
                  {new Date(viewSale.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-text-muted font-medium">{t('common.product')}</th>
                  <th className="text-right py-2 text-text-muted font-medium">{t('common.price')}</th>
                  <th className="text-right py-2 text-text-muted font-medium">{t('common.quantity')}</th>
                  <th className="text-right py-2 text-text-muted font-medium">{t('common.total')}</th>
                </tr>
              </thead>
              <tbody>
                {viewSale.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="py-2 text-text-primary">{item.productName}</td>
                    <td className="py-2 text-right text-text-primary">DH {item.unitPrice.toFixed(2)}</td>
                    <td className="py-2 text-right text-text-primary">{item.quantity}</td>
                    <td className="py-2 text-right text-text-primary font-medium">DH {item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{t('common.subtotal')}</span>
                  <span className="text-text-primary">DH {viewSale.subtotal.toFixed(2)}</span>
                </div>
                {viewSale.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">{t('common.discount')}</span>
                    <span className="text-red-600">-DH {viewSale.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                  <span className="text-text-primary">{t('common.total')}</span>
                  <span className="text-text-primary">DH {viewSale.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">{t('common.paymentMethod')}:</span>
                <span className="text-sm font-medium capitalize text-text-primary">
                  {paymentMethodLabel(viewSale.paymentMethod)}
                </span>
              </div>
              <StatusBadge status={viewSale.status} />
            </div>

            {viewSale.notes && (
              <div>
                <p className="text-sm text-text-muted mb-1">{t('common.notes')}</p>
                <p className="text-sm text-text-primary">{viewSale.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('sales.deleteTitle')}
        message={t('settings.deleteSaleConfirm')}
        confirmText={t('common.delete')}
        variant="danger"
      />
    </>
  )
}
