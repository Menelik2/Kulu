import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminGetOrder, adminUpdateOrderStatus } from '@/services/admin'
import { Button } from '@/components/ui/button'
import { formatETB } from '@/lib/utils'

const FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const

export default function AdminOrderDetail() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { data: order, isLoading } = useQuery({ queryKey: ['admin', 'order', id], queryFn: () => adminGetOrder(id!), enabled: !!id })
  const update = useMutation({
    mutationFn: (status: string) => adminUpdateOrderStatus(id!, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'order', id] }); qc.invalidateQueries({ queryKey: ['admin', 'orders'] }); toast.success('Status updated') },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading || !order) return <div className="p-6"><div className="animate-pulse h-48 bg-charcoal-100 rounded-xl" /></div>

  return (
    <div className="p-4 sm:p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">{order.order_number}</h1>
          <p className="text-sm text-charcoal-500">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <Link to="/admin/orders"><Button variant="outline" size="sm">Back</Button></Link>
      </div>
      <div className="bg-white rounded-xl border p-4">
        <h2 className="font-semibold mb-3">Update Status</h2>
        <div className="flex flex-wrap gap-2">
          {FLOW.map((s) => (
            <Button key={s} size="sm" variant={order.status === s ? 'default' : 'outline'} className="capitalize" disabled={update.isPending} onClick={() => update.mutate(s)}>{s}</Button>
          ))}
          <Button size="sm" variant={order.status === 'cancelled' ? 'destructive' : 'outline'} disabled={update.isPending} onClick={() => update.mutate('cancelled')}>Cancel</Button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4 space-y-2 text-sm">
          <h2 className="font-semibold">Customer</h2>
          <p>{order.customer_name}</p>
          <p className="text-charcoal-500">{order.customer_phone}</p>
          <p className="text-charcoal-500">{order.customer_email}</p>
        </div>
        <div className="bg-white rounded-xl border p-4 space-y-2 text-sm">
          <h2 className="font-semibold">Delivery</h2>
          <p>{order.delivery_city}, {order.delivery_region}</p>
          {order.delivery_sub_city && <p className="text-charcoal-500">{order.delivery_sub_city}</p>}
          <p className="capitalize">Payment: Cash on Delivery</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-charcoal-50 text-left"><tr><th className="px-4 py-3">Item</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Total</th></tr></thead>
          <tbody className="divide-y">
            {order.items?.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.product_name}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{formatETB(item.unit_price)}</td>
                <td className="px-4 py-3 font-medium">{formatETB(item.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t p-4 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-charcoal-500">Subtotal</span><span>{formatETB(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-charcoal-500">Delivery</span><span>{formatETB(order.delivery_fee)}</span></div>
          <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary-600">{formatETB(order.total)}</span></div>
        </div>
      </div>
    </div>
  )
}
