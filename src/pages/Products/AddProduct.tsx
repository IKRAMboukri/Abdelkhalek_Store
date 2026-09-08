import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks'
import { useLocale } from '@/hooks/useLocale'
import { productService } from '@/services'
import { ProductForm } from './ProductForm'

export function AddProduct() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { t } = useLocale()
  const [submitting, setSubmitting] = useState(false)
  const busyRef = useRef(false)

  async function handleSave(data: Parameters<typeof productService.createProduct>[0]) {
    if (busyRef.current) return
    busyRef.current = true
    setSubmitting(true)
    try {
      await productService.createProduct(data)
      addToast({ type: 'success', title: t('settings.productCreated') })
      navigate('/products')
    } catch {
      addToast({ type: 'error', title: t('settings.failedToSaveProduct') })
      busyRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <ProductForm
      onSave={handleSave}
      onCancel={() => navigate('/products')}
      layout="page"
      loading={submitting}
    />
  )
}