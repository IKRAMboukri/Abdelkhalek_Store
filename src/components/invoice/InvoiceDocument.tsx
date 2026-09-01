import type { Invoice } from '@/types'
import { Building2, MapPin } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { resolveMediaUrl } from '@/utils/helpers'
import clsx from 'clsx'

interface InvoiceDocumentProps {
  invoice: Invoice
  className?: string
}

export function InvoiceDocument({ invoice, className }: InvoiceDocumentProps) {
  const { t } = useLocale()

  return (
    <div
      className={clsx('invoice-printable bg-white text-black p-8 mx-auto', 'max-w-[210mm]', className)}
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="flex items-start justify-between border-b-2 border-gray-800 pb-6 mb-6">
        <div className="flex items-center gap-4">
          {invoice.storeLogo ? (
            <img
              src={resolveMediaUrl(invoice.storeLogo)}
              alt={invoice.storeName}
              className="w-16 h-16 rounded-lg object-contain border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center">
              <Building2 size={28} className="text-primary-700" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-black">{invoice.storeName}</h1>
            {invoice.storeAddress && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <MapPin size={12} />
                <span>{invoice.storeAddress}</span>
              </div>
            )}
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              {invoice.storePhone && (
                <span>{invoice.storePhone}</span>
              )}
              {invoice.storeEmail && (
                <span>{invoice.storeEmail}</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold uppercase tracking-wider text-gray-800">{t('common.invoice')}</h2>
          <p className="text-sm text-gray-500 mt-1">{invoice.invoiceNumber}</p>
          <p className="text-sm text-gray-500">{new Date(invoice.createdAt).toLocaleDateString('en-CA')}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">{t('invoices.billTo')}</h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="font-semibold text-black">{invoice.customerName}</p>
          {invoice.customerPhone && <p className="text-sm text-gray-600 mt-1">{invoice.customerPhone}</p>}
          {invoice.customerAddress && <p className="text-sm text-gray-600 mt-1">{invoice.customerAddress}</p>}
          {invoice.notes && (
            <p className="text-sm text-gray-500 mt-2 border-t border-gray-200 pt-2">{invoice.notes}</p>
          )}
        </div>
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="text-left py-2 px-1 text-xs font-semibold uppercase tracking-wider text-gray-600 w-8">#</th>
            <th className="text-left py-2 px-1 text-xs font-semibold uppercase tracking-wider text-gray-600">{t('invoices.product')}</th>
            <th className="text-right py-2 px-1 text-xs font-semibold uppercase tracking-wider text-gray-600 w-16">{t('invoices.quantity')}</th>
            <th className="text-right py-2 px-1 text-xs font-semibold uppercase tracking-wider text-gray-600 w-24">{t('invoices.unitPrice')}</th>
            <th className="text-right py-2 px-1 text-xs font-semibold uppercase tracking-wider text-gray-600 w-24">{t('invoices.total')}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-2 px-1 text-sm text-gray-500">{idx + 1}</td>
              <td className="py-2 px-1 text-sm text-black">{item.productName}</td>
              <td className="py-2 px-1 text-sm text-right text-black">{item.quantity}</td>
              <td className="py-2 px-1 text-sm text-right text-black">DH {item.unitPrice.toFixed(2)}</td>
              <td className="py-2 px-1 text-sm text-right font-medium text-black">DH {item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{t('invoices.subtotal')}</span>
            <span>DH {invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('invoices.discount')}</span>
              <span className="text-red-600">-DH {invoice.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-2">
            <span>{t('invoices.grandTotal')}</span>
            <span>DH {invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-gray-800 pt-4 mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">{t('invoices.paymentInfo')}</h3>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{t('invoices.paymentMethod')}: {(t as (s: string) => string)(`common.${invoice.paymentMethod === 'bank_transfer' ? 'bankTransfer' : invoice.paymentMethod}`)}</span>
          <span>{t('invoices.amountPaid')}: DH {invoice.amountPaid.toFixed(2)}</span>
          {invoice.remainingBalance > 0 && (
            <span className="text-red-600">{t('invoices.balanceDue')}: DH {invoice.remainingBalance.toFixed(2)}</span>
          )}
          {invoice.remainingBalance === 0 && (
            <span className="text-green-600">{t('invoices.paidInFull')}</span>
          )}
        </div>
      </div>

      <div className="text-center border-t border-gray-200 pt-6 mt-6">
        <p className="text-base font-medium text-black">{t('invoices.thankYou')}</p>
        <p className="text-sm text-gray-500 mt-1">{t('invoices.seeYouAgain')}</p>
      </div>
    </div>
  )
}
