import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Trash2, Minus, ShoppingCart, User, Printer } from 'lucide-react'
import type { Customer, Product, StoreSettings, SaleItem, Invoice } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { saleService, productService, customerService, settingsService } from '@/services'
import { InvoiceDocument } from '@/components/invoice'
import { CustomerFormModal } from '@/components/customers/CustomerFormModal'
import { useToast } from '@/hooks/useToast'
import { useLocale } from '@/hooks/useLocale'


interface CartItem extends SaleItem {
  productId: string
}

// Runtime marker: lets you verify in DevTools that the browser is executing
// this exact build of the page.
console.info('[NewSale] runtime v3 — derived totals active')

// Single source of truth for money math: every amount shown or sent is
// derived from unitPrice x quantity at read time, so it can never go stale.
function toMoney(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[\s'’]/g, '').replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function lineTotal(item: Pick<CartItem, 'unitPrice' | 'quantity'>): number {
  const unitPrice = toMoney(item.unitPrice)
  const quantity = Number(item.quantity)
  if (!Number.isFinite(quantity)) return 0
  return Math.round(unitPrice * quantity * 100) / 100
}

function sumSubtotal(items: Array<Pick<CartItem, 'unitPrice' | 'quantity'>>): number {
  return Math.round(items.reduce((sum, item) => sum + lineTotal(item), 0) * 100) / 100
}

export function NewSale() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { t } = useLocale()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash')
  const [notes, setNotes] = useState('')

  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')

  const [addClientOpen, setAddClientOpen] = useState(false)

  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    Promise.all([
      customerService.getAllCustomers(),
      productService.getAllProducts(),
      settingsService.getStoreSettings(),
    ])
      .then(([custs, prods, set]) => {
        setCustomers(custs)
        setProducts(prods)
        setSettings(set)
      })
      .catch(() => {
        showToast('error', t('errors.loadError'))
      })
      .finally(() => setLoading(false))
  }, [showToast])

  const filteredProducts = useMemo(() => {
    if (!productSearchTerm) return products
    const s = productSearchTerm.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.barcode.toLowerCase().includes(s) ||
        p.categoryName.toLowerCase().includes(s),
    )
  }, [products, productSearchTerm])

  const filteredCustomers = useMemo(() => {
    if (!customerSearchTerm) return customers
    const s = customerSearchTerm.toLowerCase()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.company.toLowerCase().includes(s),
    )
  }, [customers, customerSearchTerm])

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId],
  )

  const handleClientCreated = (customer: Customer) => {
    setCustomers((prev) => [customer, ...prev])
    setSelectedCustomerId(customer.id)
    setCustomerSearchTerm('')
  }

  const addProductToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) => {
          if (item.productId !== product.id) return item
          const quantity = item.quantity + 1
          return { ...item, quantity, total: lineTotal({ ...item, quantity }) }
        })
      }
      const unitPrice = toMoney(product.sellingPrice)
      const next = [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice,
          total: lineTotal({ unitPrice, quantity: 1 }),
        },
      ]
      return next
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity < 1) return
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item
        const next = { ...item, quantity }
        return { ...next, total: lineTotal(next) }
      }),
    )
  }

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const subtotal = useMemo(() => sumSubtotal(cartItems), [cartItems])

  const total = useMemo(() => {
    const afterDiscount = Math.round((subtotal - toMoney(discount)) * 100) / 100
    return afterDiscount > 0 ? afterDiscount : 0
  }, [subtotal, discount])

  const currencySymbol = settings?.currencySymbol ?? 'DH'

  const validate = (totalValue: number): string | null => {
    if (!selectedCustomerId) return t('sales.customerRequired')
    if (cartItems.length === 0) return t('sales.itemsRequired')
    if (!(totalValue > 0)) return t('sales.totalMustBePositive')
    return null
  }

  const handleCompleteSale = async () => {
    // Recompute everything from the cart at call time — no stale totals.
    const itemsWithTotals = cartItems.map((item) => ({ ...item, total: lineTotal(item) }))
    const freshSubtotal = sumSubtotal(cartItems)
    const freshDiscount = toMoney(discount)
    const afterDiscount = Math.round((freshSubtotal - freshDiscount) * 100) / 100
    const freshTotal = afterDiscount > 0 ? afterDiscount : 0

    const validationError = validate(freshTotal)
    if (validationError) {
      showToast('error', validationError)
      return
    }

    setSubmitting(true)
    try {
      const saleData = {
        customerId: selectedCustomerId,
        customerName: selectedCustomer?.name ?? '',
        items: itemsWithTotals,
        subtotal: freshSubtotal,
        discount: freshDiscount,
        total: freshTotal,
        invoiceNumber: 'INV-TEMP-' + Date.now(),
        paymentMethod,
        notes,
        status: 'completed' as const,
      }

      const createdSale = await saleService.createSale(saleData)
      showToast('success', t('sales.saleCompleted'))

      const invoice: Invoice = {
        id: createdSale.id.replace('sale-', 'inv-'),
        saleId: createdSale.id,
        invoiceNumber: createdSale.invoiceNumber,
        storeName: settings?.storeName || 'Furniture Store',
        storeAddress: settings?.storeAddress || '',
        storePhone: settings?.storePhone || '',
        storeEmail: settings?.storeEmail || '',
        storeLogo: settings?.logo || '',
        customerId: createdSale.customerId,
        customerName: createdSale.customerName || 'Walk-in Customer',
        customerPhone: selectedCustomer?.phone || '',
        customerAddress: selectedCustomer?.address || '',
        items: createdSale.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total,
        })),
        subtotal: createdSale.subtotal,
        discount: createdSale.discount,
        total: createdSale.total,
        paymentMethod: createdSale.paymentMethod,
        amountPaid: createdSale.total,
        remainingBalance: 0,
        status: createdSale.status,
        notes: createdSale.notes,
        createdAt: createdSale.createdAt,
      }
      setCompletedInvoice(invoice)
      setShowInvoiceModal(true)
    } catch (err) {
      const message =
        err instanceof Error && err.message ? err.message : t('sales.saleError')
      showToast('error', message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
            </div>
            <div className="lg:col-span-1">
              <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
    )
  }

  return (
    <>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">{t('sales.newSale')}</h1>
          <Button variant="outline" onClick={() => navigate('/sales')}>
            {t('common.cancel')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title={t('sales.customerInfo')}>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                    />
                    <input
                      type="text"
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      placeholder={t('sales.customerSearchPlaceholder')}
                      className="block w-full rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <Button icon={<Plus size={16} />} onClick={() => setAddClientOpen(true)}>
                    {t('sales.addClient')}
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
                  {loading ? (
                    <div className="p-3 text-sm text-text-muted">{t('common.loading')}</div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="p-3 text-sm text-text-muted">{t('sales.noCustomersFound')}</div>
                  ) : (
                    filteredCustomers.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomerId(c.id)
                          setCustomerSearchTerm('')
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer hover:bg-primary-50 ${
                          selectedCustomerId === c.id
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-text-primary'
                        }`}
                      >
                        <span>{c.name}</span>
                        {c.company && (
                          <span className="text-text-muted ml-1">({c.company})</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
                {selectedCustomer && (
                  <div className="flex items-center gap-2 p-2 bg-primary-50 rounded-lg text-sm text-primary-700">
                    <User size={14} />
                    <span className="font-medium">{selectedCustomer.name}</span>
                    <span className="text-primary-500">-</span>
                    <span>{selectedCustomer.email}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card title={t('sales.productsSection')}>
              <div className="space-y-3">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                  />
                  <input
                    type="text"
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    placeholder={t('sales.searchProductPlaceholder')}
                    className="block w-full rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
                  {loading ? (
                    <div className="p-3 text-sm text-text-muted">{t('common.loading')}</div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-3 text-sm text-text-muted">{t('sales.noProductsFound')}</div>
                  ) : (
                    filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-3 py-2 hover:bg-surface-secondary transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            {currencySymbol}
                            {p.sellingPrice.toFixed(2)} |{' '}
                            {p.availability === 'sur_place'
                              ? t('products.surPlace')
                              : t('products.surCommande')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Plus size={14} />}
                          onClick={() => addProductToCart(p)}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

            <Card title={t('common.cart')} subtitle={`${cartItems.length} ${t('common.itemsCount')}`}>
              {cartItems.length === 0 ? (
                <EmptyState
                  title={t('common.cartEmpty')}
                  description={t('common.cartEmptyDesc')}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-text-muted font-medium">{t('common.product')}</th>
                        <th className="text-right py-2 text-text-muted font-medium">{t('common.price')}</th>
                        <th className="text-right py-2 text-text-muted font-medium">{t('common.quantity')}</th>
                        <th className="text-right py-2 text-text-muted font-medium">{t('common.total')}</th>
                        <th className="text-right py-2 text-text-muted font-medium w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.productId} className="border-b border-border">
                          <td className="py-2 text-text-primary">{item.productName}</td>
                          <td className="py-2 text-right text-text-primary">
                            {currencySymbol}
                            {item.unitPrice.toFixed(2)}
                          </td>
                          <td className="py-2 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-text-primary font-medium">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="py-2 text-right text-text-primary font-medium">
                            {currencySymbol}
                            {lineTotal(item).toFixed(2)}
                          </td>
                          <td className="py-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.productId)}
                              className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card title={t('common.payment')}>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-text-primary mb-2">{t('common.paymentMethod')}</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'cash', label: t('common.cash') },
                      { value: 'bank_transfer', label: t('common.bankTransfer') },
                    ].map((pm) => (
                      <button
                        key={pm.value}
                        type="button"
                        aria-pressed={paymentMethod === pm.value}
                        onClick={() => setPaymentMethod(pm.value as typeof paymentMethod)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                          paymentMethod === pm.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-border text-text-secondary hover:border-gray-300'
                        }`}
                      >
                        <span className="text-sm font-medium">{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Input
                    label={t('common.notes')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('settings.optionalNotes')}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card title={t('common.orderSummary')}>
                <div className="space-y-3">
                  <Input
                    label={t('common.discount')}
                    type="number"
                    min={0}
                    step={0.01}
                    value={discount || ''}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    placeholder="0.00"
                  />

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">{t('common.subtotal')}</span>
                      <span className="text-text-primary">
                        {currencySymbol}
                        {subtotal.toFixed(2)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">{t('common.discount')}</span>
                        <span className="text-red-600">
                          -{currencySymbol}
                          {discount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                      <span className="text-text-primary">{t('common.total')}</span>
                      <span className="text-text-primary">
                        {currencySymbol}
                        {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      className="w-full"
                      size="lg"
                      loading={submitting}
                      onClick={handleCompleteSale}
                      icon={<ShoppingCart size={18} />}
                    >
                      {t('sales.completeSale')}
                    </Button>
                  </div>
                </div>
              </Card>

              <Card title={t('sales.invoicePreview')} className="mt-4">
                <div className="text-sm space-y-2">
                  <div className="border-b border-border pb-2 mb-2">
                    <p className="font-bold text-text-primary text-base">
                      {settings?.storeName ?? 'Furniture Store'}
                    </p>
                    <p className="text-text-muted text-xs">Invoice Preview</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">{t('common.customer')}:</span>
                    <span className="text-text-primary font-medium">
                      {selectedCustomer?.name ?? t('common.noData')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">{t('common.items')}:</span>
                    <span className="text-text-primary">
                      {cartItems.reduce((s, i) => s + i.quantity, 0)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-1 mt-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-text-primary">{t('common.total')}:</span>
                      <span className="text-text-primary">
                        {currencySymbol}
                        {total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>{t('common.paymentMethod')}:</span>
                    <span className="capitalize">
                      {({
                        cash: t('common.cash'),
                        bank_transfer: t('common.bankTransfer'),
                      } as Record<string, string>)[paymentMethod] ?? paymentMethod}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false)
          navigate('/sales')
        }}
        title={t('invoices.invoicePreview')}
        size="lg"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer size={14} /> {t('invoices.printInvoice')}
            </Button>
            <Button onClick={() => { setShowInvoiceModal(false); navigate('/sales') }}>
              {t('common.close')}
            </Button>
          </div>
        }
      >
        {completedInvoice && <InvoiceDocument invoice={completedInvoice} />}
      </Modal>

      <CustomerFormModal
        open={addClientOpen}
        onClose={() => setAddClientOpen(false)}
        onSaved={handleClientCreated}
      />
    </>
  )
}
