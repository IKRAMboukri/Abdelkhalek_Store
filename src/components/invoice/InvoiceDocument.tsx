import type { Invoice } from '@/types'
import { MapPin } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import clsx from 'clsx'

interface InvoiceDocumentProps {
  invoice: Invoice
  className?: string
}

export function InvoiceDocument({ invoice, className }: InvoiceDocumentProps) {
  const { t } = useLocale()

  return (
    <div
      className={clsx('invoice-printable bg-white text-black p-3 mx-auto', 'max-w-[210mm]', className)}
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="flex items-start justify-between border-b-2 border-gray-800 pb-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
            <img
              src="/abdelkhalek-logo.jpeg"
              alt={invoice.storeName}
              width="48"
              height="48"
              decoding="async"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-bold text-black leading-tight">{invoice.storeName}</h1>
            {invoice.storeAddress && (
              <div className="flex items-center gap-1 text-[11px] text-gray-600 mt-0.5">
                <MapPin size={9} />
                <span>{invoice.storeAddress}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-[11px] text-gray-600 mt-0.5">
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
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 leading-tight">{t('common.invoice')}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{invoice.invoiceNumber}</p>
          <p className="text-xs text-gray-500">{new Date(invoice.createdAt).toLocaleDateString('en-CA')}</p>
        </div>
      </div>

      <div className="mb-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-0.5">{t('invoices.billTo')}</h3>
        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
          <p className="font-semibold text-sm text-black">{invoice.customerName}</p>
          {invoice.customerPhone && <p className="text-xs text-gray-600 mt-0.5">{invoice.customerPhone}</p>}
          {invoice.customerAddress && <p className="text-xs text-gray-600 mt-0.5">{invoice.customerAddress}</p>}
          {invoice.notes && (
            <p className="text-xs text-gray-500 mt-1 border-t border-gray-200 pt-1">{invoice.notes}</p>
          )}
        </div>
      </div>

      <table className="w-full border-collapse mb-2">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="text-left py-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600 w-6">#</th>
            <th className="text-left py-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600">{t('invoices.product')}</th>
            <th className="text-right py-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600 w-12">{t('invoices.quantity')}</th>
            <th className="text-right py-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600 w-20">{t('invoices.unitPrice')}</th>
            <th className="text-right py-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600 w-20">{t('invoices.total')}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-1 px-1 text-xs text-gray-500">{idx + 1}</td>
              <td className="py-1 px-1 text-xs text-black">{item.productName}</td>
              <td className="py-1 px-1 text-xs text-right text-black">{item.quantity}</td>
              <td className="py-1 px-1 text-xs text-right text-black">DH {item.unitPrice.toFixed(2)}</td>
              <td className="py-1 px-1 text-xs text-right font-medium text-black">DH {item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-2">
        <div className="w-52 space-y-0.5">
          <div className="flex justify-between text-xs text-gray-600">
            <span>{t('invoices.subtotal')}</span>
            <span>DH {invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-xs text-gray-600">
              <span>{t('invoices.discount')}</span>
              <span className="text-red-600">-DH {invoice.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold border-t border-gray-300 pt-1">
            <span>{t('invoices.grandTotal')}</span>
            <span>DH {invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-gray-800 pt-2 mb-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-0.5">{t('invoices.paymentInfo')}</h3>
        <div className="flex justify-between text-xs text-gray-600">
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

      <div className="text-center border-t border-gray-200 pt-2 mt-1">
        <p className="text-sm font-medium text-black">{t('invoices.thankYou')}</p>
        <p className="text-xs text-gray-500 mt-0.5">{t('invoices.seeYouAgain')}</p>
      </div>
    </div>
  )
}
