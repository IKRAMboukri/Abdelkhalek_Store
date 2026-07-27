import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks'
import { useLocale } from '@/hooks/useLocale'
import { productService } from '@/services'
import { ProductForm } from './ProductForm'

export function AddProduct() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { t } = useLocale()

  async function handleSave(data: Parameters<typeof productService.createProduct>[0]) {
    try {
      await productService.createProduct(data)
      addToast({ type: 'success', title: t('settings.productCreated') })
      navigate('/products')
    } catch {
      addToast({ type: 'error', title: t('settings.failedToSaveProduct') })
    }
  }

  return (
    <ProductForm
      onSave={handleSave}
      onCancel={() => navigate('/products')}
      layout="page"
    />
  )
}
