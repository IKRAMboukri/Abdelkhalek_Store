import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { CHART_COLORS } from '@/constants'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import clsx from 'clsx'

interface BarChartProps {
  data: Record<string, unknown>[]
  xKey: string
  bars: { key: string; color?: string; name?: string }[]
  loading?: boolean
  height?: number
  className?: string
}

export function BarChart({
  data,
  xKey,
  bars,
  loading = false,
  height = 320,
  className,
}: BarChartProps) {
  if (loading) {
    return (
      <div className={clsx('bg-surface rounded-xl border border-border shadow-sm p-6', className)}>
        <Skeleton variant="rectangular" height={height} />
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className={clsx('bg-surface rounded-xl border border-border shadow-sm', className)}>
        <EmptyState title="No chart data" />
      </div>
    )
  }

  return (
    <div className={clsx('bg-surface rounded-xl border border-border shadow-sm p-4', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '13px',
            }}
          />
          {bars.map((bar, index) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name ?? bar.key}
              fill={bar.color ?? CHART_COLORS[index % CHART_COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
