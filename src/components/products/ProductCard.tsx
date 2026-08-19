import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import type { Product } from '@/types/database'
import { formatETB, calculateDiscountPercent, getEffectivePrice } from '@/lib/utils'
import { useCart } from '@/features/cart/CartContext'
import { Button } from '@/components/ui/button'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0]
  const discount = calculateDiscountPercent(product.price, product.discount_price)
  const effectivePrice = getEffectivePrice(product.price, product.discount_price)
  const outOfStock = product.stock_quantity < 1

  return (
    <div className="group bg-white rounded-xl border border-charcoal-100 overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/products/${product.slug}`} className="block relative aspect-square bg-charcoal-50 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt_text || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal-300">
            <span className="text-4xl font-bold opacity-30">{product.name.charAt(0)}</span>
          </div>
        )}
        {discount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
            -{discount}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-2 right-2 bg-charcoal-800 text-white text-xs font-medium px-2 py-0.5 rounded">
            Out of Stock
          </span>
        )}
      </Link>

      <div className="p-3 sm:p-4">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-medium text-sm sm:text-base text-charcoal-900 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.average_rating !== undefined && product.average_rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
            <span className="text-xs text-charcoal-600">
              {product.average_rating.toFixed(1)}
              {product.review_count ? ` (${product.review_count})` : ''}
            </span>
          </div>
        )}

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-bold text-primary-600">{formatETB(effectivePrice)}</span>
          {discount && (
            <span className="text-xs text-charcoal-400 line-through">{formatETB(product.price)}</span>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            disabled={outOfStock}
            onClick={(e) => {
              e.preventDefault()
              addItem(product)
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
