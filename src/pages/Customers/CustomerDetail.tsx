import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Building, ShoppingBag } from 'lucide-react'
import type { Customer, Sale, Credit } from '@/types'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { useLocale } from '@/hooks/useLocale'
import { customerService, saleService, creditService } from '@/services'

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [credits, setCredits] = useState<Credit[]>([])
  const [loading, setLoading] = useState(true)
  const [salesLoading, setSalesLoading] = useState(true)
  const [creditsLoading, setCreditsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'purchases' | 'credits'>('purchases')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    customerService.getCustomerById(id)
      .then((data) => {
        if (!data) {
          setError(t('customers.customerNotFound'))
          return
        }
        setCustomer(data)
      })
      .catch(() => setError(t('errors.loadError')))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    setSalesLoading(true)
    saleService.getSalesByCustomer(id)
      .then(setSales)
      .catch(() => setSales([]))
      .finally(() => setSalesLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    setCreditsLoading(true)
    creditService.getCreditsByCustomer(id)
      .then(setCredits)
      .catch(() => setCredits([]))
      .finally(() => setCreditsLoading(false))
  }, [id])

  const { t } = useLocale()

  const saleColumns: TableColumn<Sale>[] = [
    { key: 'invoiceNumber', label: t('common.invoice') },
    {
      key: 'createdAt',
      label: t('common.date'),
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      key: 'items',
      label: t('common.items'),
      render: (item) => item.items.reduce((sum, i) => sum + i.quantity, 0),
    },
    {
      key: 'total',
      label: t('common.total'),
      render: (item) => `DH ${item.total.toFixed(2)}`,
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (item) => <StatusBadge status={item.status} />,
    },
  ]

  const creditColumns: TableColumn<Credit>[] = [
    {
      key: 'invoiceNumber',
      label: t('common.invoice'),
      render: (item) => item.invoiceNumber || '-',
    },
    {
      key: 'initialAmount',
      label: t('common.amount'),
      render: (item) => `DH ${item.initialAmount.toFixed(2)}`,
    },
    {
      key: 'paidAmount',
      label: t('common.paid'),
      render: (item) => `DH ${item.paidAmount.toFixed(2)}`,
    },
    {
      key: 'remainingBalance',
      label: t('common.remaining'),
      render: (item) => (
        <span className="font-medium">DH {item.remainingBalance.toFixed(2)}</span>
      ),
    },
    {
      key: 'dueDate',
      label: t('credits.dueDate'),
      render: (item) => new Date(item.dueDate).toLocaleDateString(),
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (item) => <StatusBadge status={item.status} />,
    },
  ]

  if (loading) {
    return (
      <div className="animate-fade-in">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
            </div>
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="animate-fade-in">
          <Button
            variant="ghost"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate('/customers')}
            className="mb-4"
          >
            {t('common.backToCustomers')}
          </Button>
          <EmptyState
            title={t('customers.customerNotFound')}
            description={error || t('customers.customerNotFoundDesc')}
            action={{ label: t('common.goToCustomers'), onClick: () => navigate('/customers') }}
          />
        </div>
    )
  }

  return (
      <div className="animate-fade-in">
        <Button
          variant="ghost"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/customers')}
          className="mb-4"
        >
          {t('common.backToCustomers')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-text-primary">{customer.name}</h2>
                <div className="mt-2">
                  <StatusBadge status={customer.status} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <Mail size={16} />
                  <span>{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <Phone size={16} />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.company && (
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <Building size={16} />
                    <span>{customer.company}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <MapPin size={16} />
                    <span>{customer.address}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 mt-6 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-text-muted mb-1">
                    <ShoppingBag size={14} />
                    <span>{t('customers.purchases')}</span>
                  </div>
                  <p className="text-xl font-bold text-text-primary">{customer.totalPurchases}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card padding={false}>
              <div className="border-b border-border">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setActiveTab('purchases')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'purchases'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {t('customers.purchaseHistory')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('credits')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'credits'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {t('customers.creditsTab')}
                  </button>
                </div>
              </div>

              <div className="p-4">
                {activeTab === 'purchases' && (
                  salesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : sales.length === 0 ? (
                    <EmptyState
                      title={t('customers.noPurchaseHistory')}
                      description={t('customers.noPurchaseHistoryDesc')}
                    />
                  ) : (
                    <Table<Sale>
                      columns={saleColumns}
                      data={sales}
                      emptyMessage={t('settings.noPurchasesFound')}
                    />
                  )
                )}

                {activeTab === 'credits' && (
                  creditsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : credits.length === 0 ? (
                    <EmptyState
                      title={t('customers.noCreditHistory')}
                      description={t('customers.noCreditHistoryDesc')}
                    />
                  ) : (
                    <Table<Credit>
                      columns={creditColumns}
                      data={credits}
                      emptyMessage={t('settings.noCreditsFound')}
                    />
                  )
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
  )
}
