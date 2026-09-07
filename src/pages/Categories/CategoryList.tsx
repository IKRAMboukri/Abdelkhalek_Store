import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { categoryService } from '@/services'
import { useToast } from '@/hooks'
import { useLocale } from '@/hooks/useLocale'
import type { Category, FilterOptions, PaginatedResult } from '@/types'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SearchBar } from '@/components/ui/SearchBar'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PAGINATION_DEFAULTS } from '@/constants'
import { useDebounce } from '@/hooks/useDebounce'

interface CategoryFormData {
  name: string
  description: string
  type: 'main' | 'sub'
  parentId: string
}

interface SubcategoryRow {
  id: string
  name: string
  parentId: string
  parentName: string
  productCount?: number
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
  const [subEdit, setSubEdit] = useState<{ categoryId: string; subcategoryId: string; name: string } | null>(null)
  const [subDelete, setSubDelete] = useState<{ categoryId: string; subcategoryId: string; name: string } | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const options: FilterOptions = {
        search: debouncedSearch,
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
  }, [debouncedSearch, page, limit, addToast, t])

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
    setSubEdit(null)
    setFormData(initialFormData)
    setModalOpen(true)
  }

  function handleOpenEdit(category: Category) {
    setEditingCategory(category)
    setSubEdit(null)
    setFormData({
      name: category.name,
      description: category.description,
      type: 'main',
      parentId: '',
    })
    setModalOpen(true)
  }

  function handleOpenEditSub(row: SubcategoryRow) {
    setEditingCategory(null)
    setSubEdit({ categoryId: row.parentId, subcategoryId: row.id, name: row.name })
    setFormData({
      name: row.name,
      description: '',
      type: 'sub',
      parentId: row.parentId,
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
      } else if (subEdit) {
        await categoryService.updateSubcategory(subEdit.categoryId, subEdit.subcategoryId, formData.name.trim())
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
      setSubEdit(null)
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

  async function handleDeleteSub() {
    if (!subDelete) return
    try {
      await categoryService.deleteSubcategory(subDelete.categoryId, subDelete.subcategoryId)
      addToast({ type: 'success', title: t('common.deleted'), message: t('categories.deleted') })
      setSubDelete(null)
      fetchCategories()
      loadAllCategories()
    } catch {
      addToast({ type: 'error', title: t('common.validationError'), message: t('categories.deleteError') })
    }
  }

  const columns: TableColumn<Category>[] = [
    {
      key: 'name',
      label: t('common.name'),
      render: (item) => (
        <span className="font-medium text-text-primary" translate="no">
          {item.name}
        </span>
      ),
    },
    {
      key: 'productCount',
      label: t('categories.productCount'),
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<Pencil size={14} />}
            title={t('common.edit')}
            onClick={() => handleOpenEdit(item)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={14} className="text-red-500 hover:text-red-700" />}
            title={t('common.delete')}
            onClick={() => setDeleteConfirm(item)}
          />
        </div>
      ),
    },
  ]

  const subcategoryColumns: TableColumn<SubcategoryRow>[] = [
    {
      key: 'name',
      label: t('common.name'),
      render: (item) => (
        <span className="font-medium text-text-primary" translate="no">
          {item.name}
        </span>
      ),
    },
    {
      key: 'parentName',
      label: t('categories.parentCategory'),
      render: (item) => item.parentName,
    },
    {
      key: 'productCount',
      label: t('categories.productCount'),
      render: (item) => item.productCount ?? '—',
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<Pencil size={14} />}
            title={t('common.edit')}
            onClick={() => handleOpenEditSub(item)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={14} className="text-red-500 hover:text-red-700" />}
            title={t('common.delete')}
            onClick={() => setSubDelete({ categoryId: item.parentId, subcategoryId: item.id, name: item.name })}
          />
        </div>
      ),
    },
  ]

  const subcategoryRows: SubcategoryRow[] = (allCategories.length > 0 ? allCategories : data?.data ?? []).flatMap((category) =>
    (category.subcategories ?? []).map((sub) => ({
      id: sub.id,
      name: sub.name,
      parentId: category.id,
      parentName: category.name,
      productCount: sub.productCount,
    })),
  )

  const subcategoriesSection = (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text-primary">{t('categories.subcategories')}</h2>
      <Table<SubcategoryRow>
        columns={subcategoryColumns}
        data={subcategoryRows}
        loading={loading}
        getRowKey={(item) => item.id}
        emptyMessage={t('common.noData')}
        dense
      />
    </div>
  )

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
          <>
            <Table<Category>
              columns={columns}
              data={[]}
              loading
              getRowKey={(item) => item.id}
              dense
            />
            {subcategoriesSection}
          </>
        ) : !data || data.data.length === 0 ? (
          <>
            <Card>
              <EmptyState
                icon={<Package size={32} />}
                title={t('categories.noCategories')}
                description={search ? t('common.noSearchResults') : t('categories.noCategories')}
                action={!search ? { label: t('categories.addTitle'), onClick: handleOpenAdd } : undefined}
              />
            </Card>
            {subcategoryRows.length > 0 && subcategoriesSection}
          </>
        ) : (
          <>
            <Table<Category>
              columns={columns}
              data={data.data}
              getRowKey={(item) => item.id}
              dense
            />

            {subcategoryRows.length > 0 && subcategoriesSection}

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
          title={editingCategory || subEdit ? t('categories.editTitle') : t('categories.addTitle')}
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button loading={saving} onClick={handleSave}>
                {editingCategory || subEdit ? t('common.update') : t('common.create')}
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
                      disabled={!!editingCategory || !!subEdit}
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
                disabled={!!subEdit || !allCategories.length}
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

        <ConfirmDialog
          open={subDelete !== null}
          onClose={() => setSubDelete(null)}
          onConfirm={handleDeleteSub}
          title={t('categories.deleteTitle')}
          message={t('categories.deleteConfirm', { name: subDelete?.name ?? '' })}
          confirmText={t('common.delete')}
          variant="danger"
        />
      </div>
  )
}
