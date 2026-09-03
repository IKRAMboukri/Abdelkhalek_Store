import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  ShoppingCart,
  Wallet,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { settingsService } from '@/services'
import type { StoreSettings } from '@/types'
import clsx from 'clsx'

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, Package, FolderTree, Users, ShoppingCart, Wallet, FileText, Settings,
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, locale } = useLocale()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  useEffect(() => {
    let active = true
    settingsService.getStoreSettings()
      .then((data) => { if (active) setSettings(data) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  const navItems = [
    { icon: 'LayoutDashboard', label: t('nav.dashboard'), path: '/', subItems: [] },
    { icon: 'Package', label: t('nav.products'), path: '/products', subItems: [
      { label: t('nav.allProducts'), path: '/products' },
      { label: t('nav.addProduct'), path: '/products/new' },
    ]},
    { icon: 'FolderTree', label: t('nav.categories'), path: '/categories', subItems: [] },
    { icon: 'Users', label: t('nav.customers'), path: '/customers', subItems: [
      { label: t('nav.allCustomers'), path: '/customers' },
      { label: t('nav.addCustomer'), path: '/customers/new' },
    ]},
    { icon: 'ShoppingCart', label: t('nav.sales'), path: '/sales', subItems: [
      { label: t('nav.allSales'), path: '/sales' },
      { label: t('nav.newSale'), path: '/sales/new' },
      { label: t('nav.invoices'), path: '/invoices' },
    ]},
    { icon: 'Wallet', label: t('nav.credits'), path: '/credits', subItems: [] },
  ]

  const settingsItem = { icon: 'Settings', label: t('nav.settings'), path: '/settings', subItems: [] }

  const isActive = (path: string) => location.pathname === path
  const isActiveParent = (path: string) => location.pathname.startsWith(path) && path !== '/'

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    )
  }

  const renderNavItem = (item: { icon: string; label: string; path: string; subItems: { label: string; path: string }[] }) => {
    const Icon = iconMap[item.icon]
    const active = isActive(item.path)
    const parentActive = isActiveParent(item.path)
    const expanded = expandedItems.includes(item.label)

    return (
      <div key={item.label}>
        <button
          type="button"
          onClick={() => {
            if (item.subItems.length > 0) toggleExpand(item.label)
            navigate(item.path)
            onMobileClose()
          }}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group cursor-pointer',
            active
              ? 'bg-sidebar-active text-sidebar-text-active'
              : parentActive
                ? 'bg-sidebar-hover text-sidebar-text-active'
                : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active',
          )}
          title={collapsed ? item.label : undefined}
        >
          {Icon && <Icon size={20} className="shrink-0" />}
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.subItems.length > 0 && (
                <ChevronDown
                  size={14}
                  className={clsx('transition-transform duration-200', expanded && 'rotate-180')}
                />
              )}
            </>
          )}
        </button>
        {!collapsed && expanded && item.subItems.length > 0 && (
          <div className="ml-9 mt-1 space-y-1">
            {item.subItems.map((sub) => (
              <button
                key={sub.path}
                type="button"
                onClick={() => { navigate(sub.path); onMobileClose() }}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150 cursor-pointer',
                  isActive(sub.path)
                    ? 'bg-sidebar-active text-sidebar-text-active font-medium'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active',
                )}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const sidebarContent = (
    <div className={clsx(
      'h-full flex flex-col bg-sidebar transition-all duration-300 ease-in-out',
      collapsed ? 'w-16' : 'w-64',
    )}>
      <div className="flex items-center h-16 px-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            <img
              src="/abdelkhalek-logo.jpeg"
              alt={settings?.storeName || t('app.name')}
              className="w-full h-full object-contain"
            />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-white truncate">
              {settings?.storeName || t('app.name')}
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-2 space-y-1">
        {navItems.map(renderNavItem)}
      </nav>

      <div className="border-t border-white/10 px-2 py-3 space-y-1 shrink-0">
        {renderNavItem(settingsItem)}
        <button
          type="button"
          onClick={onToggle}
          className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active transition-all duration-150 cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={20} className="shrink-0" /> : <ChevronLeft size={20} className="shrink-0" />}
          {!collapsed && <span>{locale === 'ar' ? 'طي' : locale === 'fr' ? 'Réduire' : 'Collapse'}</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className={clsx('hidden lg:block h-screen sticky top-0 shrink-0', collapsed ? 'w-16' : 'w-64')}>
        <div className="fixed top-0 left-0 h-full z-30" style={{ width: collapsed ? '4rem' : '16rem' }}>
          {sidebarContent}
        </div>
      </aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onMobileClose} />
          <div className="fixed left-0 top-0 h-full z-50 animate-slide-in">{sidebarContent}</div>
        </div>
      )}
    </>
  )
}
