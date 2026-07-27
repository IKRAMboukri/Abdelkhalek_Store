import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { CHART_COLORS } from '@/constants'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import clsx from 'clsx'

interface PieChartData {
  name: string
  value: number
  color?: string
}

interface PieChartProps {
  data: PieChartData[]
  loading?: boolean
  height?: number
  innerRadius?: number
  outerRadius?: number
  className?: string
}

export function PieChart({
  data,
  loading = false,
  height = 320,
  innerRadius = 60,
  outerRadius = 100,
  className,
}: PieChartProps) {
  if (loading) {
    return (
      <div className={clsx('bg-surface rounded-xl border border-border shadow-sm p-6', className)}>
        <div className="flex items-center justify-center" style={{ height }}>
          <Skeleton variant="circular" width={200} height={200} />
        </div>
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
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={entry.color ?? CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '13px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-sm text-text-secondary">{value}</span>
            )}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}
