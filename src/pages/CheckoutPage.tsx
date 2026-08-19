import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/AuthContext'
import { useCart } from '@/features/cart/CartContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatETB, getEffectivePrice } from '@/lib/utils'

const ETHIOPIAN_REGIONS = [
  'Addis Ababa', 'Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Sidama',
  'Dire Dawa', 'Harari', 'Somali', 'Afar', 'Benishangul-Gumuz', 'Gambela',
]

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(9, 'Valid Ethiopian phone required').regex(/^(\+251|0)?[79]\d{8}$/, 'Use format +2519XXXXXXXX or 09XXXXXXXX'),
  email: z.string().email('Valid email required'),
  region: z.string().min(1, 'Select a region'),
  city: z.string().min(1, 'City is required'),
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
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: profile?.full_name || '',
      phone: profile?.phone || '',
      email: profile?.email || user?.email || '',
      region: 'Addis Ababa',
      city: '',
    },
  })

  const region = watch('region')

  const estimateFee = (r: string) => {
    const fees: Record<string, number> = {
      'Addis Ababa': 80, Oromia: 150, Amhara: 180, Tigray: 220,
      SNNPR: 180, Sidama: 160, 'Dire Dawa': 200, Harari: 200,
      Somali: 250, Afar: 250, 'Benishangul-Gumuz': 220, Gambela: 250,
    }
    return fees[r] ?? 150
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto container-padding py-16 text-center">
        <p className="text-charcoal-500">Your cart is empty.</p>
        <Link to="/shop"><Button className="mt-4">Go Shopping</Button></Link>
      </div>
    )
  }

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error('Please sign in to place an order')
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
        toast.error(error.message || 'Failed to place order')
        return
      }

      clearCart()
      toast.success('Order placed successfully!')
      navigate(`/order-confirmation/${orderId}`)
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fee = estimateFee(region)
  const total = subtotal + fee

  return (
    <div className="max-w-7xl mx-auto container-padding py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-xl border border-charcoal-100 p-6">
            <h2 className="font-semibold text-lg mb-4">Customer Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" {...register('fullName')} />
                {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" placeholder="+2519XXXXXXXX" {...register('phone')} />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-charcoal-100 p-6">
            <h2 className="font-semibold text-lg mb-4">Delivery Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <select
                  id="region"
                  {...register('region')}
                  className="flex h-10 w-full rounded-lg border border-charcoal-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                >
                  {ETHIOPIAN_REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.region && <p className="text-sm text-red-600">{errors.region.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" placeholder="e.g. Bole, Adama" {...register('city')} />
                {errors.city && <p className="text-sm text-red-600">{errors.city.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="subCity">Sub-city</Label>
                <Input id="subCity" {...register('subCity')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="woreda">Woreda</Label>
                <Input id="woreda" {...register('woreda')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kebele">Kebele</Label>
                <Input id="kebele" {...register('kebele')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="houseInfo">House / Building</Label>
                <Input id="houseInfo" {...register('houseInfo')} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                <Input id="deliveryInstructions" placeholder="Landmark, gate code, etc." {...register('deliveryInstructions')} />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-charcoal-100 p-6">
            <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
            <div className="flex items-center gap-3 p-4 border-2 border-primary-600 rounded-lg bg-primary-50">
              <div className="w-5 h-5 rounded-full border-2 border-primary-600 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />
              </div>
              <div>
                <p className="font-medium text-charcoal-900">Cash on Delivery</p>
                <p className="text-sm text-charcoal-500">Pay when you receive your order</p>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-charcoal-100 p-6 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
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
                <span className="text-charcoal-500">Subtotal</span>
                <span>{formatETB(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Delivery ({region})</span>
                <span>{formatETB(fee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-charcoal-100">
                <span>Total</span>
                <span className="text-primary-600">{formatETB(total)}</span>
              </div>
            </div>
            <Button type="submit" className="w-full mt-6" size="lg" loading={loading}>
              Place Order
            </Button>
            <p className="text-xs text-charcoal-400 text-center mt-3">
              Prices are verified server-side. Stock is protected against overselling.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
