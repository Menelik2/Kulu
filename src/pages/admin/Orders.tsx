import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { adminDeleteOrder, adminGetOrders } from '@/services/admin'
import { formatETB, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const STATUSES = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [status, setStatus] = useState('')
  const qc = useQueryClient()
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin', 'orders', status],
    queryFn: () => adminGetOrders(status || undefined),
  })

  const del = useMutation({
    mutationFn: adminDeleteOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
      toast.success('Order deleted')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not delete order'),
  })

  const onDelete = (id: string, orderNumber: string) => {
    if (
      confirm(
        `Delete order ${orderNumber}? This cannot be undone. Order items will be removed too.`
      )
    ) {
      del.mutate(id)
    }
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 max-w-full overflow-x-hidden pb-8">
      <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900">Orders</h1>

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {STATUSES.map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setStatus(s)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs sm:text-sm capitalize shrink-0 whitespace-nowrap',
              status === s
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-charcoal-200 hover:bg-charcoal-50'
            )}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-charcoal-100 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {orders?.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-xl border border-charcoal-100 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-charcoal-900 break-all">
                      {o.order_number}
                    </p>
                    <p className="text-sm font-medium text-charcoal-800 mt-0.5 truncate">
                      {o.customer_name}
                    </p>
                    <p className="text-xs text-charcoal-500">{o.customer_phone}</p>
                  </div>
                  <span className="capitalize text-[10px] px-2 py-0.5 rounded-full bg-charcoal-100 shrink-0">
                    {o.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-primary-600">{formatETB(o.total)}</span>
                  <span className="text-xs text-charcoal-400">
                    {new Date(o.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Link to={`/admin/orders/${o.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full h-9 rounded-lg text-xs">
                      View <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-red-600 border-red-200"
                    disabled={del.isPending}
                    onClick={() => onDelete(o.id, o.order_number)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {orders?.length === 0 && (
              <p className="text-center text-charcoal-500 py-10 text-sm">No orders</p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-charcoal-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders?.map((o) => (
                    <tr key={o.id} className="hover:bg-charcoal-50">
                      <td className="px-4 py-3 font-mono text-xs font-medium">{o.order_number}</td>
                      <td className="px-4 py-3">
                        <div>{o.customer_name}</div>
                        <div className="text-xs text-charcoal-500">{o.customer_phone}</div>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatETB(o.total)}</td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-charcoal-100">
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-charcoal-500 text-xs">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link to={`/admin/orders/${o.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={del.isPending}
                            title="Delete order"
                            onClick={() => onDelete(o.id, o.order_number)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orders?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-charcoal-500">
                        No orders
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
