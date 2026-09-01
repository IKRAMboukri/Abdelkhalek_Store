import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, ImageOff, Package } from 'lucide-react'
import { categoryService } from '@/services'
import { useToast } from '@/hooks'
import { useLocale } from '@/hooks/useLocale'
import type { Category, FilterOptions, PaginatedResult } from '@/types'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { SearchBar } from '@/components/ui/SearchBar'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { PAGINATION_DEFAULTS } from '@/constants'
import { resolveMediaUrl } from '@/utils/helpers'

interface CategoryFormData {
  name: string
  description: string
  type: 'main' | 'sub'
  parentId: string
}

const initialFormData: CategoryFormData = {
  name: '',
  description: '',
  type: 'main',
  parentId: '',
}

export function CategoryList() {
  const { addToast } = useToast()
  const { t } = useLocale()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PaginatedResult<Category> | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<number>(PAGINATION_DEFAULTS.pageSize)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData)
  const [saving, setSaving] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const options: FilterOptions = {
        search,
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
        status: '',
        category: '',
      }
      const result = await categoryService.getCategories(options)
      setData(result)
    } catch {
      addToast({ type: 'error', title: t('common.validationError'), message: t('errors.loadError') })
    } finally {
      setLoading(false)
    }
  }, [search, page, limit, addToast])

  const loadAllCategories = useCallback(async () => {
    try {
      const result = await categoryService.getAllCategories()
      setAllCategories(result)
    } catch {
      setAllCategories([])
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    loadAllCategories()
  }, [loadAllCategories])

  useEffect(() => {
    setPage(1)
  }, [search])

  function handleOpenAdd() {
    setEditingCategory(null)
    setFormData(initialFormData)
    setModalOpen(true)
  }

  function handleOpenEdit(category: Category) {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      type: 'main',
      parentId: '',
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      addToast({ type: 'error', title: t('common.validationError'), message: t('categories.validationName') })
      return
    }
    if (formData.type === 'sub' && !formData.parentId) {
      addToast({ type: 'error', title: t('common.validationError'), message: t('categories.parentRequired') })
      return
    }
    setSaving(true)
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
        })
        addToast({ type: 'success', title: t('common.updated'), message: t('categories.updated') })
      } else if (formData.type === 'main') {
        await categoryService.createCategory({
          name: formData.name.trim(),
          description: formData.description.trim(),
          productCount: 0,
        })
        addToast({ type: 'success', title: t('common.created'), message: t('categories.created') })
      } else {
        await categoryService.addSubcategory(formData.parentId, formData.name.trim())
        addToast({ type: 'success', title: t('common.created'), message: t('categories.subcategoryCreated') })
      }
      setModalOpen(false)
      fetchCategories()
      loadAllCategories()
    } catch {
      addToast({ type: 'error', title: t('common.validationError'), message: t('categories.saveError') })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return
    try {
      await categoryService.deleteCategory(deleteConfirm.id)
      addToast({ type: 'success', title: t('common.deleted'), message: t('categories.deleted') })
      setDeleteConfirm(null)
      fetchCategories()
      loadAllCategories()
    } catch (error) {
      console.error('CATEGORY DELETE ERROR:', error)
      console.error('CATEGORY DELETE ERROR MESSAGE:', error instanceof Error ? error.message : error)
      addToast({ type: 'error', title: t('common.validationError'), message: t('categories.deleteError') })
    }
  }

  function truncate(text: string, max: number): string {
    return text.length > max ? text.slice(0, max) + '...' : text
  }

  function renderSkeletons() {
    return Array.from({ length: 6 }).map((_, i) => (
      <Card key={i} className="animate-pulse" padding={false}>
        <Skeleton variant="rectangular" height="160" className="rounded-t-xl" />
        <div className="p-4 space-y-3">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" count={2} />
          <div className="flex justify-between items-center pt-2">
            <Skeleton variant="text" width="30%" />
            <div className="flex gap-2">
              <Skeleton variant="rectangular" width="2rem" height="2rem" />
              <Skeleton variant="rectangular" width="2rem" height="2rem" />
            </div>
          </div>
        </div>
      </Card>
    ))
  }

  return (
    <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('categories.title')}</h1>
            <p className="text-sm text-text-muted mt-1">
              {t('categories.organize')}
            </p>
          </div>
          <Button icon={<Plus size={18} />} onClick={handleOpenAdd}>
            {t('categories.addTitle')}
          </Button>
        </div>

        <div className="max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={t('common.search')}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderSkeletons()}
          </div>
        ) : !data || data.data.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Package size={32} />}
              title={t('categories.noCategories')}
              description={search ? t('common.noSearchResults') : t('categories.noCategories')}
              action={!search ? { label: t('categories.addTitle'), onClick: handleOpenAdd } : undefined}
            />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.data.map((category) => (
                <Card key={category.id} padding={false} className="overflow-hidden group">
                  <div className="relative h-40 bg-gray-100 dark:bg-gray-800">
                    {category.image ? (
                      <img
                        src={resolveMediaUrl(category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            const fallback = parent.querySelector('[data-fallback]') as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }
                        }}
                      />
                    ) : null}
                    <div
                      data-fallback
                      className="absolute inset-0 flex items-center justify-center text-gray-400"
                      style={{ display: category.image ? 'none' : 'flex' }}
                    >
                      <ImageOff size={40} />
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Pencil size={14} />}
                        onClick={() => handleOpenEdit(category)}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 size={14} />}
                        onClick={() => setDeleteConfirm(category)}
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-base font-semibold text-text-primary truncate" translate="no">
                        {category.name}
                      </h3>
                      <Badge variant="info" size="sm">
                        {category.productCount} {t('common.products')}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {truncate(category.description, 100)}
                    </p>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-400 mb-1.5">{t('categories.subcategories')}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {category.subcategories.map(sub => (
                            <span
                              key={sub.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
                              translate="no"
                            >
                              {sub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              limit={data.limit}
              onPageChange={setPage}
              onLimitChange={(l) => {
                setLimit(l)
                setPage(1)
              }}
            />
          </>
        )}

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCategory ? t('categories.editTitle') : t('categories.addTitle')}
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button loading={saving} onClick={handleSave}>
                {editingCategory ? t('common.update') : t('common.create')}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                {t('categories.type')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['main', 'sub'] as const).map((type) => {
                  const active = formData.type === type
                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={!!editingCategory}
                      onClick={() => setFormData({ ...formData, type })}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                        active
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 bg-gray-50/50 text-gray-500 hover:border-gray-300 hover:bg-white'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          active ? 'border-primary-500' : 'border-gray-300'
                        }`}
                      >
                        {active && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                      </span>
                      {t(type === 'main' ? 'categories.mainCategory' : 'categories.subcategory')}
                    </button>
                  )
                })}
              </div>
            </div>

            {formData.type === 'sub' && (
              <Select
                label={t('categories.parentCategory')}
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                options={allCategories.map(c => ({ value: c.id, label: c.name }))}
                placeholder={allCategories.length ? t('categories.selectParent') : t('categories.noMainCategories')}
                disabled={!allCategories.length}
              />
            )}

            <Input
              label={t('common.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('common.name')}
              required
            />

            {formData.type === 'main' && (
              <div className="w-full">
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  {t('common.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('common.description')}
                  rows={3}
                  translate="no"
                  className="block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder-text-muted transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-300 resize-none"
                />
              </div>
            )}
          </div>
        </Modal>

        <ConfirmDialog
          open={deleteConfirm !== null}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title={t('categories.deleteTitle')}
          message={t('categories.deleteConfirm', { name: deleteConfirm?.name ?? '' })}
          confirmText={t('common.delete')}
          variant="danger"
        />
      </div>
  )
}
