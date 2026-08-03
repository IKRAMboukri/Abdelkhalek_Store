import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Eye, Trash2 } from 'lucide-react'
import type { Customer, PaginatedResult } from '@/types'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Pagination } from '@/components/ui/Pagination'
import { SearchBar } from '@/components/ui/SearchBar'
import { FilterBar } from '@/components/ui/FilterBar'
import type { FilterConfig } from '@/components/ui/FilterBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { customerService } from '@/services'
import { useToast } from '@/hooks/useToast'
import { useLocale } from '@/hooks/useLocale'
import { PAGINATION_DEFAULTS } from '@/constants'

const initialFormData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  email: '',
  phone: '',
  address: '',
  company: '',
  notes: '',
  totalPurchases: 0,
  totalSpent: 0,
  creditBalance: 0,
  status: 'active',
}

export function CustomerList() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { t } = useLocale()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<number>(PAGINATION_DEFAULTS.pageSize)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [saving, setSaving] = useState(false)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const statusFilterConfig: FilterConfig[] = [
    {
      key: 'status',
      label: t('customers.statusFilter'),
      type: 'select',
      options: [
        { value: 'active', label: t('status.active') },
        { value: 'inactive', label: t('status.inactive') },
        { value: 'blocked', label: t('customers.blocked') },
      ],
    },
  ]

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result: PaginatedResult<Customer> = await customerService.getCustomers({
        search,
        status: statusFilter,
        category: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page,
        limit,
      })
      setCustomers(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      setError(t('customers.loadError'))
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page, limit])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleAdd = () => {
    setEditingCustomer(null)
    setFormData(initialFormData)
    setModalOpen(true)
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      company: customer.company,
      notes: customer.notes,
      totalPurchases: customer.totalPurchases,
      totalSpent: customer.totalSpent,
      creditBalance: customer.creditBalance,
      status: customer.status,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, formData)
        showToast('success', t('customers.updated'))
      } else {
        await customerService.createCustomer(formData)
        showToast('success', t('customers.created'))
      }
      setModalOpen(false)
      fetchCustomers()
    } catch {
      showToast('error', t('customers.saveError'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRequest = (id: string) => {
    setDeletingId(id)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingId) return
    try {
      await customerService.deleteCustomer(deletingId)
      showToast('success', t('customers.deleted'))
      fetchCustomers()
    } catch {
      showToast('error', t('customers.deleteError'))
    } finally {
      setDeletingId(null)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') setStatusFilter(value)
    setPage(1)
  }

  const columns: TableColumn<Customer>[] = [
    {
      key: 'name',
      label: t('common.name'),
      render: (item) => (
        <span className="font-medium text-text-primary">{item.name}</span>
      ),
    },
    {
      key: 'phone',
      label: t('common.phone'),
    },
    {
      key: 'address',
      label: t('common.address'),
      render: (item) => item.address || '-',
    },
    {
      key: 'totalPurchases',
      label: t('customers.totalPurchases'),
    },
    {
      key: 'totalSpent',
      label: t('customers.totalSpentLabel'),
      render: (item) => `DH ${item.totalSpent.toFixed(2)}`,
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit size={14} />}
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(item)
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye size={14} />}
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/customers/${item.id}`)
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={14} className="text-red-500" />}
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteRequest(item.id)
            }}
          />
        </div>
      ),
    },
  ]

  return (
    <>
    <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">{t('customers.title')}</h1>
          <Button icon={<Plus size={16} />} onClick={handleAdd}>
            {t('customers.addTitle')}
          </Button>
        </div>

        <Card padding={false}>
          <div className="p-4 pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <SearchBar
                value={search}
                onChange={(val) => {
                  setSearch(val)
                  setPage(1)
                }}
                placeholder={t('customers.searchPlaceholder')}
                className="w-full sm:w-72"
              />
              <FilterBar
                filters={statusFilterConfig}
                values={{ status: statusFilter }}
                onChange={handleFilterChange}
                compact
                className="flex-1 sm:justify-end"
              />
            </div>
          </div>

          {error ? (
            <div className="p-6">
              <EmptyState
                title={t('customers.loadError')}
                description={error}
                action={{ label: t('common.retry'), onClick: fetchCustomers }}
              />
            </div>
          ) : !loading && customers.length === 0 ? (
            <EmptyState
              title={t('customers.noCustomers')}
              description={
                search || statusFilter
                  ? t('common.noSearchResults')
                  : t('customers.noCustomers')
              }
              action={
                !search && !statusFilter
                  ? { label: t('customers.addTitle'), onClick: handleAdd }
                  : undefined
              }
            />
          ) : (
            <Table<Customer>
              columns={columns}
              data={customers}
              loading={loading}
              emptyMessage={t('customers.noCustomers')}
              onRowClick={(item) => navigate(`/customers/${item.id}`)}
            />
          )}

          {!loading && customers.length > 0 && (
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCustomer ? t('customers.editTitle') : t('customers.addTitle')}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button loading={saving} onClick={handleSave}>
              {editingCustomer ? t('common.update') : t('common.create')}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label={t('common.name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="h-10"
          />
          <Input
            label={t('common.email')}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="h-10 ltr"
          />
          <Input
            label={t('common.phone')}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="h-10 ltr"
          />
          <Input
            label={t('customers.company')}
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="h-10"
          />
          <div className="sm:col-span-2">
            <Input
              label={t('common.address')}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="h-10"
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label={t('common.notes')}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="h-10"
            />
          </div>
          <div className="sm:col-span-2">
            <Select
              label={t('common.status')}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Customer['status'] })}
              options={[
                { value: 'active', label: t('status.active') },
                { value: 'inactive', label: t('status.inactive') },
                { value: 'blocked', label: t('status.blocked') },
              ]}
              className="h-10"
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('customers.deleteTitle')}
        message={t('customers.deleteConfirm')}
        confirmText={t('common.delete')}
        variant="danger"
      />
    </>
  )
}
