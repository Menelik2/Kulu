import { memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Star, Heart } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Product } from '@/types/database'
import { formatETB, calculateDiscountPercent, getEffectivePrice, cn } from '@/lib/utils'
import { useCart } from '@/features/cart/CartContext'
import { useAuth } from '@/features/auth/AuthContext'
import { useLanguage } from '@/features/language/LanguageContext'
import { getWishlistProductIds, toggleWishlist } from '@/services/wishlist'
import { Button } from '@/components/ui/button'

interface ProductCardProps {
  product: Product
}

function ProductCardComponent({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0]
  const discount = calculateDiscountPercent(product.price, product.discount_price)
  const effectivePrice = getEffectivePrice(product.price, product.discount_price)
  const outOfStock = product.stock_quantity < 1

  const { data: wishIds } = useQuery({
    queryKey: ['wishlist-ids', user?.id],
    queryFn: () => getWishlistProductIds(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  })

  const wished = !!wishIds?.has(product.id)

  const toggle = useMutation({
    mutationFn: () => toggleWishlist(user!.id, product.id),
    onSuccess: (nowOn) => {
      qc.invalidateQueries({ queryKey: ['wishlist-ids', user?.id] })
      qc.invalidateQueries({ queryKey: ['wishlist', user?.id] })
      toast.success(nowOn ? t('wishlist') : t('removedFromWishlist'))
    },
    onError: () => toast.error(t('failedLoad')),
  })

  const onHeartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.info(t('signInToWishlist'))
      navigate('/login')
      return
    }
    toggle.mutate()
  }

  return (
    <div className="group bg-white rounded-2xl border border-charcoal-100 overflow-hidden elevation-1 hover:elevation-3 hover:border-charcoal-200 md:hover:-translate-y-1 active:scale-[0.98] transition-all duration-200">
      <div className="relative aspect-square bg-charcoal-50 overflow-hidden">
        <Link to={`/products/${product.slug}`} className="block w-full h-full">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt_text || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal-300">
              <span className="text-4xl font-bold opacity-30">{product.name.charAt(0)}</span>
            </div>
          )}
        </Link>

        {discount && (
          <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-red-500 text-white text-[11px] md:text-xs font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full shadow-sm z-[1]">
            -{discount}%
          </span>
        )}

        <button
          type="button"
          onClick={onHeartClick}
          disabled={toggle.isPending}
          className={cn(
            'absolute top-2 right-2 md:top-3 md:right-3 z-[2] w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center',
            'active:scale-95 md:hover:scale-110 transition-all disabled:opacity-60',
            wished ? 'text-red-500' : 'text-charcoal-400 md:hover:text-red-400'
          )}
          aria-label={t('wishlist')}
        >
          <Heart className={cn('h-4 w-4 md:h-[18px] md:w-[18px]', wished && 'fill-red-500')} />
        </button>

        {outOfStock && (
          <span className="absolute bottom-2 left-2 md:bottom-3 md:left-3 bg-charcoal-800/90 text-white text-[11px] font-medium px-2 py-0.5 rounded-full z-[1]">
            {t('outOfStock')}
          </span>
        )}
      </div>

      <div className="p-3 sm:p-3.5 md:p-4">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-medium text-sm md:text-[15px] text-charcoal-900 line-clamp-2 hover:text-primary-600 transition-colors leading-snug min-h-[2.5rem] md:min-h-[2.75rem]">
            {product.name}
          </h3>
        </Link>

        {product.average_rating !== undefined && product.average_rating > 0 && (
          <div className="flex items-center gap-1 mt-1 md:mt-1.5">
            <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
            <span className="text-xs md:text-[13px] text-charcoal-600">
              {product.average_rating.toFixed(1)}
              {product.review_count ? ` (${product.review_count})` : ''}
            </span>
          </div>
        )}

        <div className="mt-1.5 md:mt-2 flex items-baseline gap-1.5">
          <span className="font-bold text-primary-600 text-[15px] md:text-base">{formatETB(effectivePrice)}</span>
          {discount && (
            <span className="text-xs md:text-sm text-charcoal-400 line-through">{formatETB(product.price)}</span>
          )}
        </div>

        <div className="mt-2.5 md:mt-3">
          <Button
            size="sm"
            className="w-full h-10 md:h-11 rounded-full text-xs sm:text-sm font-semibold md:shadow-sm md:hover:shadow transition-shadow"
            disabled={outOfStock}
            onClick={(e) => {
              e.preventDefault()
              addItem(product)
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{t('add')}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export const ProductCard = memo(ProductCardComponent)
