import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { Invoice } from '@/types'
import { Button } from '@/components/ui/Button'
import { InvoiceDocument, InvoiceActions } from '@/components/invoice'
import { invoiceService, saleService, customerService, settingsService } from '@/services'
import { useLocale } from '@/hooks/useLocale'
import { buildInvoice } from './invoiceBuilder'

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useLocale()
  const invoiceRef = useRef<HTMLDivElement | null>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        if (!id) throw new Error('No invoice ID')
        const saleId = id.replace('inv-', 'sale-')
        const sale = await saleService.getSaleById(saleId)
        if (!sale) {
          const inv = await invoiceService.getInvoiceById(id)
          if (inv) {
            setInvoice(inv)
          } else {
            setError(t('settings.invoiceNotFound'))
          }
          return
        }
        const [customers, storeSettings] = await Promise.all([
          customerService.getAllCustomers(),
          settingsService.getStoreSettings(),
        ])
        const customer = customers.find((c) => c.id === sale.customerId)
        const inv = buildInvoice(sale, storeSettings, customer)
        setInvoice(inv)
      } catch {
        setError(t('settings.failedToLoadInvoice'))
      } finally {
        setLoading(false)
      }
    }
    fetchInvoice()
  }, [id])

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="animate-fade-in text-center py-20">
        <p className="text-text-muted mb-4">{error || t('settings.invoiceNotFound')}</p>
        <Button variant="outline" onClick={() => navigate('/invoices')}>
          {t('common.back')}
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 no-print">
        <Button variant="ghost" onClick={() => navigate('/invoices')} icon={<ArrowLeft size={16} />}>
          {t('common.back')}
        </Button>
        <InvoiceActions invoiceRef={invoiceRef} invoiceNumber={invoice.invoiceNumber} />
      </div>
      <div ref={invoiceRef}>
        <InvoiceDocument invoice={invoice} />
      </div>
    </div>
  )
}
