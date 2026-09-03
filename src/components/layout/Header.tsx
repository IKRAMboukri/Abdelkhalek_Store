import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User,
  Globe,
} from 'lucide-react'
import { Breadcrumb } from './Breadcrumb'
import { useLocale } from '@/hooks/useLocale'
import { useAuth } from '@/context/AuthContext'
import { resolveMediaUrl } from '@/utils/helpers'
import clsx from 'clsx'

interface HeaderProps {
  onMenuClick: () => void
  unreadNotifications?: number
}

export function Header({
  onMenuClick,
  unreadNotifications = 0,
}: HeaderProps) {
  const navigate = useNavigate()
  const { t, locale, setLocale } = useLocale()
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <Breadcrumb />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-text-muted hover:border-gray-300 hover:text-text-primary transition-colors cursor-pointer"
          >
            <Search size={16} />
            <span className="hidden md:inline">{t('common.search')}...</span>
            <kbd className="hidden lg:inline-flex text-xs text-text-muted bg-surface-secondary px-1.5 py-0.5 rounded border border-border">
              Ctrl+K
            </kbd>
          </button>

          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-2 rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors cursor-pointer"
              aria-label="Switch language"
            >
              <Globe size={20} />
            </button>
            {showLangMenu && (
              <div className={clsx(
                'absolute mt-2 w-36 bg-surface rounded-xl border border-border shadow-lg animate-scale-in z-50',
                locale === 'ar' ? 'left-0' : 'right-0'
              )}>
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => { setLocale('en'); setShowLangMenu(false) }}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                      locale === 'en' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-text-secondary hover:bg-surface-secondary'
                    )}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLocale('fr'); setShowLangMenu(false) }}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                      locale === 'fr' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-text-secondary hover:bg-surface-secondary'
                    )}
                  >
                    Français
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLocale('ar'); setShowLangMenu(false) }}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                      locale === 'ar' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-text-secondary hover:bg-surface-secondary'
                    )}
                  >
                    العربية
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="relative p-2 rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm shrink-0 overflow-hidden">
                {user?.avatar ? (
                  <img src={resolveMediaUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                ) : (
                  (user?.name ?? 'A').charAt(0).toUpperCase()
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-text-primary leading-tight">{user?.name}</p>
                <p className="text-xs text-text-muted capitalize">{user?.role}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className={clsx(
                'absolute mt-2 w-56 bg-surface rounded-xl border border-border shadow-lg animate-scale-in z-50',
                locale === 'ar' ? 'left-0' : 'right-0'
              )}>
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                    <p className="text-xs text-text-muted truncate">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { navigate('/settings'); setShowUserMenu(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <User size={16} />
                    {t('nav.settings')}
                  </button>
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => { setShowUserMenu(false); logout() }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      {t('auth.logout')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
