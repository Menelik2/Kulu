import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/features/cart/CartContext'
import { useLanguage } from '@/features/language/LanguageContext'
import { Button } from '@/components/ui/button'
import { formatETB, getEffectivePrice } from '@/lib/utils'

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart()
  const { t } = useLanguage()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto container-padding py-16 md:py-24 text-center">
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-charcoal-100 flex items-center justify-center">
          <ShoppingBag className="h-10 w-10 md:h-12 md:w-12 text-charcoal-300" />
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-charcoal-900 mt-5">{t('cartEmpty')}</h1>
        <p className="text-charcoal-500 mt-2 text-sm md:text-base">{t('cartEmptyDesc')}</p>
        <Link to="/shop">
          <Button className="mt-6 rounded-full h-12 px-8 font-semibold">{t('continueShopping')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto container-padding py-6 sm:py-8 md:py-10 pb-28 md:pb-12">
      <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-charcoal-900 tracking-tight">
          {t('shoppingCart')}{' '}
          <span className="text-charcoal-400 font-semibold text-lg sm:text-2xl md:text-3xl">({itemCount})</span>
        </h1>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full">
          {t('clearAll')}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {items.map((item) => {
            const product = item.product
            if (!product) return null
            const price = getEffectivePrice(product.price, product.discount_price)
            const img = product.images?.find((i) => i.is_primary) || product.images?.[0]

            return (
              <div
                key={item.product_id}
                className="bg-white rounded-2xl border border-charcoal-100 p-3.5 sm:p-4 md:p-5 flex gap-3.5 md:gap-5 elevation-1 hover:elevation-2 transition-shadow"
              >
                <Link
                  to={`/products/${product.slug}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl md:rounded-2xl bg-charcoal-50 overflow-hidden shrink-0"
                >
                  {img ? (
                    <img src={img.url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-charcoal-200">
                      {product.name.charAt(0)}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0 flex flex-col">
                  <Link
                    to={`/products/${product.slug}`}
                    className="font-medium text-sm sm:text-base md:text-[17px] text-charcoal-900 hover:text-primary-600 line-clamp-2 leading-snug transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5 md:mt-1">
                    {formatETB(price)} {t('each')}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-2.5 md:pt-3">
                    <div className="flex items-center border border-charcoal-200 rounded-full overflow-hidden bg-charcoal-50/50">
                      <button
                        className="p-2.5 md:p-3 hover:bg-charcoal-100 transition-colors"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 md:w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        className="p-2.5 md:p-3 hover:bg-charcoal-100 transition-colors"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        aria-label="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="font-bold text-charcoal-900 text-sm sm:text-base md:text-lg">
                        {formatETB(price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="p-2 text-charcoal-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
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

        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-white rounded-2xl md:rounded-3xl border border-charcoal-100 p-6 md:p-7 sticky top-28 elevation-1 shadow-sm">
            <h2 className="font-semibold text-lg md:text-xl text-charcoal-900 mb-5">{t('orderSummary')}</h2>
            <div className="space-y-3 text-sm md:text-[15px]">
              <div className="flex justify-between">
                <span className="text-charcoal-500">{t('subtotal')}</span>
                <span className="font-medium">{formatETB(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">{t('delivery')}</span>
                <span className="text-charcoal-500">{t('deliveryCalc')}</span>
              </div>
            </div>
            <div className="border-t border-charcoal-100 mt-5 pt-5 flex justify-between items-baseline">
              <span className="font-semibold text-base">{t('total')}</span>
              <span className="font-bold text-xl md:text-2xl text-primary-600">{formatETB(subtotal)}</span>
            </div>
            <Link to="/checkout">
              <Button className="w-full mt-6 rounded-full h-12 font-semibold shadow-md hover:shadow-lg transition-shadow gap-2" size="lg">
                {t('proceedCheckout')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              to="/shop"
              className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium mt-4 transition-colors"
            >
              {t('continueShopping')}
            </Link>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-charcoal-100 px-4 py-3 safe-bottom elevation-3">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div>
            <p className="text-xs text-charcoal-500">{t('total')}</p>
            <p className="font-bold text-lg text-primary-600">{formatETB(subtotal)}</p>
          </div>
          <Link to="/checkout" className="flex-1 max-w-[200px]">
            <Button className="w-full rounded-full h-12" size="lg">
              {t('proceedCheckout')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
