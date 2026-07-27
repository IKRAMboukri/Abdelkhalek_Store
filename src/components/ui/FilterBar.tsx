import { SearchBar } from './SearchBar'
import { Select } from './Select'
import { useLocale } from '@/hooks/useLocale'
import type { SelectOption } from '@/types'
import clsx from 'clsx'

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'search'
  options?: SelectOption[]
  placeholder?: string
}

interface FilterBarProps {
  filters: FilterConfig[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  className?: string
}

export function FilterBar({
  filters,
  values,
  onChange,
  className,
}: FilterBarProps) {
  const { t } = useLocale()
  return (
    <div
      className={clsx(
        'flex flex-wrap items-end gap-3 py-3',
        className,
      )}
    >
      {filters.map((filter) => (
        <div key={filter.key} className="min-w-0">
          {filter.type === 'search' ? (
            <SearchBar
              value={values[filter.key] ?? ''}
              onChange={(value) => onChange(filter.key, value)}
              placeholder={filter.placeholder ?? t('common.search')}
              className="w-56"
            />
          ) : (
            <Select
              label={filter.label}
              value={values[filter.key] ?? ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                ...(filter.options ?? []),
              ]}
              placeholder={filter.placeholder ?? t('common.all')}
              className="w-44"
            />
          )}
        </div>
      ))}
    </div>
  )
}
