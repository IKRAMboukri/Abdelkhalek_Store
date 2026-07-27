import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { PAGINATION_DEFAULTS } from '@/constants'
import { useLocale } from '@/hooks/useLocale'
import clsx from 'clsx'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const { t } = useLocale()
  const { maxVisiblePages, pageSizeOptions } = PAGINATION_DEFAULTS

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  function getPageNumbers(): (number | 'ellipsis')[] {
    const pages: (number | 'ellipsis')[] = []

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    pages.push(1)

    let start = Math.max(2, page - 1)
    let end = Math.min(totalPages - 1, page + 1)

    if (page <= 2) {
      start = 2
      end = Math.min(maxVisiblePages - 1, totalPages - 1)
    } else if (page >= totalPages - 1) {
      start = Math.max(2, totalPages - maxVisiblePages + 2)
      end = totalPages - 1
    }

    if (start > 2) pages.push('ellipsis')

    for (let i = start; i <= end; i++) pages.push(i)

    if (end < totalPages - 1) pages.push('ellipsis')

    pages.push(totalPages)

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span>
          {t('pagination.showing', { start: startItem, end: endItem, total })}
        </span>
        <div className="flex items-center gap-1 ml-2">
          <span className="text-xs">{t('pagination.perPage')}</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-surface border border-border rounded-md px-2 py-1 text-xs text-text-primary focus:outline-hidden focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <nav className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(1)}
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="First page"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-text-muted text-sm">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={clsx(
                'min-w-[2rem] h-8 rounded-md text-sm font-medium transition-colors cursor-pointer',
                p === page
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-text-secondary hover:bg-surface-secondary',
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(totalPages)}
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="Last page"
        >
          <ChevronsRight size={16} />
        </button>
      </nav>
    </div>
  )
}
