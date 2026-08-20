import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Truck, Shield, Headphones, MapPin } from 'lucide-react'
import { getFeaturedProducts, getCategories, getProducts } from '@/services/products'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/features/language/LanguageContext'
import { getCategoryIcon } from '@/lib/categoryIcons'

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-charcoal-100" />
          <div className="p-3 sm:p-3.5 space-y-2">
            <div className="h-4 bg-charcoal-100 rounded w-4/5" />
            <div className="h-3 bg-charcoal-100 rounded w-1/3" />
            <div className="h-4 bg-charcoal-100 rounded w-1/2" />
            <div className="h-10 bg-charcoal-100 rounded-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function CategorySkeleton() {
  return (
    <>
      {/* Mobile: horizontal scroll skeleton */}
      <div className="sm:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 pb-1 w-max">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-[76px] shrink-0 bg-white rounded-xl border border-charcoal-100 p-2.5 text-center animate-pulse"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-charcoal-100 mb-1.5" />
              <div className="h-2.5 bg-charcoal-100 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      {/* sm+: grid skeleton */}
      <div className="hidden sm:grid grid-cols-4 md:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-charcoal-100 p-4 text-center animate-pulse"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-2xl bg-charcoal-100 mb-3" />
            <div className="h-3 bg-charcoal-100 rounded w-2/3 mx-auto" />
          </div>
        ))}
      </div>
    </>
  )
}

export default function HomePage() {
  const { t } = useLanguage()

  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getFeaturedProducts(8),
  })

  const { data: newest, isLoading: newestLoading } = useQuery({
    queryKey: ['products', 'newest'],
    queryFn: () => getProducts({ sort: 'newest', limit: 8 }),
  })

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-12 left-6 w-48 h-48 sm:w-72 sm:h-72 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-6 right-6 w-56 h-56 sm:w-96 sm:h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto container-padding py-12 sm:py-20 lg:py-28">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              {t('heroTitle1')}
              <br />
              <span className="text-gold-400">{t('heroTitle2')}</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-primary-100 max-w-xl">
              {t('heroSubtitle')}
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button size="lg" variant="secondary" className="gap-2 h-12 px-6 rounded-full shadow-lg">
                  {t('shopNow')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/shop?sort=newest">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white h-12 px-6 rounded-full backdrop-blur-sm"
                >
                  {t('newArrivals')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-7xl mx-auto container-padding py-5 sm:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Truck, title: t('nationwideDelivery'), desc: t('allRegions') },
              { icon: Shield, title: t('secureShopping'), desc: t('safeProtected') },
              { icon: Headphones, title: t('customerSupport'), desc: t('hereToHelp') },
              { icon: MapPin, title: t('cashOnDelivery'), desc: t('payWhenReceive') },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm text-charcoal-900 leading-snug">{item.title}</h3>
                  <p className="text-[11px] sm:text-xs text-charcoal-500 mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto container-padding py-6 sm:py-12">
        <div className="flex items-center justify-between mb-3 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-charcoal-900">{t('shopByCategory')}</h2>
          <Link to="/shop" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            {t('viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {categoriesLoading ? (
          <CategorySkeleton />
        ) : categories && categories.length > 0 ? (
          <>
            {/* Mobile: single-row horizontal scroll */}
            <div className="sm:hidden -mx-4 px-4 overflow-x-auto overscroll-x-contain scrollbar-hide snap-x snap-mandatory">
              <div className="flex gap-3 pb-1 w-max">
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.slug || cat.name)
                  return (
                    <Link
                      key={cat.id}
                      to={`/shop?category=${cat.id}`}
                      className="group w-[76px] shrink-0 snap-start bg-white rounded-xl border border-charcoal-100 p-2.5 text-center active:scale-[0.97] transition-all"
                    >
                      <div className="w-10 h-10 mx-auto rounded-xl bg-primary-50 flex items-center justify-center mb-1.5 group-active:bg-primary-100">
                        <Icon className="h-5 w-5 text-primary-600" strokeWidth={1.75} />
                      </div>
                      <h3 className="font-medium text-[10px] text-charcoal-800 line-clamp-2 leading-tight">
                        {cat.name}
                      </h3>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* sm+: grid */}
            <div className="hidden sm:grid grid-cols-4 md:grid-cols-5 gap-4">
              {categories.slice(0, 10).map((cat) => {
                const Icon = getCategoryIcon(cat.slug || cat.name)
                return (
                  <Link
                    key={cat.id}
                    to={`/shop?category=${cat.id}`}
                    className="group bg-white rounded-2xl border border-charcoal-100 p-4 text-center hover:border-primary-300 hover:shadow-md active:scale-[0.98] transition-all"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center mb-3 group-hover:bg-primary-100 group-hover:scale-105 transition-all">
                      <Icon className="h-6 w-6 md:h-7 md:w-7 text-primary-600" strokeWidth={1.75} />
                    </div>
                    <h3 className="font-medium text-xs md:text-sm text-charcoal-800 group-hover:text-primary-600 line-clamp-2 leading-tight">
                      {cat.name}
                    </h3>
                  </Link>
                )
              })}
            </div>
          </>
        ) : null}
      </section>

      <section className="max-w-7xl mx-auto container-padding py-8 sm:py-12">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900">{t('featuredProducts')}</h2>
          <Link to="/shop" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            {t('viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featuredLoading ? (
          <ProductGridSkeleton />
        ) : featured && featured.products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {featured.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="bg-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900">{t('newArrivals')}</h2>
            <Link to="/shop?sort=newest" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              {t('viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {newestLoading ? (
            <ProductGridSkeleton />
          ) : newest && newest.products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {newest.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="max-w-7xl mx-auto container-padding py-10 sm:py-16">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center text-white">
          <h2 className="text-xl sm:text-3xl font-bold">{t('readyToShop')}</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-primary-100 max-w-lg mx-auto">
            {t('readyToShopDesc')}
          </p>
          <Link to="/shop" className="inline-block mt-5 sm:mt-6">
            <Button size="lg" variant="secondary" className="rounded-full h-12 px-8">
              {t('exploreShop')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
