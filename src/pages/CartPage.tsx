import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/features/cart/CartContext'
import { Button } from '@/components/ui/button'
import { formatETB, getEffectivePrice } from '@/lib/utils'

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto container-padding py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-charcoal-300" />
        <h1 className="text-2xl font-bold text-charcoal-900 mt-4">Your cart is empty</h1>
        <p className="text-charcoal-500 mt-2">Looks like you haven&apos;t added anything yet.</p>
        <Link to="/shop">
          <Button className="mt-6">Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto container-padding py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
          Shopping Cart ({itemCount})
        </h1>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-600 hover:text-red-700">
          Clear all
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product
            if (!product) return null
            const price = getEffectivePrice(product.price, product.discount_price)
            const img = product.images?.find((i) => i.is_primary) || product.images?.[0]

            return (
              <div key={item.product_id} className="bg-white rounded-xl border border-charcoal-100 p-4 flex gap-4">
                <Link to={`/products/${product.slug}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-charcoal-50 overflow-hidden shrink-0">
                  {img ? (
                    <img src={img.url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-charcoal-200">
                      {product.name.charAt(0)}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product.slug}`} className="font-medium text-charcoal-900 hover:text-primary-600 line-clamp-2">
                    {product.name}
                  </Link>
                  <p className="text-sm text-charcoal-500 mt-0.5">{formatETB(price)} each</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-charcoal-200 rounded-lg">
                      <button
                        className="p-1.5 hover:bg-charcoal-50"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        className="p-1.5 hover:bg-charcoal-50"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        aria-label="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-charcoal-900">{formatETB(price * item.quantity)}</span>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="p-1.5 text-charcoal-400 hover:text-red-600"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-charcoal-100 p-6 sticky top-24">
            <h2 className="font-semibold text-lg text-charcoal-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Subtotal</span>
                <span className="font-medium">{formatETB(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Delivery</span>
                <span className="text-charcoal-500">Calculated at checkout</span>
              </div>
            </div>
            <div className="border-t border-charcoal-100 mt-4 pt-4 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg text-primary-600">{formatETB(subtotal)}</span>
            </div>
            <Link to="/checkout">
              <Button className="w-full mt-6" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            <Link to="/shop" className="block text-center text-sm text-primary-600 hover:underline mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
