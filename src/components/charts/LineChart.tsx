import {
  LineChart as RechartsLineChart,
  Line,
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

interface LineChartProps {
  data: Record<string, unknown>[]
  xKey: string
  lines: { key: string; color?: string; name?: string }[]
  loading?: boolean
  height?: number
  className?: string
}

export function LineChart({
  data,
  xKey,
  lines,
  loading = false,
  height = 320,
  className,
}: LineChartProps) {
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
        <RechartsLineChart data={data}>
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
          {lines.map((line, index) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name ?? line.key}
              stroke={line.color ?? CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
