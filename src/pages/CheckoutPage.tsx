import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/AuthContext'
import { useCart } from '@/features/cart/CartContext'
import { useLanguage } from '@/features/language/LanguageContext'
import { supabase } from '@/lib/supabase'
import { getDeliveryConfigs, feeForRegion } from '@/services/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatETB, getEffectivePrice } from '@/lib/utils'

const FALLBACK_REGIONS = [
  'Addis Ababa', 'Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Sidama',
  'Dire Dawa', 'Harari', 'Somali', 'Afar', 'Benishangul-Gumuz', 'Gambela',
]

const schema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(9).regex(/^(\+251|0)?[79]\d{8}$/),
  email: z.string().email(),
  region: z.string().min(1),
  city: z.string().min(1),
  subCity: z.string().optional(),
  woreda: z.string().optional(),
  kebele: z.string().optional(),
  houseInfo: z.string().optional(),
  deliveryInstructions: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function CheckoutPage() {
  const { user, profile } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { data: deliveryConfigs = [] } = useQuery({
    queryKey: ['delivery_configs'],
    queryFn: getDeliveryConfigs,
    staleTime: 1000 * 60 * 5,
  })

  const regions =
    deliveryConfigs.length > 0
      ? deliveryConfigs.map((c) => c.region)
      : FALLBACK_REGIONS

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: profile?.full_name || '',
      phone: profile?.phone || '',
      email: profile?.email || user?.email || '',
      region: regions[0] || 'Addis Ababa',
      city: '',
    },
  })

  const region = watch('region')
  const fee = feeForRegion(deliveryConfigs, region)
  const total = subtotal + fee

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto container-padding py-16 text-center">
        <p className="text-charcoal-500">{t('cartEmpty')}</p>
        <Link to="/shop">
          <Button className="mt-4 rounded-full">{t('goShopping')}</Button>
        </Link>
      </div>
    )
  }

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error(t('signIn'))
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      const orderItems = items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      }))

      const { data: orderId, error } = await supabase.rpc('create_order', {
        p_user_id: user.id,
        p_items: orderItems,
        p_customer_name: data.fullName,
        p_customer_phone: data.phone,
        p_customer_email: data.email,
        p_delivery_region: data.region,
        p_delivery_city: data.city,
        p_delivery_sub_city: data.subCity || null,
        p_delivery_woreda: data.woreda || null,
        p_delivery_kebele: data.kebele || null,
        p_delivery_house_info: data.houseInfo || null,
        p_delivery_instructions: data.deliveryInstructions || null,
        p_payment_method: 'cod',
      })

      if (error) {
        toast.error(error.message || t('orderFailed'))
        return
      }

      clearCart()
      toast.success(t('orderSuccess'))
      navigate(`/order-confirmation/${orderId}`)
    } catch (err) {
      toast.error(t('orderFailed'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto container-padding py-6 sm:py-8 pb-28 md:pb-8">
      <h1 className="text-xl sm:text-3xl font-bold text-charcoal-900 mb-6 sm:mb-8">{t('checkout')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <section className="bg-white rounded-2xl border border-charcoal-100 p-5 sm:p-6 elevation-1">
            <h2 className="font-semibold text-base sm:text-lg mb-4">{t('customerInfo')}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">{t('fullName')} *</Label>
                <Input id="fullName" className="h-12 rounded-xl" {...register('fullName')} />
                {errors.fullName && <p className="text-sm text-red-600">{t('errFullName')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('phone')} *</Label>
                <Input id="phone" placeholder="+2519XXXXXXXX" className="h-12 rounded-xl" {...register('phone')} />
                {errors.phone && <p className="text-sm text-red-600">{t('errPhone')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')} *</Label>
                <Input id="email" type="email" className="h-12 rounded-xl" {...register('email')} />
                {errors.email && <p className="text-sm text-red-600">{t('errEmail')}</p>}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-charcoal-100 p-5 sm:p-6 elevation-1">
            <h2 className="font-semibold text-base sm:text-lg mb-4">{t('deliveryAddress')}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">{t('region')} *</Label>
                <select
                  id="region"
                  {...register('region')}
                  className="flex h-12 w-full rounded-xl border border-charcoal-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                >
                  {regions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.region && <p className="text-sm text-red-600">{t('errRegion')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t('city')} *</Label>
                <Input id="city" placeholder="e.g. Bole, Adama" className="h-12 rounded-xl" {...register('city')} />
                {errors.city && <p className="text-sm text-red-600">{t('errCity')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="subCity">{t('subCity')}</Label>
                <Input id="subCity" className="h-12 rounded-xl" {...register('subCity')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="woreda">{t('woreda')}</Label>
                <Input id="woreda" className="h-12 rounded-xl" {...register('woreda')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kebele">{t('kebele')}</Label>
                <Input id="kebele" className="h-12 rounded-xl" {...register('kebele')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="houseInfo">{t('houseInfo')}</Label>
                <Input id="houseInfo" className="h-12 rounded-xl" {...register('houseInfo')} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="deliveryInstructions">{t('deliveryInstructions')}</Label>
                <Input id="deliveryInstructions" placeholder="Landmark, gate code..." className="h-12 rounded-xl" {...register('deliveryInstructions')} />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-charcoal-100 p-5 sm:p-6 elevation-1">
            <h2 className="font-semibold text-base sm:text-lg mb-4">{t('paymentMethod')}</h2>
            <div className="flex items-center gap-3 p-4 border-2 border-primary-600 rounded-2xl bg-primary-50">
              <div className="w-5 h-5 rounded-full border-2 border-primary-600 flex items-center justify-center shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />
              </div>
              <div>
                <p className="font-medium text-charcoal-900">{t('cashOnDelivery')}</p>
                <p className="text-sm text-charcoal-500">{t('payWhenReceive')}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 sticky top-24 elevation-1">
            <h2 className="font-semibold text-lg mb-4">{t('orderSummary')}</h2>
            <ul className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => {
                if (!item.product) return null
                const price = getEffectivePrice(item.product.price, item.product.discount_price)
                return (
                  <li key={item.product_id} className="flex justify-between text-sm">
                    <span className="text-charcoal-600 truncate mr-2">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium shrink-0">{formatETB(price * item.quantity)}</span>
                  </li>
                )
              })}
            </ul>
            <div className="border-t border-charcoal-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-500">{t('subtotal')}</span>
                <span>{formatETB(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">{t('delivery')} ({region})</span>
                <span>{formatETB(fee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-charcoal-100">
                <span>{t('total')}</span>
                <span className="text-primary-600">{formatETB(total)}</span>
              </div>
            </div>
            <Button type="submit" className="w-full mt-6 rounded-full" size="lg" loading={loading}>
              {t('placeOrder')}
            </Button>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-charcoal-100 px-4 py-3 safe-bottom elevation-3">
          <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
            <div>
              <p className="text-xs text-charcoal-500">{t('total')}</p>
              <p className="font-bold text-lg text-primary-600">{formatETB(total)}</p>
            </div>
            <Button type="submit" className="rounded-full h-12 px-6" size="lg" loading={loading}>
              {t('placeOrder')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
