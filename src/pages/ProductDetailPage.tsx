import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, Minus, Plus, ArrowLeft } from 'lucide-react'
import { getProductBySlug, getRelatedProducts } from '@/services/products'
import { ProductCard } from '@/components/products/ProductCard'
import { useCart } from '@/features/cart/CartContext'
import { Button } from '@/components/ui/button'
import { formatETB, calculateDiscountPercent, getEffectivePrice } from '@/lib/utils'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  })

  const { data: related } = useQuery({
    queryKey: ['related', product?.category_id, product?.id],
    queryFn: () => getRelatedProducts(product!.category_id!, product!.id, 4),
    enabled: !!product?.category_id,
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto container-padding py-12">
        <div className="animate-pulse grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-charcoal-100 rounded-xl" />
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
        <p className="text-charcoal-500 text-lg">Product not found</p>
        <Link to="/shop"><Button className="mt-4">Back to Shop</Button></Link>
      </div>
    )
  }

  const images = product.images?.length ? product.images : []
  const primary = images[selectedImage] || images[0]
  const discount = calculateDiscountPercent(product.price, product.discount_price)
  const effective = getEffectivePrice(product.price, product.discount_price)
  const outOfStock = product.stock_quantity < 1

  return (
    <div className="max-w-7xl mx-auto container-padding py-8">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-charcoal-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="aspect-square bg-charcoal-50 rounded-xl overflow-hidden border border-charcoal-100">
            {primary ? (
              <img src={primary.url} alt={primary.alt_text || product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-charcoal-200">
                {product.name.charAt(0)}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${selectedImage === i ? 'border-primary-600' : 'border-transparent'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <Link to={`/shop?category=${product.category.id}`} className="text-sm text-primary-600 hover:underline">
              {product.category.name}
            </Link>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 mt-1">{product.name}</h1>
          {product.brand && <p className="text-charcoal-500 mt-1">Brand: {product.brand}</p>}

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-2xl font-bold text-primary-600">{formatETB(effective)}</span>
            {discount && (
              <>
                <span className="text-lg text-charcoal-400 line-through">{formatETB(product.price)}</span>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">-{discount}%</span>
              </>
            )}
          </div>

          <p className={`mt-2 text-sm font-medium ${outOfStock ? 'text-red-600' : 'text-green-600'}`}>
            {outOfStock ? 'Out of Stock' : `In Stock (${product.stock_quantity} available)`}
          </p>

          {product.description && (
            <div className="mt-6">
              <h2 className="font-semibold text-charcoal-900 mb-2">Description</h2>
              <p className="text-charcoal-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {!outOfStock && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center border border-charcoal-200 rounded-lg">
                <button className="p-2 hover:bg-charcoal-50" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button className="p-2 hover:bg-charcoal-50" onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))} aria-label="Increase quantity">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button size="lg" onClick={() => addItem(product, qty)} className="flex-1 sm:flex-none">
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-charcoal-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
