import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/features/language/LanguageContext'
import { Button } from '@/components/ui/button'
import { formatETB } from '@/lib/utils'
import type { Order } from '@/types/database'

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { t } = useLanguage()

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
        <p className="text-charcoal-500">{t('orderNotFound')}</p>
        <Link to="/orders">
          <Button className="mt-4 rounded-full">{t('myOrders')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto container-padding py-12">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal-900 mt-4">{t('orderSuccess')}</h1>
        <p className="text-charcoal-500 mt-2">{t('thankYouShop')}</p>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-100 p-6 mt-8 space-y-4 elevation-1">
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-500">{t('orderNumber')}</span>
          <span className="font-mono font-semibold">{order.order_number}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-500">{t('total')}</span>
          <span className="font-bold text-primary-600">{formatETB(order.total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-500">{t('paymentMethod')}</span>
          <span>{t('cashOnDelivery')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-500">{t('deliveryTo')}</span>
          <span className="text-right">
            {order.delivery_city}, {order.delivery_region}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-500">{t('status')}</span>
          <span className="capitalize font-medium text-amber-600">{order.status}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link to={`/orders/${order.id}`} className="flex-1">
          <Button variant="outline" className="w-full rounded-full">
            <Package className="h-4 w-4" />
            {t('trackOrder')}
          </Button>
        </Link>
        <Link to="/shop" className="flex-1">
          <Button className="w-full rounded-full">{t('continueShopping')}</Button>
        </Link>
      </div>
    </div>
  )
}
