import { Search, X } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import clsx from 'clsx'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder,
  className,
}: SearchBarProps) {
  const { t } = useLocale()
  return (
    <div className={clsx('relative', className)}>
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t('common.search')}
        className="block w-full rounded-lg border border-border bg-white pl-10 pr-10 py-2 text-sm text-text-primary placeholder-text-muted transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-300"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
