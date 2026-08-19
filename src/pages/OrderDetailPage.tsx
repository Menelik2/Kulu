import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { getMyOrder } from '@/services/admin'
import { Button } from '@/components/ui/button'
import { formatETB, cn } from '@/lib/utils'

const STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const { data: order, isLoading } = useQuery({
    queryKey: ['my-order', orderId],
    queryFn: () => getMyOrder(orderId!),
    enabled: !!orderId,
  })

  if (isLoading || !order) {
    return <div className="max-w-2xl mx-auto container-padding py-12"><div className="animate-pulse h-64 bg-charcoal-100 rounded-xl" /></div>
  }

  const statusIdx = STEPS.findIndex((s) => s.key === order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="max-w-2xl mx-auto container-padding py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-charcoal-900">{order.order_number}</h1>
          <p className="text-sm text-charcoal-500">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <Link to="/orders"><Button variant="outline" size="sm">Back</Button></Link>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Order Tracking</h2>
        {isCancelled ? (
          <p className="text-red-600 font-medium">This order was cancelled.</p>
        ) : (
          <ol className="relative border-l-2 border-charcoal-100 ml-3 space-y-6">
            {STEPS.map((step, i) => {
              const done = statusIdx >= i
              const current = statusIdx === i
              return (
                <li key={step.key} className="ml-6">
                  <span className={cn('absolute -left-3.5 flex h-6 w-6 items-center justify-center rounded-full border-2', done ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-charcoal-200')}>
                    {done && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <p className={cn('text-sm font-medium', current && 'text-primary-600', !done && 'text-charcoal-400')}>{step.label}</p>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      <div className="bg-white rounded-xl border p-4 space-y-2 text-sm">
        <h2 className="font-semibold">Delivery</h2>
        <p>{order.customer_name} · {order.customer_phone}</p>
        <p className="text-charcoal-500">{order.delivery_city}, {order.delivery_region}</p>
        <p className="capitalize">Payment: Cash on Delivery</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <ul className="divide-y">
          {order.items?.map((item) => (
            <li key={item.id} className="px-4 py-3 flex justify-between text-sm">
              <span>{item.product_name} × {item.quantity}</span>
              <span className="font-medium">{formatETB(item.total_price)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t px-4 py-3 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-primary-600">{formatETB(order.total)}</span>
        </div>
      </div>
    </div>
  )
}
