import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { formatETB } from '@/lib/utils'
import type { Order } from '@/types/database'

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', orderId!)
        .single()
      if (error) throw error
      return data as Order
    },
    enabled: !!orderId,
  })

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto container-padding py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-lg mx-auto container-padding py-16 text-center">
        <p className="text-charcoal-500">Order not found</p>
        <Link to="/orders"><Button className="mt-4">My Orders</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto container-padding py-12">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal-900 mt-4">Order Placed Successfully!</h1>
        <p className="text-charcoal-500 mt-2">Thank you for shopping with KULU</p>
      </div>

      <div className="bg-white rounded-xl border border-charcoal-100 p-6 mt-8 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-500">Order Number</span>
          <span className="font-mono font-semibold">{order.order_number}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-500">Total</span>
          <span className="font-bold text-primary-600">{formatETB(order.total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-500">Payment</span>
          <span className="capitalize">Cash on Delivery</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-500">Delivery to</span>
          <span className="text-right">{order.delivery_city}, {order.delivery_region}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-500">Status</span>
          <span className="capitalize font-medium text-amber-600">{order.status}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link to={`/orders/${order.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            <Package className="h-4 w-4" />
            Track Order
          </Button>
        </Link>
        <Link to="/shop" className="flex-1">
          <Button className="w-full">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
