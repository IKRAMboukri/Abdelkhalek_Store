import {
  AreaChart as RechartsAreaChart,
  Area,
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

interface AreaChartProps {
  data: Record<string, unknown>[]
  xKey: string
  areas: { key: string; color?: string; name?: string }[]
  loading?: boolean
  height?: number
  className?: string
}

export function AreaChart({
  data,
  xKey,
  areas,
  loading = false,
  height = 320,
  className,
}: AreaChartProps) {
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
        <RechartsAreaChart data={data}>
          <defs>
            {areas.map((area, index) => {
              const color = area.color ?? CHART_COLORS[index % CHART_COLORS.length]
              return (
                <linearGradient key={area.key} id={`gradient-${area.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              )
            })}
          </defs>
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
          {areas.map((area, index) => {
            const color = area.color ?? CHART_COLORS[index % CHART_COLORS.length]
            return (
              <Area
                key={area.key}
                type="monotone"
                dataKey={area.key}
                name={area.name ?? area.key}
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${area.key})`}
              />
            )
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
