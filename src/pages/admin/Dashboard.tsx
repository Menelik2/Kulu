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
} from 'lucide-react'
import { adminGetDashboardStats } from '@/services/admin'
import { formatETB } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminGetDashboardStats,
  })

  if (isLoading || !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-charcoal-100 rounded w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-charcoal-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const kpis = [
    {
      label: 'Inventory value',
      value: formatETB(data.inventoryValue),
      icon: Layers,
      color: 'text-emerald-700 bg-emerald-50',
      hint: 'Stock × sell price (all products)',
    },
    {
      label: 'Total Sales',
      value: formatETB(data.totalSales),
      icon: DollarSign,
      color: 'text-primary-600 bg-primary-50',
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
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">Dashboard</h1>
          <p className="text-sm text-charcoal-500 mt-0.5">
            Inventory value: sell price × stock for every product
          </p>
        </div>
        <Link to="/">
          <Button variant="outline" className="rounded-full gap-2 w-full sm:w-auto">
            <Store className="h-4 w-4" />
            Back to Store
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${k.color}`}>
                <k.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-charcoal-500 truncate">{k.label}</p>
                <p className="font-bold text-charcoal-900 truncate">{k.value}</p>
                {'hint' in k && k.hint ? (
                  <p className="text-[10px] text-charcoal-400 truncate">{k.hint}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sales — Last 14 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-40">
            {data.salesByDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary-500 rounded-t min-h-[2px]"
                  style={{ height: `${Math.max((d.total / maxSales) * 100, 2)}%` }}
                  title={`${d.date}: ${formatETB(d.total)}`}
                />
                <span className="text-[9px] text-charcoal-400 hidden sm:block">{d.date.slice(8)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Link to="/admin/orders" className="text-sm text-primary-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-charcoal-500">No orders yet</p>
            ) : (
              <ul className="space-y-3">
                {data.recentOrders.map((o) => (
                  <li key={o.id} className="flex justify-between text-sm">
                    <div>
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="font-medium hover:text-primary-600"
                      >
                        {o.order_number}
                      </Link>
                      <p className="text-xs text-charcoal-500 capitalize">{o.status}</p>
                    </div>
                    <span className="font-medium">{formatETB(o.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Low Stock</CardTitle>
            <Link to="/admin/products" className="text-sm text-primary-600 hover:underline">
              Manage
            </Link>
          </CardHeader>
          <CardContent>
            {data.lowStock.length === 0 ? (
              <p className="text-sm text-charcoal-500">All products well stocked</p>
            ) : (
              <ul className="space-y-2">
                {data.lowStock.map((p: { id: string; name: string; stock_quantity: number }) => (
                  <li key={p.id} className="flex justify-between text-sm">
                    <span className="truncate mr-2">{p.name}</span>
                    <span className="text-red-600 font-medium shrink-0">{p.stock_quantity} left</span>
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
