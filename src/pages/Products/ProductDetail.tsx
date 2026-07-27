import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Tag, DollarSign, Package, Hash, Barcode, Calendar, Clock, Edit, Trash2, ShoppingCart } from 'lucide-react'
import type { Product } from '@/types'
import { Button, Card, EmptyState, StatusBadge, ConfirmDialog } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'
import { useToast } from '@/hooks'
import { productService } from '@/services'

function ProductImage({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) {
  const [imgError, setImgError] = useState(false)

  if (!src || imgError) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <Package size={48} className="text-gray-300" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setImgError(true)}
    />
  )
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useLocale()
  const { addToast } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    productService.getProductById(id)
      .then((data) => {
        if (!data) {
          setError(t('products.notFound'))
          return
        }
        setProduct(data)
      })
      .catch(() => setError(t('errors.loadError')))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!id) return
    try {
      await productService.deleteProduct(id)
      addToast({ type: 'success', title: t('products.deleted') })
      navigate('/products')
    } catch {
      addToast({ type: 'error', title: t('products.deleteError') })
    }
  }

  function getStockInfo(stock: number, minStock: number) {
    if (stock === 0) return { label: t('common.outOfStock'), color: 'text-red-600', bg: 'bg-red-50 border-red-200' }
    if (stock <= minStock) return { label: `${stock} - ${t('common.low')}`, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' }
    return { label: `${stock} - ${t('common.inStock')}`, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' }
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
          <div className="lg:col-span-2">
            <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="animate-fade-in">
        <Button
          variant="ghost"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/products')}
          className="mb-4"
        >
          {t('common.backToProducts')}
        </Button>
        <EmptyState
          icon={<Package size={48} />}
          title={t('products.notFoundTitle')}
          description={error || t('products.notFound')}
          action={{ label: t('common.backToProducts'), onClick: () => navigate('/products') }}
        />
      </div>
    )
  }

  const stockInfo = getStockInfo(product.stock, product.minStock)
  const isPdf = product.image?.startsWith('data:application/pdf')

  const detailItems = [
    { icon: <Tag size={16} />, label: t('products.category'), value: product.categoryName },
    { icon: <ShoppingCart size={16} />, label: t('common.unit'), value: t(`units.${product.unit}`) || product.unit },
    { icon: <DollarSign size={16} />, label: t('common.purchasePrice'), value: `DH ${product.purchasePrice.toFixed(2)}` },
    { icon: <DollarSign size={16} />, label: t('common.sellingPrice'), value: `DH ${product.sellingPrice.toFixed(2)}` },
    { icon: <Package size={16} />, label: t('common.stock'), value: `${product.stock}` },
    { icon: <Hash size={16} />, label: t('common.minStock'), value: `${product.minStock}` },
    { icon: <Barcode size={16} />, label: t('common.barcode'), value: product.barcode || '-' },
    { icon: <Calendar size={16} />, label: t('common.created'), value: new Date(product.createdAt).toLocaleDateString() },
    { icon: <Clock size={16} />, label: t('common.updated'), value: new Date(product.updatedAt).toLocaleDateString() },
  ]

  return (
    <div className="animate-fade-in">
      <Button
        variant="ghost"
        icon={<ArrowLeft size={16} />}
        onClick={() => navigate('/products')}
        className="mb-4"
      >
        {t('common.backToProducts')}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card padding={false} className="overflow-hidden">
            <div className="aspect-square w-full bg-gray-50">
              {isPdf ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                  <Package size={64} className="mb-3" />
                  <span className="text-sm">PDF Document</span>
                </div>
              ) : (
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full"
                />
              )}
            </div>
          </Card>

          <Card>
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-text-primary mb-1">{product.name}</h2>
              <StatusBadge status={product.status} />
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <span className="text-sm text-text-muted">{t('common.sellingPrice')}</span>
                <span className="text-xl font-bold text-primary-600">DH {product.sellingPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <span className="text-sm text-text-muted">{t('common.purchasePrice')}</span>
                <span className="text-lg font-semibold text-text-primary">DH {product.purchasePrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
                <span className="text-sm text-text-muted">{t('common.stock')}</span>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${stockInfo.bg} ${stockInfo.color}`}>
                  {stockInfo.label}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                icon={<Edit size={14} />}
                onClick={() => navigate('/products')}
                className="flex-1"
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="outline"
                icon={<Trash2 size={14} />}
                onClick={() => setDeleteTarget(true)}
                className="flex-1 !text-red-600 !border-red-200 hover:!bg-red-50"
              >
                {t('common.delete')}
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card title={t('common.productDetails')}>
            {product.description ? (
              <p className="text-sm text-text-secondary leading-relaxed mb-6">{product.description}</p>
            ) : (
              <p className="text-sm text-text-muted italic mb-6">{t('common.noDescription')}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {detailItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-text-muted mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-text-primary truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title={t('common.image')}>
            {product.image ? (
              isPdf ? (
                <div className="flex items-center justify-center h-48 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-center text-gray-400">
                    <Package size={32} className="mx-auto mb-2" />
                    <p className="text-sm">PDF Document</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    className="w-full max-h-96"
                  />
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                <div className="text-center text-gray-400">
                  <Package size={32} className="mx-auto mb-2" />
                  <p className="text-sm">{t('common.noImage')}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={deleteTarget}
        onClose={() => setDeleteTarget(false)}
        onConfirm={handleDelete}
        title={t('products.deleteTitle')}
        message={t('products.deleteConfirm', { name: product.name })}
        confirmText={t('common.delete')}
        variant="danger"
      />
    </div>
  )
}
