import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  MapPin,
  Star,
} from 'lucide-react'
import { getProductBySlug, getRelatedProducts } from '@/services/products'
import { ProductCard } from '@/components/products/ProductCard'
import { useCart } from '@/features/cart/CartContext'
import { useLanguage } from '@/features/language/LanguageContext'
import { Button } from '@/components/ui/button'
import { formatETB, calculateDiscountPercent, getEffectivePrice, cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { addItem } = useCart()
  const { t } = useLanguage()
  const [qty, setQty] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  })

  const { data: related } = useQuery({
    queryKey: ['related', product?.category_id, product?.id],
    queryFn: () => getRelatedProducts(product!.category_id!, product!.id, 5),
    enabled: !!product?.category_id,
  })

  const images = product?.images?.length ? product.images : []

  const openLightbox = (index: number) => {
    setSelectedImage(index)
    setLightboxOpen(true)
  }

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  const goPrev = useCallback(() => {
    if (images.length < 2) return
    setSelectedImage((i) => (i - 1 + images.length) % images.length)
  }, [images.length])

  const goNext = useCallback(() => {
    if (images.length < 2) return
    setSelectedImage((i) => (i + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightboxOpen, closeLightbox, goPrev, goNext])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto container-padding py-8 sm:py-12">
        <div className="animate-pulse grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-square bg-charcoal-100 rounded-2xl md:rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-charcoal-100 rounded w-3/4" />
            <div className="h-6 bg-charcoal-100 rounded w-1/3" />
            <div className="h-24 bg-charcoal-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto container-padding py-16 text-center">
        <p className="text-charcoal-500 text-lg">{t('productNotFound')}</p>
        <Link to="/shop">
          <Button className="mt-4 rounded-full">{t('backToShop')}</Button>
        </Link>
      </div>
    )
  }

  const primary = images[selectedImage] || images[0]
  const discount = calculateDiscountPercent(product.price, product.discount_price)
  const effective = getEffectivePrice(product.price, product.discount_price)
  const outOfStock = product.stock_quantity < 1

  return (
    <div className="max-w-7xl mx-auto container-padding py-6 sm:py-8 md:py-10 pb-28 md:pb-12">
      <Link
        to="/shop"
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-primary-600 mb-5 md:mb-8 active:opacity-70 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> {t('backToShop')}
      </Link>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-12 xl:gap-16">
        <div className="md:sticky md:top-28 md:self-start">
          <div className="flex gap-3 md:gap-4">
            {images.length > 1 && (
              <div className="hidden md:flex flex-col gap-2.5 shrink-0 max-h-[520px] overflow-y-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    onDoubleClick={() => openLightbox(i)}
                    className={cn(
                      'w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all',
                      selectedImage === i
                        ? 'border-primary-600 shadow-md'
                        : 'border-charcoal-100 hover:border-charcoal-300'
                    )}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => primary && openLightbox(selectedImage)}
              className="block flex-1 aspect-square bg-charcoal-50 rounded-2xl md:rounded-3xl overflow-hidden border border-charcoal-100 elevation-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 active:opacity-95 group"
              aria-label="View image full screen"
            >
              {primary ? (
                <img
                  src={primary.url}
                  alt={primary.alt_text || product.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-charcoal-200">
                  {product.name.charAt(0)}
                </div>
              )}
            </button>
          </div>

          {images.length > 1 && (
            <div className="flex md:hidden gap-2 mt-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  onDoubleClick={() => openLightbox(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-colors ${
                    selectedImage === i ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:sticky md:top-28 md:self-start">
          {product.category && (
            <Link
              to={`/shop?category=${product.category.id}`}
              className="text-sm text-primary-600 hover:underline font-medium"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal-900 mt-1 leading-snug tracking-tight">
            {product.name}
          </h1>
          {product.brand && (
            <p className="text-charcoal-500 mt-1.5 text-sm md:text-base">
              {t('brand')}: <span className="font-medium text-charcoal-700">{product.brand}</span>
            </p>
          )}

          {(product.average_rating ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 mt-3">
              <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
              <span className="text-sm font-medium text-charcoal-700">
                {product.average_rating!.toFixed(1)}
              </span>
              {product.review_count ? (
                <span className="text-sm text-charcoal-400">({product.review_count})</span>
              ) : null}
            </div>
          )}

          <div className="flex items-baseline gap-3 mt-4 md:mt-5">
            <span className="text-2xl md:text-3xl font-bold text-primary-600">{formatETB(effective)}</span>
            {discount && (
              <>
                <span className="text-lg text-charcoal-400 line-through">{formatETB(product.price)}</span>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <p className={`mt-2 text-sm font-medium ${outOfStock ? 'text-red-600' : 'text-green-600'}`}>
            {outOfStock
              ? t('outOfStock')
              : t('inStockCount', { count: product.stock_quantity })}
          </p>

          {product.description && (
            <div className="mt-6 md:mt-8">
              <h2 className="font-semibold text-charcoal-900 mb-2 md:text-lg">{t('description')}</h2>
              <p className="text-charcoal-600 text-sm md:text-[15px] leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          <div className="hidden md:grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-charcoal-100">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <Truck className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal-900">{t('nationwideDelivery')}</p>
                <p className="text-[11px] text-charcoal-500">{t('allRegions')}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal-900">{t('cashOnDelivery')}</p>
                <p className="text-[11px] text-charcoal-500">{t('payWhenReceive')}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <Shield className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal-900">{t('secureShopping')}</p>
                <p className="text-[11px] text-charcoal-500">{t('safeProtected')}</p>
              </div>
            </div>
          </div>

          {!outOfStock && (
            <div className="hidden md:flex mt-8 flex-wrap items-center gap-4">
              <div className="flex items-center border border-charcoal-200 rounded-full overflow-hidden bg-white shadow-sm">
                <button
                  className="p-3.5 hover:bg-charcoal-50 transition-colors"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-semibold text-base">{qty}</span>
                <button
                  className="p-3.5 hover:bg-charcoal-50 transition-colors"
                  onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                size="lg"
                onClick={() => addItem(product, qty)}
                className="rounded-full h-12 px-10 font-semibold shadow-md hover:shadow-lg transition-shadow"
              >
                <ShoppingCart className="h-5 w-5" />
                {t('addToCart')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="mt-12 sm:mt-16 md:mt-20">
          <h2 className="text-xl md:text-2xl font-bold text-charcoal-900 mb-5 md:mb-8">{t('relatedProducts')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {!outOfStock && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-charcoal-100 px-4 py-3 safe-bottom elevation-3">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex items-center border border-charcoal-200 rounded-full overflow-hidden shrink-0">
              <button
                className="p-2.5 active:bg-charcoal-50"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-semibold text-sm">{qty}</span>
              <button
                className="p-2.5 active:bg-charcoal-50"
                onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              className="flex-1 rounded-full h-12"
              size="lg"
              onClick={() => addItem(product, qty)}
            >
              <ShoppingCart className="h-5 w-5" />
              {t('addToCart')}
            </Button>
          </div>
        </div>
      )}

      {lightboxOpen && primary && (
        <div
          className="fixed inset-0 z-[100] bg-black flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
        >
          <div className="flex items-center justify-between px-3 pt-safe safe-top h-14 shrink-0">
            <span className="text-white/80 text-sm px-2 truncate max-w-[60%]">
              {product.name}
              {images.length > 1 && (
                <span className="text-white/50 ml-2">
                  {selectedImage + 1}/{images.length}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={closeLightbox}
              className="w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center active:bg-white/20"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div
            className="flex-1 relative flex items-center justify-center min-h-0 px-2"
            onClick={closeLightbox}
          >
            <img
              src={primary.url}
              alt={primary.alt_text || product.name}
              className="max-w-full max-h-full object-contain select-none"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goPrev()
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center active:bg-white/25"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goNext()
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center active:bg-white/25"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="shrink-0 flex justify-center gap-2 pb-6 pt-3 px-4 overflow-x-auto safe-bottom">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${
                    selectedImage === i ? 'border-white' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
