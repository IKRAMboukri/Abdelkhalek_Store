import { useState, useEffect, useCallback, useRef } from 'react'
import { Save, Plus, Trash2, Pencil, UserCheck, UserX, Upload, ImageIcon, X } from 'lucide-react'
import type { StoreSettings, UserSettings } from '@/types'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { settingsService } from '@/services'
import { ApiError } from '@/services/api/client'
import { useToast } from '@/hooks/useToast'
import { useLocale } from '@/hooks/useLocale'
import { CURRENCY_OPTIONS, DATE_FORMAT_OPTIONS } from '@/constants'
import { resolveMediaUrl } from '@/utils/helpers'
import { optimizeRasterImage } from '@/utils/image'
import clsx from 'clsx'

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' },
]

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (UTC-5)' },
  { value: 'America/Chicago', label: 'Central Time (UTC-6)' },
  { value: 'America/Denver', label: 'Mountain Time (UTC-7)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8)' },
  { value: 'Europe/London', label: 'London (UTC+0)' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1)' },
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
]

const ITEMS_PER_PAGE_OPTIONS = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
]

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'sales', label: 'Sales' },
  { value: 'viewer', label: 'Viewer' },
]

const initialStoreForm: StoreSettings = {
  storeName: 'Abdelkhalek_Store',
  storeEmail: 'abdelkhalekboukri668@gmail.com',
  storePhone: '0723312525',
  storeAddress: 'Casablanca, Sidi Maarouf, Hay Sacem',
  currency: 'MAD',
  currencySymbol: 'DH',
  logo: '',
  fiscalYear: String(new Date().getFullYear()),
  timezone: 'Africa/Casablanca',
  dateFormat: 'DD/MM/YYYY',
}

interface UserFormData {
  name: string
  email: string
  password: string
  role: 'admin' | 'manager' | 'sales' | 'viewer'
  active: boolean
}

const initialUserForm: UserFormData = {
  name: '',
  email: '',
  password: '',
  role: 'sales',
  active: true,
}

