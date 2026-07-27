import clsx from 'clsx'

type SkeletonVariant = 'text' | 'circular' | 'rectangular'

interface SkeletonProps {
  className?: string
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
  count?: number
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-4 rounded-md',
  circular: 'rounded-full',
  rectangular: 'rounded-lg',
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const skeleton = (index: number) => (
    <div
      key={index}
      className={clsx(
        'bg-gray-200 dark:bg-gray-700 animate-pulse',
        variantStyles[variant],
        className,
      )}
      style={{
        width: width ?? (variant === 'circular' ? height ?? '2.5rem' : '100%'),
        height: height ?? (variant === 'text' ? undefined : variant === 'circular' ? width ?? '2.5rem' : '6rem'),
      }}
    />
  )

  if (variant === 'text') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className={clsx(
              'bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md',
              className,
            )}
            style={{
              width: width ?? (i === count - 1 && count > 1 ? '60%' : '100%'),
              height: height ?? 16,
            }}
          />
        ))}
      </div>
    )
  }

  return <>{Array.from({ length: count }, (_, i) => skeleton(i))}</>
}
