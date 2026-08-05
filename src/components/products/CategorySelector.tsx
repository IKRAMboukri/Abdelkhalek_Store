import { Select } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'
import type { Category, CategoryOption, SubCategory } from '@/types'

export interface CategorySelection {
  categoryId: string
  subCategoryId: string
  optionValues: Record<string, string>
}

interface CategorySelectorProps {
  categories: Category[]
  categoryId: string
  subCategoryId: string
  optionValues: Record<string, string>
  error?: string
  errors?: Record<string, string | undefined>
  disabled?: boolean
  loading?: boolean
  onCategoryChange: (value: string) => void
  onSubCategoryChange: (value: string) => void
  onOptionChange: (optionId: string, value: string) => void
}

export function getSelectedSubCategory(
  categories: Category[],
  categoryId: string,
  subCategoryId: string,
): SubCategory | undefined {
  const category = categories.find(c => c.id === categoryId)
  return category?.subcategories?.find(s => s.id === subCategoryId)
}

export function resolveOptionLabels(
  categories: Category[],
  categoryId: string,
  subCategoryId: string,
  optionValues: Record<string, string>,
): Array<{ option: CategoryOption; value: string; label: string }> {
  const subcategory = getSelectedSubCategory(categories, categoryId, subCategoryId)
  if (!subcategory?.options) return []

  return subcategory.options
    .map(option => {
      const value = optionValues[option.id]
      const matched = option.values.find(v => v.value === value)
      return matched ? { option, value, label: matched.label } : null
    })
    .filter((item): item is { option: CategoryOption; value: string; label: string } => item !== null)
}

export function CategorySelector({
  categories,
  categoryId,
  subCategoryId,
  optionValues,
  error,
  errors = {},
  disabled,
  loading,
  onCategoryChange,
  onSubCategoryChange,
  onOptionChange,
}: CategorySelectorProps) {
  const { t } = useLocale()

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }))
  const subcategories = categories.find(c => c.id === categoryId)?.subcategories ?? []
  const subcategoryOptions = subcategories.map(s => ({ value: s.id, label: s.name }))
  const options = getSelectedSubCategory(categories, categoryId, subCategoryId)?.options ?? []

  return (
    <>
      <Select
        label={t('products.category')}
        value={categoryId}
        onChange={(e) => onCategoryChange(e.target.value)}
        options={categoryOptions}
        placeholder={loading ? t('common.loading') : t('common.allCategories')}
        error={error}
        disabled={disabled || loading}
      />

      {subcategories.length > 0 && (
        <Select
          label={t('products.subcategory')}
          value={subCategoryId}
          onChange={(e) => onSubCategoryChange(e.target.value)}
          options={subcategoryOptions}
          placeholder={t('products.selectSubcategory')}
          error={errors.subCategoryId}
          disabled={disabled}
        />
      )}

      {options.map(option => (
        <Select
          key={option.id}
          label={option.label}
          value={optionValues[option.id] ?? ''}
          onChange={(e) => onOptionChange(option.id, e.target.value)}
          options={option.values}
          placeholder={t('products.selectOption')}
          error={errors[option.id]}
          disabled={disabled}
        />
      ))}
    </>
  )
}
