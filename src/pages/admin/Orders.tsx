import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
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

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h1 className="text-2xl font-bold text-charcoal-900">Orders</h1>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatus(s)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm capitalize',
              status === s ? 'bg-primary-600 text-white' : 'bg-white border border-charcoal-200 hover:bg-charcoal-50'
            )}
          >
            {s || 'All'}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-charcoal-100 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
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
                      <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-charcoal-100">{o.status}</span>
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
                          onClick={() => {
                            if (
                              confirm(
                                `Delete order ${o.order_number}? This cannot be undone. Order items will be removed too.`
                              )
                            ) {
                              del.mutate(o.id)
                            }
                          }}
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
      )}
    </div>
  )
}