export function Settings() {
  const { t, locale, setLocale } = useLocale()
  const [activeTab, setActiveTab] = useState<string>('store')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(initialStoreForm)
  const [users, setUsers] = useState<UserSettings[]>([])
  const [usersLoading, setUsersLoading] = useState(true)

  const [userModalOpen, setUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserSettings | null>(null)
  const [userForm, setUserForm] = useState<UserFormData>(initialUserForm)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
  const [timezone, setTimezone] = useState('America/New_York')
  const [itemsPerPage, setItemsPerPage] = useState('10')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
  const MAX_LOGO_SIZE = 5 * 1024 * 1024

  const resolveLogoUrl = (logo: string) => resolveMediaUrl(logo)

  const handleLogoSelect = async (file: File | undefined) => {
    if (!file) return
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      showToast('error', t('settings.invalidImageType'))
      return
    }
    if (file.size > MAX_LOGO_SIZE) {
      showToast('error', t('settings.imageTooLarge'))
      return
    }
    setUploadingLogo(true)
    try {
      const optimizedFile = await optimizeRasterImage(file, 512, 0.86)
      const updated = await settingsService.uploadLogo(optimizedFile)
      setStoreSettings(updated)
      showToast('success', t('settings.logoUploaded'))
    } catch (err) {
      showToast('error', err instanceof ApiError && err.detail ? err.detail : t('settings.logoUploadFailed'))
    } finally {
      setUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  const handleLogoRemove = async () => {
    setUploadingLogo(true)
    try {
      const updated = await settingsService.updateStoreSettings({ logo: '' })
      setStoreSettings(updated)
      showToast('success', t('settings.logoRemoved'))
    } catch {
      showToast('error', t('settings.failedToSaveSettings'))
    } finally {
      setUploadingLogo(false)
    }
  }

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const settings = await settingsService.getStoreSettings()
      setStoreSettings(settings)
      setDateFormat(settings.dateFormat || 'MM/DD/YYYY')
      setTimezone(settings.timezone || 'America/New_York')
    } catch {
      showToast('error', t('settings.failedToLoadSettings'))
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const data = await settingsService.getUsers()
      setUsers(data)
    } catch {
      showToast('error', t('settings.failedToLoadUsers'))
    } finally {
      setUsersLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadSettings()
    loadUsers()
  }, [loadSettings, loadUsers])

  const tabs = [t('settings.storeProfile'), t('settings.users'), t('settings.preferences')] as const
  const tabKeys = ['store', 'users', 'preferences'] as const

  const handleLocaleChange = (value: string) => {
    setLocale(value as 'en' | 'fr' | 'ar')
  }

  const handleStoreSave = async () => {
    setSaving(true)
    try {
      const updated = await settingsService.updateStoreSettings(storeSettings)
      setStoreSettings(updated)
      showToast('success', t('settings.settingsSaved'))
    } catch {
      showToast('error', t('settings.failedToSaveSettings'))
    } finally {
      setSaving(false)
    }
  }

  const handlePreferencesSave = async () => {
    setSaving(true)
    try {
      const updated = await settingsService.updateStoreSettings({
        dateFormat,
        timezone,
      })
      setStoreSettings(updated)
      showToast('success', t('settings.preferencesSaved'))
    } catch {
      showToast('error', t('settings.failedToSavePreferences'))
    } finally {
      setSaving(false)
    }
  }

  const openAddUserModal = () => {
    setEditingUser(null)
    setUserForm(initialUserForm)
    setUserModalOpen(true)
  }

  const openEditUserModal = (user: UserSettings) => {
    setEditingUser(user)
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      active: user.active,
    })
    setUserModalOpen(true)
  }

  const handleUserSave = async () => {
    if (!userForm.name || !userForm.email) {
      showToast('error', t('settings.nameRequired'))
      return
    }
    if (!editingUser && !userForm.password) {
      showToast('error', t('settings.passwordRequired'))
      return
    }

    setSaving(true)
    try {
      if (editingUser) {
        const updateData: Partial<UserSettings> = {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          active: userForm.active,
        }
        if (userForm.password) {
          (updateData as Record<string, unknown>).password = userForm.password
        }
        await settingsService.updateUser(editingUser.id, updateData)
        showToast('success', t('settings.userUpdated'))
      } else {
        await settingsService.createUser({ ...userForm, avatar: '' })
        showToast('success', t('settings.userCreated'))
      }
      setUserModalOpen(false)
      loadUsers()
    } catch {
      showToast('error', t('settings.failedToSaveUser'))
    } finally {
      setSaving(false)
    }
  }

  const confirmDeleteUser = (userId: string) => {
    setDeletingUserId(userId)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!deletingUserId) return
    try {
      await settingsService.deleteUser(deletingUserId)
      showToast('success', t('settings.userDeleted'))
      loadUsers()
    } catch {
      showToast('error', t('settings.failedToDeleteUser'))
    } finally {
      setDeletingUserId(null)
    }
  }

  const storeFields: { key: keyof StoreSettings; label: string; type?: string }[] = [
    { key: 'storeName', label: t('settings.storeNameLabel') },
    { key: 'storeEmail', label: t('settings.storeEmailLabel'), type: 'email' },
    { key: 'storePhone', label: t('settings.storePhoneLabel') },
    { key: 'storeAddress', label: t('settings.storeAddressLabel') },
  ]

  const userColumns: TableColumn<UserSettings>[] = [
    { key: 'name', label: t('settings.name') },
    { key: 'email', label: t('settings.email') },
    {
      key: 'role',
      label: t('settings.role'),
      render: (item) => <StatusBadge status={item.role} />,
    },
    {
      key: 'active',
      label: t('settings.status'),
      render: (item) =>
        item.active ? (
          <Badge variant="success" size="sm" className="flex items-center gap-1">
            <UserCheck size={12} /> {t('settings.active')}
          </Badge>
        ) : (
          <Badge variant="neutral" size="sm" className="flex items-center gap-1">
            <UserX size={12} /> {t('settings.inactive')}
          </Badge>
        ),
    },
    {
      key: 'actions',
      label: t('settings.actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openEditUserModal(item)}
            className="p-1.5 rounded-lg text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => confirmDeleteUser(item.id)}
            className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'store':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card title={t('settings.storeInformation')}>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={40} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    className="hidden"
                    onChange={(e) => void handleLogoSelect(e.target.files?.[0])}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('settings.logoLabel')}
                    </label>
                    <div className="flex items-center gap-4">
                      <div
                        className={clsx(
                          'w-20 h-20 shrink-0 rounded-xl border border-border bg-surface-secondary overflow-hidden flex items-center justify-center',
                          !storeSettings.logo && 'text-gray-300',
                        )}
                      >
                        {storeSettings.logo ? (
                          <img
                            src={resolveLogoUrl(storeSettings.logo)}
                            alt={t('settings.logoLabel')}
                            width="80"
                            height="80"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <ImageIcon size={28} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            icon={<Upload size={16} />}
                            loading={uploadingLogo}
                            onClick={() => logoInputRef.current?.click()}
                          >
                            {t('settings.uploadLogo')}
                          </Button>
                          {storeSettings.logo && (
                            <button
                              type="button"
                              disabled={uploadingLogo}
                              onClick={() => void handleLogoRemove()}
                              className="p-2 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                              aria-label={t('settings.removeLogo')}
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-text-muted">{t('settings.logoHelp')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {storeFields.map(({ key, label, type }) => (
                    <Input
                      key={key}
                      label={label}
                      type={type || 'text'}
                      value={storeSettings[key] as string}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                    />
                  ))}
                  <Select
                    label={t('settings.currency')}
                    options={CURRENCY_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
                    value={storeSettings.currency}
                    onChange={(e) => {
                      const selected = CURRENCY_OPTIONS.find((c) => c.value === e.target.value)
                      setStoreSettings((prev) => ({
                        ...prev,
                        currency: e.target.value,
                        currencySymbol: selected?.symbol || 'DH',
                      }))
                    }}
                  />
                  </div>
                </div>
              )}
            </Card>
            <div className="flex justify-end">
              <Button icon={<Save size={16} />} loading={saving} onClick={handleStoreSave}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        )

      case 'users':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{t('settings.manageUsers')}</h3>
                <p className="text-sm text-text-muted">{t('settings.manageUsersDesc')}</p>
              </div>
              <Button icon={<Plus size={16} />} onClick={openAddUserModal}>
                {t('settings.addUser')}
              </Button>
            </div>

            <Card>
              <Table columns={userColumns} data={users} loading={usersLoading} />
            </Card>

            <Modal
              open={userModalOpen}
              onClose={() => setUserModalOpen(false)}
              title={editingUser ? t('settings.editUser') : t('settings.addUser')}
              size="md"
              footer={
                <div className="flex gap-3 w-full">
                  <Button variant="outline" onClick={() => setUserModalOpen(false)} className="flex-1">
                    {t('common.cancel')}
                  </Button>
                  <Button loading={saving} onClick={handleUserSave} className="flex-1">
                    {editingUser ? t('settings.updateUser') : t('settings.createUser')}
                  </Button>
                </div>
              }
            >
              <div className="space-y-4">
                <Input
                  label={t('settings.name')}
                  value={userForm.name}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  label={t('settings.email')}
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  label={editingUser ? t('settings.newPassword') : t('settings.password')}
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                />
                <Select
                  label={t('settings.role')}
                  options={ROLE_OPTIONS}
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      role: e.target.value as 'admin' | 'manager' | 'sales' | 'viewer',
                    }))
                  }
                />
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-primary">{t('settings.active')}</span>
                  <button
                    type="button"
                    onClick={() => setUserForm((prev) => ({ ...prev, active: !prev.active }))}
                    className={clsx(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      userForm.active ? 'bg-primary-600' : 'bg-gray-300',
                    )}
                  >
                    <span
                      className={clsx(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        userForm.active ? 'translate-x-6' : 'translate-x-1',
                      )}
                    />
                  </button>
                </div>
              </div>
            </Modal>

            <ConfirmDialog
              open={deleteConfirmOpen}
              onClose={() => setDeleteConfirmOpen(false)}
              onConfirm={handleDeleteUser}
              title={t('settings.deleteUser')}
              message={t('settings.deleteUserConfirm')}
              confirmText={t('common.delete')}
              cancelText={t('common.cancel')}
              variant="danger"
            />
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card title={t('settings.preferences')}>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={40} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label={t('settings.language')}
                    options={LANG_OPTIONS}
                    value={locale}
                    onChange={(e) => handleLocaleChange(e.target.value)}
                  />
                  <Select
                    label={t('settings.dateFormat')}
                    options={DATE_FORMAT_OPTIONS.map((d) => ({ value: d.value, label: d.label }))}
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                  />
                  <Select
                    label={t('settings.timezone')}
                    options={TIMEZONE_OPTIONS}
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  />
                  <Select
                    label={t('settings.itemsPerPage')}
                    options={ITEMS_PER_PAGE_OPTIONS}
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(e.target.value)}
                  />
                </div>
              )}
            </Card>
            <div className="flex justify-end">
              <Button icon={<Save size={16} />} loading={saving} onClick={handlePreferencesSave}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('settings.title')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('settings.description')}</p>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-border">
          {tabKeys.map((key, i) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium transition-colors relative',
                activeTab === key
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-text-muted hover:text-text-primary',
              )}
            >
              {tabs[i]}
            </button>
          ))}
        </div>

        {renderTabContent()}
      </div>
  )
}
