import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { useLocale } from '@/hooks/useLocale'
import { Button, Card, Modal, Table, Pagination, FilterBar, EmptyState, StatusBadge, ConfirmDialog } from '@/components/ui'
import type { TableColumn, FilterConfig } from '@/components/ui'
import { productService, categoryService } from '@/services'
import { useToast } from '@/hooks'
import type { Product, Category, FilterOptions } from '@/types'
import { PAGINATION_DEFAULTS } from '@/constants'
import { Plus, Pencil, Trash2, AlertTriangle, Eye, Package } from 'lucide-react'
import { ProductForm } from './ProductForm'

export function ProductList() {
  const { t } = useLocale()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sortOptions = [
    { value: 'name', label: t('sortOptions.name') },
    { value: 'sellingPrice', label: t('sortOptions.sellingPrice') },
    { value: 'stock', label: t('sortOptions.stock') },
    { value: 'createdAt', label: t('sortOptions.createdAt') },
    { value: 'updatedAt', label: t('sortOptions.updatedAt') },
    { value: 'categoryName', label: t('sortOptions.categoryName') },
    { value: 'status', label: t('sortOptions.status') },
  ]

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: '',
    category: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: PAGINATION_DEFAULTS.pageSize,
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await productService.getProducts(filters)
      setProducts(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      setError(t('errors.loadError'))
    } finally {
      setLoading(false)
    }
  }, [filters])

  const loadCategories = useCallback(async () => {
    try {
      const result = await categoryService.getAllCategories()
      setCategories(result)
    } catch {
      // silently fail for categories
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  function handleFilterChange(key: string, value: string) {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  function handleSort(key: string) {
    setFilters(prev => ({
      ...prev,
      sortBy: key,
      sortOrder: prev.sortBy === key && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }))
  }

  function handlePageChange(page: number) {
    setFilters(prev => ({ ...prev, page }))
  }

  function handleLimitChange(limit: number) {
    setFilters(prev => ({ ...prev, limit, page: 1 }))
  }

  function openEditModal(product: Product) {
    setEditingProduct(product)
    setModalOpen(true)
  }

  async function handleSave(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    setSubmitting(true)
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, data)
        addToast({ type: 'success', title: t('products.updated') })
      } else {
        await productService.createProduct(data)
        addToast({ type: 'success', title: t('products.created') })
      }
      setModalOpen(false)
      setEditingProduct(null)
      loadProducts()
    } catch {
      addToast({ type: 'error', title: t('products.saveError') })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await productService.deleteProduct(deleteTarget.id)
      addToast({ type: 'success', title: t('products.deleted') })
      setDeleteTarget(null)
      loadProducts()
    } catch {
      addToast({ type: 'error', title: t('products.deleteError') })
    }
  }

  function getStockBadge(stock: number, minStock: number) {
    if (stock === 0) return { label: t('common.outOfStock'), color: 'text-red-600 font-semibold' }
    if (stock <= minStock) return { label: `${stock} (${t('common.low')})`, color: 'text-yellow-600 font-semibold' }
    return { label: String(stock), color: 'text-green-600 font-semibold' }
  }

  const filterConfigs: FilterConfig[] = [
    { key: 'search', label: t('common.search'), type: 'search', placeholder: t('settings.searchProducts') },
    {
      key: 'status', label: t('common.status'), type: 'select',
      options: [
        { value: 'active', label: t('status.active') },
        { value: 'inactive', label: t('status.inactive') },
        { value: 'discontinued', label: t('status.discontinued') },
      ],
    },
    {
      key: 'category', label: t('products.category'), type: 'select',
      options: categories.map(c => ({ value: c.id, label: c.name })),
    },
    {
      key: 'sortBy', label: t('common.sortBy'), type: 'select',
      options: [...sortOptions],
    },
  ]

  const columns: TableColumn<Product>[] = [
    {
      key: 'image', label: t('common.image'),
      render: (item) => (
        <ProductThumbnail src={item.image} alt={item.name} />
      ),
    },
    {
      key: 'name', label: t('common.name'), sortable: true,
      render: (item) => (
        <button
          type="button"
          onClick={() => navigate(`/products/${item.id}`)}
          className="text-left font-medium text-gray-900 hover:text-primary-600 transition-colors cursor-pointer"
        >
          {item.name}
        </button>
      ),
    },
    { key: 'categoryName', label: t('products.category'), sortable: true },
    {
      key: 'stock', label: t('common.stock'), sortable: true,
      render: (item) => {
        const badge = getStockBadge(item.stock, item.minStock)
        return <span className={badge.color}>{badge.label}</span>
      },
    },
    {
      key: 'sellingPrice', label: t('common.sellingPrice'), sortable: true,
      render: (item) => `DH ${item.sellingPrice.toFixed(2)}`,
    },
    {
      key: 'status', label: t('common.status'),
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions', label: t('common.actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<Eye size={14} />} onClick={() => navigate(`/products/${item.id}`)} title={t('common.viewDetails')} />
          <Button variant="ghost" size="sm" icon={<Pencil size={14} />} onClick={() => openEditModal(item)} />
          <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={() => setDeleteTarget(item)} className="text-red-500 hover:text-red-700" />
        </div>
      ),
    },
  ]

  const filterValues: Record<string, string> = {
    search: filters.search,
    status: filters.status,
    category: filters.category,
    sortBy: filters.sortBy,
  }

  if (error) {
    return (
      <div className="animate-fade-in">
          <EmptyState
            icon={<AlertTriangle size={48} />}
            title={t('errors.loadError')}
            description={error}
            action={{ label: t('common.retry'), onClick: loadProducts }}
          />
        </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">{t('products.title')}</h1>
          <Button icon={<Plus size={16} />} onClick={() => navigate('/products/new')}>
            {t('products.addTitle')}
          </Button>
        </div>

        <Card>
          <FilterBar filters={filterConfigs} values={filterValues} onChange={handleFilterChange} />
          <Table
            columns={columns}
            data={products}
            loading={loading}
            emptyMessage={filters.search ? t('common.noSearchResults') : t('common.noData')}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSort={handleSort}
          />
          <Pagination
            page={filters.page}
            totalPages={totalPages}
            total={total}
            limit={filters.limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </Card>

        <Modal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingProduct(null) }}
          size="2xl"
          flush
        >
          <ProductForm
            product={editingProduct ?? undefined}
            onSave={handleSave}
            onCancel={() => { setModalOpen(false); setEditingProduct(null) }}
            loading={submitting}
          />
        </Modal>

        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title={t('products.deleteTitle')}
          message={t('products.deleteConfirm', { name: deleteTarget?.name ?? '' })}
          confirmText={t('common.delete')}
          variant="danger"
        />
      </div>
  )
}

function ProductThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [imgError, setImgError] = useState(false)

  if (!src || imgError) {
    return (
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
        <Package size={20} className="text-gray-300" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-12 h-12 rounded-xl object-cover shrink-0"
      onError={() => setImgError(true)}
    />
  )
}
