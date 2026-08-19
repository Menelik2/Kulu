import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { getMyOrders } from '@/services/admin'
import { Button } from '@/components/ui/button'
import { formatETB } from '@/lib/utils'

export default function OrdersPage() {
  const { user } = useAuth()
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: () => getMyOrders(user!.id),
    enabled: !!user,
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto container-padding py-12">
        <div className="animate-pulse space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-charcoal-100 rounded-xl" />)}</div>
      </div>
    )
  }

  if (!orders?.length) {
    return (
      <div className="max-w-3xl mx-auto container-padding py-16 text-center">
        <Package className="h-12 w-12 mx-auto text-charcoal-300" />
        <h1 className="text-2xl font-bold mt-4">No orders yet</h1>
        <p className="text-charcoal-500 mt-2">When you place an order, it will show up here.</p>
        <Link to="/shop"><Button className="mt-6">Start Shopping</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto container-padding py-8">
      <h1 className="text-2xl font-bold text-charcoal-900 mb-6">My Orders</h1>
      <ul className="space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="bg-white rounded-xl border border-charcoal-100 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-sm font-medium">{o.order_number}</p>
                <p className="text-xs text-charcoal-500">{new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600">{formatETB(o.total)}</p>
                <p className="text-xs capitalize text-charcoal-500">{o.status}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-sm text-charcoal-500">{o.items?.length || 0} item(s)</p>
              <Link to={`/orders/${o.id}`}><Button variant="outline" size="sm">Track</Button></Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
