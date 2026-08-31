import { useLocation, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Home } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import clsx from 'clsx'

const pathLabelMap: Record<string, string> = {
  dashboard: 'nav.dashboard',
  products: 'nav.products',
  categories: 'nav.categories',
  customers: 'nav.customers',
  sales: 'nav.sales',
  invoices: 'nav.invoices',
  credits: 'nav.credits',
  payments: 'nav.payments',
  reports: 'nav.reports',
  notifications: 'nav.notifications',
  settings: 'nav.settings',
  new: 'common.create',
}

interface BreadcrumbProps {
  className?: string
}

export function Breadcrumb({ className }: BreadcrumbProps) {
  const { pathname } = useLocation()
  const { t, locale } = useLocale()
  const isRtl = locale === 'ar'

  const pathParts = pathname.split('/').filter(Boolean)

  const breadcrumbs = pathParts.map((part, index) => {
    const href = '/' + pathParts.slice(0, index + 1).join('/')
    const key = pathLabelMap[part]
    const label = key ? t(key) : part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    return { href, label, isLast: index === pathParts.length - 1 }
  })

  const Arrow = isRtl ? ChevronLeft : ChevronRight

  return (
    <nav aria-label="Breadcrumb" className={clsx('flex items-center gap-1.5 text-sm', className)}>
      <Link
        to="/"
        className="text-text-muted hover:text-text-primary transition-colors"
      >
        <Home size={16} />
      </Link>
      {breadcrumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <Arrow size={14} className="text-text-muted" />
          {crumb.isLast ? (
            <span className="font-medium text-text-primary" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.href}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
