import { useEffect, useState } from 'react'
import type { Customer } from '@/types'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { customerService } from '@/services'
import { useToast } from '@/hooks/useToast'
import { useLocale } from '@/hooks/useLocale'

interface CustomerFormData {
  name: string
  email: string
  phone: string
  address: string
  company: string
  notes: string
  creditBalance: number
  status: Customer['status']
}

const initialFormData: CustomerFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  company: '',
  notes: '',
  creditBalance: 0,
  status: 'active',
}

interface CustomerFormModalProps {
  open: boolean
  onClose: () => void
  customer?: Customer | null
  onSaved?: (customer: Customer) => void
}

export function CustomerFormModal({ open, onClose, customer, onSaved }: CustomerFormModalProps) {
  const { showToast } = useToast()
  const { t } = useLocale()
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        company: customer.company,
        notes: customer.notes,
        creditBalance: customer.creditBalance,
        status: customer.status,
      })
    } else {
      setFormData(initialFormData)
    }
  }, [open, customer])

  const handleSave = async () => {
    setSaving(true)
    try {
      let saved: Customer
      if (customer) {
        const updated = await customerService.updateCustomer(customer.id, formData)
        if (!updated) throw new Error('Customer not found')
        saved = updated
      } else {
        saved = await customerService.createCustomer({ ...formData, totalPurchases: 0 })
      }
      showToast('success', customer ? t('customers.updated') : t('customers.created'))
      onSaved?.(saved)
      onClose()
    } catch {
      showToast('error', t('customers.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={customer ? t('customers.editTitle') : t('customers.addTitle')}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button loading={saving} onClick={handleSave}>
            {customer ? t('common.update') : t('common.create')}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label={t('common.name')}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="h-11 bg-white! border-gray-300! shadow-sm! placeholder:text-gray-400!"
        />
        <Input
          label={t('common.phone')}
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="h-11 bg-white! border-gray-300! shadow-sm! placeholder:text-gray-400! ltr"
        />
        <div className="sm:col-span-2">
          <Input
            label={t('common.address')}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="h-11 bg-white! border-gray-300! shadow-sm! placeholder:text-gray-400!"
          />
        </div>
        <div className="sm:col-span-2">
          <Select
            label={t('common.status')}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Customer['status'] })}
            options={[
              { value: 'active', label: t('status.active') },
              { value: 'inactive', label: t('status.inactive') },
              { value: 'blocked', label: t('status.blocked') },
            ]}
            className="h-11 bg-white! border-gray-300! shadow-sm!"
          />
        </div>
      </div>
    </Modal>
  )
}
