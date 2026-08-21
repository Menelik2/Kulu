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
      <div className="max-w-7xl mx-auto container-padding py-16 md:py-24 text-center">
        <p className="text-charcoal-500 text-lg">{t('cartEmpty')}</p>
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

    if (!items.length) {
      toast.error(t('cartEmpty'))
      return
    }

    const validItems = items.filter((i) => i.product_id && i.quantity > 0)
    if (!validItems.length) {
      toast.error(t('orderFailed'))
      return
    }

    setLoading(true)
    try {
      const orderItems = validItems.map((i) => ({
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

      if (!orderId) {
        toast.error(t('orderFailed'))
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
    <div className="max-w-7xl mx-auto container-padding py-6 sm:py-8 md:py-10 pb-28 md:pb-12">
      <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-charcoal-900 mb-6 sm:mb-8 md:mb-10 tracking-tight">
        {t('checkout')}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-6 lg:gap-10">
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
          <section className="bg-white rounded-2xl md:rounded-3xl border border-charcoal-100 p-5 sm:p-6 md:p-7 elevation-1 shadow-sm">
            <h2 className="font-semibold text-base sm:text-lg md:text-xl mb-4 md:mb-5">{t('customerInfo')}</h2>
            <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
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

          <section className="bg-white rounded-2xl md:rounded-3xl border border-charcoal-100 p-5 sm:p-6 md:p-7 elevation-1 shadow-sm">
            <h2 className="font-semibold text-base sm:text-lg md:text-xl mb-4 md:mb-5">{t('deliveryAddress')}</h2>
            <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
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

          <section className="bg-white rounded-2xl md:rounded-3xl border border-charcoal-100 p-5 sm:p-6 md:p-7 elevation-1 shadow-sm">
            <h2 className="font-semibold text-base sm:text-lg md:text-xl mb-4 md:mb-5">{t('paymentMethod')}</h2>
            <div className="flex items-center gap-3 p-4 md:p-5 border-2 border-primary-600 rounded-2xl bg-primary-50">
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
          <div className="bg-white rounded-2xl md:rounded-3xl border border-charcoal-100 p-6 md:p-7 sticky top-28 elevation-1 shadow-sm">
            <h2 className="font-semibold text-lg md:text-xl mb-5">{t('orderSummary')}</h2>
            <ul className="space-y-3 mb-5 max-h-52 overflow-y-auto scrollbar-hide">
              {items.map((item) => {
                if (!item.product) return null
                const price = getEffectivePrice(item.product.price, item.product.discount_price)
                const img = item.product.images?.find((i) => i.is_primary) || item.product.images?.[0]
                return (
                  <li key={item.product_id} className="flex gap-3 items-start">
                    <div className="w-12 h-12 rounded-lg bg-charcoal-50 overflow-hidden shrink-0">
                      {img ? (
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-charcoal-300">
                          {item.product.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal-800 line-clamp-2 leading-snug">{item.product.name}</p>
                      <p className="text-xs text-charcoal-500 mt-0.5">× {item.quantity}</p>
                    </div>
                    <span className="font-medium text-sm shrink-0">{formatETB(price * item.quantity)}</span>
                  </li>
                )
              })}
            </ul>
            <div className="border-t border-charcoal-100 pt-4 space-y-2.5 text-sm md:text-[15px]">
              <div className="flex justify-between">
                <span className="text-charcoal-500">{t('subtotal')}</span>
                <span className="font-medium">{formatETB(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">{t('delivery')} ({region})</span>
                <span className="font-medium">{formatETB(fee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base md:text-lg pt-3 border-t border-charcoal-100 items-baseline">
                <span>{t('total')}</span>
                <span className="text-primary-600 text-xl">{formatETB(total)}</span>
              </div>
            </div>
            <Button type="submit" className="w-full mt-6 rounded-full h-12 font-semibold shadow-md hover:shadow-lg transition-shadow" size="lg" loading={loading}>
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
