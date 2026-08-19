import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, Trash2 } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { useLanguage } from '@/features/language/LanguageContext'
import { getWishlist, toggleWishlist } from '@/services/admin'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { Product } from '@/types/database'

export default function WishlistPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const qc = useQueryClient()
  const { data: items, isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: () => getWishlist(user!.id),
    enabled: !!user,
  })
  const remove = useMutation({
    mutationFn: (productId: string) => toggleWishlist(user!.id, productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist', user?.id] })
      toast.success(t('removedFromWishlist'))
    },
  })

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto container-padding py-16 text-center">
        <p className="text-charcoal-500">{t('signInToWishlist')}</p>
        <Link to="/login">
          <Button className="mt-4 rounded-full">{t('signIn')}</Button>
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto container-padding py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-charcoal-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const products = (items || [])
    .map((i: { product?: Product }) => i.product)
    .filter(Boolean) as Product[]

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto container-padding py-16 text-center">
        <Heart className="h-12 w-12 mx-auto text-charcoal-300" />
        <h1 className="text-2xl font-bold mt-4">{t('wishlistEmpty')}</h1>
        <p className="text-charcoal-500 mt-2">{t('wishlistEmptyDesc')}</p>
        <Link to="/shop">
          <Button className="mt-6 rounded-full">{t('browseProducts')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto container-padding py-8">
      <h1 className="text-2xl font-bold text-charcoal-900 mb-6">
        {t('wishlist')} ({products.length})
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((p) => (
          <div key={p.id} className="relative">
            <ProductCard product={p} />
            <button
              onClick={() => remove.mutate(p.id)}
              className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow hover:bg-red-50 text-red-600"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
