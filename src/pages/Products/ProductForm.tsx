import { useState, useEffect, useRef } from 'react'
import { useLocale } from '@/hooks/useLocale'
import type { Product, SelectOption } from '@/types'
import { categoryService } from '@/services'
import { Button, Input, Select, Textarea } from '@/components/ui'
import { Package, DollarSign, Hash, FileText, Tag, ArrowLeft, AlertTriangle, CheckCircle2, Upload, X } from 'lucide-react'

interface ProductFormProps {
  product?: Product
  onSave: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  loading?: boolean
  layout?: 'modal' | 'page'
}

interface FormErrors {
  name?: string
  categoryId?: string
  purchasePrice?: string
  sellingPrice?: string
  stock?: string
  minStock?: string
  unit?: string
}

export function ProductForm({ product, onSave, onCancel, loading = false, layout = 'modal' }: ProductFormProps) {
  const { t } = useLocale()

  const productUnits: SelectOption[] = [
    { value: 'piece', label: t('units.piece') },
    { value: 'set', label: t('units.set') },
    { value: 'meter', label: t('units.meter') },
    { value: 'square_meter', label: t('units.squareMeter') },
    { value: 'kg', label: t('units.kg') },
    { value: 'liter', label: t('units.liter') },
    { value: 'box', label: t('units.box') },
    { value: 'pair', label: t('units.pair') },
  ]

  const [categories, setCategories] = useState<SelectOption[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [imageFileName, setImageFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    purchasePrice: '',
    sellingPrice: '',
    stock: '',
    minStock: '',
    unit: 'piece',
    status: 'active' as string,
    barcode: '',
    image: '',
    categoryName: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    async function loadCategories() {
      setCategoriesLoading(true)
      try {
        const result = await categoryService.getAllCategories()
        setCategories(result.map(c => ({ value: c.id, label: c.name })))
      } catch {
        setCategories([])
      } finally {
        setCategoriesLoading(false)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        purchasePrice: String(product.purchasePrice),
        sellingPrice: String(product.sellingPrice),
        stock: String(product.stock),
        minStock: String(product.minStock),
        unit: product.unit,
        status: product.status,
        barcode: product.barcode,
        image: product.image,
        categoryName: product.categoryName,
      })
      setImageFileName(product.image ? (product.image.startsWith('data:application/pdf') ? 'product-document.pdf' : 'product-image') : '')
    }
  }, [product])

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp', 'image/tiff', 'application/pdf']

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!acceptedTypes.includes(file.type)) return

    setImageFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setFormData(prev => ({ ...prev, image: result }))
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveImage() {
    setImageFileName('')
    setFormData(prev => ({ ...prev, image: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) newErrors.name = t('products.nameRequired')
    if (!formData.categoryId) newErrors.categoryId = t('common.requiredField')

    const pp = parseFloat(formData.purchasePrice)
    if (!formData.purchasePrice || isNaN(pp) || pp <= 0) newErrors.purchasePrice = t('products.pricePositive')

    const sp = parseFloat(formData.sellingPrice)
    if (!formData.sellingPrice || isNaN(sp) || sp <= 0) newErrors.sellingPrice = t('products.pricePositive')

    const stock = parseInt(formData.stock, 10)
    if (formData.stock === '' || isNaN(stock) || stock < 0) newErrors.stock = t('products.stockPositive')

    const minStock = parseInt(formData.minStock, 10)
    if (formData.minStock === '' || isNaN(minStock) || minStock < 0) newErrors.minStock = t('products.minStockPositive')

    if (!formData.unit) newErrors.unit = t('products.unitRequired')

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const selectedCategory = categories.find(c => c.value === formData.categoryId)

    onSave({
      name: formData.name.trim(),
      description: formData.description.trim(),
      categoryId: formData.categoryId,
      categoryName: selectedCategory?.label ?? formData.categoryName,
      purchasePrice: parseFloat(formData.purchasePrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      stock: parseInt(formData.stock, 10),
      minStock: parseInt(formData.minStock, 10),
      unit: formData.unit,
      status: formData.status as 'active' | 'inactive' | 'discontinued',
      barcode: formData.barcode.trim(),
      image: formData.image.trim(),
    })
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="md:col-span-2">
          <Input
            label={t('products.productName')}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            placeholder={t('settings.productNamePlaceholder')}
            disabled={loading}
            icon={<Tag size={16} />}
          />
        </div>

        <Select
          label={t('products.category')}
          value={formData.categoryId}
          onChange={(e) => handleChange('categoryId', e.target.value)}
          options={categories}
          placeholder={categoriesLoading ? t('common.loading') : t('common.allCategories')}
          error={errors.categoryId}
          disabled={loading || categoriesLoading}
        />

        <Select
          label={t('common.unit')}
          value={formData.unit}
          onChange={(e) => handleChange('unit', e.target.value)}
          options={productUnits}
          error={errors.unit}
          disabled={loading}
        />

        <Input
          label={t('common.purchasePrice')}
          type="number"
          step="0.01"
          min="0"
          value={formData.purchasePrice}
          onChange={(e) => handleChange('purchasePrice', e.target.value)}
          error={errors.purchasePrice}
          placeholder="0.00"
          disabled={loading}
          icon={<DollarSign size={16} />}
        />

        <Input
          label={t('common.sellingPrice')}
          type="number"
          step="0.01"
          min="0"
          value={formData.sellingPrice}
          onChange={(e) => handleChange('sellingPrice', e.target.value)}
          error={errors.sellingPrice}
          placeholder="0.00"
          disabled={loading}
          icon={<DollarSign size={16} />}
        />

        <Input
          label={`${t('common.stock')} *`}
          type="number"
          min="0"
          value={formData.stock}
          onChange={(e) => handleChange('stock', e.target.value)}
          error={errors.stock}
          placeholder="0"
          disabled={loading}
          icon={<Package size={16} />}
        />

        <Input
          label={t('common.minStock')}
          type="number"
          min="0"
          value={formData.minStock}
          onChange={(e) => handleChange('minStock', e.target.value)}
          error={errors.minStock}
          placeholder="0"
          disabled={loading}
          icon={<Hash size={16} />}
        />

        <div className="md:col-span-2">
          <Textarea
            label={t('common.description')}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder={t('settings.descriptionPlaceholder')}
            disabled={loading}
            rows={3}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.image')}</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif,.svg,.bmp,.tiff,.pdf,image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/bmp,image/tiff,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />
          {formData.image ? (
            <div className="flex items-center gap-3 h-12 px-4 rounded-xl border border-gray-200 bg-gray-50/50">
              {formData.image.startsWith('data:application/pdf') ? (
                <FileText size={16} className="text-red-500 shrink-0" />
              ) : (
                <img src={formData.image} alt="" className="h-8 w-8 rounded-lg object-cover shrink-0" />
              )}
              <span className="flex-1 text-sm text-gray-900 truncate">{imageFileName || 'document'}</span>
              <span className="text-xs text-gray-400 shrink-0">{formData.image.startsWith('data:application/pdf') ? 'PDF' : 'Image'}</span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                disabled={loading}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full h-12 flex items-center gap-3 px-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Upload size={16} className="text-primary-500 shrink-0" />
              <span className="flex-1 text-left text-sm text-gray-400">{t('common.image')}</span>
              <span className="text-xs text-gray-400 shrink-0">Image / PDF</span>
            </button>
          )}
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2.5">
          <AlertTriangle size={16} className="shrink-0 text-red-500" />
          <span>{t('products.fixErrors')}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={onCancel} disabled={loading} type="button" className="!rounded-xl">
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={loading} icon={!loading ? <CheckCircle2 size={16} /> : undefined} className="!rounded-xl">
          {product ? t('common.update') : t('common.create')}
        </Button>
      </div>
    </form>
  )

  const isPage = layout === 'page'

  if (isPage) {
    return (
      <div className="animate-fade-in w-full max-w-5xl mx-auto">
        <div className="mb-6">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-150 cursor-pointer group"
          >
            <ArrowLeft size={16} className="transition-transform duration-150 group-hover:-translate-x-0.5" />
            {t('common.backToProducts')}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                <Package size={18} className="text-primary-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                  {product ? t('products.editTitle') : t('products.addTitle')}
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {t('settings.fillProductInfo')}
                </p>
              </div>
            </div>
          </div>
          <div className="px-8 py-8">
            {formContent}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <Package size={18} className="text-primary-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                {product ? t('products.editTitle') : t('products.addTitle')}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {t('settings.fillProductInfo')}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="px-8 py-8">
          {formContent}
        </div>
      </div>
    </div>
  )
}
