import { useState, useEffect } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { Card, KPICard, Table, Skeleton, EmptyState } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import { BarChart } from '@/components/charts'
import { dashboardService } from '@/services'
import type { DashboardStats, MonthlySales, RecentSale } from '@/types'
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'

export function Dashboard() {
  const { t } = useLocale()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([])
  const [recentSales, setRecentSales] = useState<RecentSale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)
      try {
        const year = new Date().getFullYear()
        const [s, ms, rs] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getMonthlySales(year),
          dashboardService.getRecentSales(5),
        ])
        setStats(s)
        setMonthlySales(ms)
        setRecentSales(rs)
      } catch {
        setError(t('dashboard.errorLoading'))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (error) {
    return (
      <div className="animate-fade-in">
        <EmptyState
          icon={<AlertTriangle size={48} />}
          title={t('dashboard.errorLoading')}
          description={error}
          action={{ label: t('common.retry'), onClick: () => window.location.reload() }}
        />
      </div>
    )
  }

  const kpiCards = stats ? [
    { title: t('dashboard.totalProducts'), value: stats.totalProducts, icon: <Package size={20} /> },
    { title: t('dashboard.totalCustomers'), value: stats.totalCustomers, icon: <Users size={20} /> },
    { title: t('dashboard.totalSales'), value: stats.totalSales, icon: <ShoppingCart size={20} /> },
    { title: t('dashboard.pendingCredits'), value: stats.pendingCredits, icon: <AlertTriangle size={20} /> },
    { title: t('dashboard.totalRevenue'), value: `DH ${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign size={20} /> },
    { title: t('dashboard.totalProfit'), value: `DH ${stats.totalProfit.toLocaleString()}`, icon: <TrendingUp size={20} /> },
  ] : []

  const recentSalesColumns: TableColumn<RecentSale>[] = [
    { key: 'invoiceNumber', label: t('common.invoice') },
    { key: 'customerName', label: t('common.customer') },
    { key: 'total', label: t('common.total'), render: (item) => `DH ${item.total.toLocaleString()}` },
    { key: 'status', label: t('common.status') },
    { key: 'createdAt', label: t('common.date'), render: (item) => new Date(item.createdAt).toLocaleDateString() },
  ]

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">{t('dashboard.title')}</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <KPICard key={i} title="" value="" loading />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} />
          ))}
        </div>
      )}

      {loading ? (
        <Skeleton variant="rectangular" height={360} />
      ) : (
        <Card title={t('common.monthlySalesRevenue')}>
          <BarChart
            data={monthlySales as unknown as Record<string, unknown>[]}
            xKey="month"
            bars={[
              { key: 'revenue', name: t('common.revenue'), color: '#6366f1' },
              { key: 'profit', name: t('common.profit'), color: '#10b981' },
            ]}
            height={300}
          />
        </Card>
      )}

      {loading ? (
        <Skeleton variant="rectangular" height={250} />
      ) : (
        <Card title={t('common.recentSales')}>
          <Table columns={recentSalesColumns} data={recentSales} />
        </Card>
      )}
    </div>
  )
}
