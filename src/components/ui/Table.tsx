import type { ReactNode } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Skeleton } from './Skeleton'
import { EmptyState } from './EmptyState'
import { useLocale } from '@/hooks/useLocale'
import type { SortDirection } from '@/types'
import clsx from 'clsx'

export interface TableColumn<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (item: T, index: number) => ReactNode
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  sortBy?: string
  sortOrder?: SortDirection
  onSort?: (key: string) => void
  onRowClick?: (item: T) => void
  className?: string
  getRowKey?: (item: T, index: number) => string
  dense?: boolean
}

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyMessage,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  className,
  getRowKey,
  dense = false,
}: TableProps<T>) {
  const { t } = useLocale()
  const cellPadding = dense ? 'px-3 py-2' : 'px-4 py-3'
  const headerClass = dense
    ? 'px-3 py-2 text-[11px]'
    : 'px-4 py-3 text-xs'
  if (loading) {
    return (
      <div className={clsx('bg-surface rounded-xl border border-border shadow-sm overflow-hidden', className)}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-secondary">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={clsx(headerClass, 'text-left font-semibold text-text-muted uppercase tracking-wider')}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr key={rowIdx} className="border-b border-border last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className={cellPadding}>
                      <Skeleton variant="text" width={col.key === 'name' || col.label.length > 8 ? '70%' : '40%'} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (!loading && data.length === 0) {
    return (
      <div className={clsx('bg-surface rounded-xl border border-border shadow-sm', className)}>
        <EmptyState
          title={t('common.noData')}
          description={emptyMessage}
        />
      </div>
    )
  }

  return (
    <div className={clsx('bg-surface rounded-xl border border-border shadow-sm overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-secondary">
              {columns.map((col) => (
                  <th
                    key={col.key}
                    className={clsx(
                      headerClass,
                      'text-left font-semibold text-text-muted uppercase tracking-wider',
                      col.sortable && 'cursor-pointer select-none hover:text-text-primary transition-colors',
                    )}
                  onClick={() => {
                    if (col.sortable && onSort) onSort(col.key)
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <span className="inline-flex flex-col">
                        {sortBy === col.key ? (
                          sortOrder === 'asc' ? (
                            <ChevronUp size={14} className="text-primary-600" />
                          ) : (
                            <ChevronDown size={14} className="text-primary-600" />
                          )
                        ) : (
                          <ChevronsUpDown size={14} className="text-text-muted" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={getRowKey ? getRowKey(item, index) : String(index)}
                className={clsx(
                  'border-b border-border last:border-0 transition-colors duration-100',
                  onRowClick
                    ? 'cursor-pointer hover:bg-primary-50/50'
                    : 'hover:bg-surface-secondary',
                )}
                onClick={() => {
                  if (onRowClick) onRowClick(item)
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} className={clsx(cellPadding, 'text-left text-sm text-text-primary whitespace-nowrap', dense && 'text-[13px]')}>
                    {col.render
                      ? col.render(item, index)
                      : String((item as Record<string, unknown>)[col.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
