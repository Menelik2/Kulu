import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle,
  Layers,
  Store,
  type LucideIcon,
} from 'lucide-react'
import { adminGetDashboardStats } from '@/services/admin'
import { formatETB, cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Kpi = {
  label: string
  value: string
  icon: LucideIcon
  color: string
  hint?: string
  wide?: boolean
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminGetDashboardStats,
  })

  if (isLoading || !data) {
    return (
      <div className="p-3 sm:p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-charcoal-100 rounded w-40" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-charcoal-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const kpis: Kpi[] = [
    {
      label: 'Inventory value',
      value: formatETB(data.inventoryValue),
      icon: Layers,
      color: 'text-emerald-700 bg-emerald-50',
      hint: 'Stock × sell price',
      wide: true,
    },
    {
      label: 'Total Sales',
      value: formatETB(data.totalSales),
      icon: DollarSign,
      color: 'text-primary-600 bg-primary-50',
      wide: true,
    },
    {
      label: "Today's Sales",
      value: formatETB(data.todaySales),
      icon: DollarSign,
      color: 'text-gold-600 bg-gold-50',
    },
    {
      label: 'Orders',
      value: String(data.totalOrders),
      icon: ShoppingBag,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Customers',
      value: String(data.totalCustomers),
      icon: Users,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Products',
      value: String(data.totalProducts),
      icon: Package,
      color: 'text-charcoal-600 bg-charcoal-100',
    },
    {
      label: 'Pending',
      value: String(data.pendingOrders),
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Delivered',
      value: String(data.deliveredOrders),
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Low Stock',
      value: String(data.lowStock.length),
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
    },
  ]

  const maxSales = Math.max(...data.salesByDay.map((d) => d.total), 1)

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 pb-8 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 leading-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1 leading-snug">
            Inventory = sell price × stock (all products)
          </p>
        </div>
        <Link to="/" className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-1.5 h-9 px-3 text-xs sm:text-sm"
          >
            <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline sm:inline">Store</span>
            <span className="sm:hidden">Store</span>
          </Button>
        </Link>
      </div>

      {/* KPI grid — money metrics span full width on phone */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
        {kpis.map((k) => {
          const Icon = k.icon
          return (
            <Card
              key={k.label}
              className={cn(
                'min-w-0',
                k.wide && 'col-span-2 sm:col-span-1'
              )}
            >
              <CardContent className="p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3">
                <div
                  className={cn(
                    'w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0',
                    k.color
                  )}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs text-charcoal-500 leading-tight">{k.label}</p>
                  <p className="font-bold text-charcoal-900 text-sm sm:text-base leading-snug break-words">
                    {k.value}
                  </p>
                  {k.hint ? (
                    <p className="text-[10px] text-charcoal-400 mt-0.5 leading-tight">{k.hint}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Sales chart */}
      <Card className="min-w-0">
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
          <CardTitle className="text-sm sm:text-base">Sales — Last 14 Days</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="overflow-x-auto -mx-1 px-1">
            <div className="flex items-end gap-0.5 sm:gap-1 h-32 sm:h-40 min-w-[280px]">
              {data.salesByDay.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 min-w-[14px]">
                  <div
                    className="w-full max-w-[28px] mx-auto bg-primary-500 rounded-t min-h-[2px]"
                    style={{
                      height: `${Math.max((d.total / maxSales) * 100, 2)}%`,
                    }}
                    title={`${d.date}: ${formatETB(d.total)}`}
                  />
                  <span className="text-[8px] sm:text-[9px] text-charcoal-400 tabular-nums">
                    {d.date.slice(8)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        <Card className="min-w-0">
          <CardHeader className="p-3 sm:p-6 flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-sm sm:text-base">Recent Orders</CardTitle>
            <Link
              to="/admin/orders"
              className="text-xs sm:text-sm text-primary-600 font-medium shrink-0"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-charcoal-500">No orders yet</p>
            ) : (
              <ul className="space-y-2.5 sm:space-y-3">
                {data.recentOrders.map((o) => (
                  <li
                    key={o.id}
                    className="flex justify-between items-start gap-2 text-sm border-b border-charcoal-50 last:border-0 pb-2 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="font-medium hover:text-primary-600 text-xs sm:text-sm break-all"
                      >
                        {o.order_number}
                      </Link>
                      <p className="text-[11px] sm:text-xs text-charcoal-500 capitalize">{o.status}</p>
                    </div>
                    <span className="font-medium text-xs sm:text-sm shrink-0 tabular-nums">
                      {formatETB(o.total)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="p-3 sm:p-6 flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-sm sm:text-base">Low Stock</CardTitle>
            <Link
              to="/admin/products"
              className="text-xs sm:text-sm text-primary-600 font-medium shrink-0"
            >
              Manage
            </Link>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {data.lowStock.length === 0 ? (
              <p className="text-sm text-charcoal-500">All products well stocked</p>
            ) : (
              <ul className="space-y-2">
                {data.lowStock.map((p: { id: string; name: string; stock_quantity: number }) => (
                  <li
                    key={p.id}
                    className="flex justify-between items-center gap-2 text-sm border-b border-charcoal-50 last:border-0 pb-2 last:pb-0"
                  >
                    <span className="truncate text-xs sm:text-sm min-w-0">{p.name}</span>
                    <span className="text-red-600 font-medium shrink-0 text-xs sm:text-sm">
                      {p.stock_quantity} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
