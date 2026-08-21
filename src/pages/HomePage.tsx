import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Sparkles, Package, Truck } from 'lucide-react'
import { getFeaturedProducts, getCategories, getProducts } from '@/services/products'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/features/language/LanguageContext'
import { getCategoryIcon } from '@/lib/categoryIcons'

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 md:gap-6">
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
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 sm:gap-4 w-max pb-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-[76px] sm:w-[110px] md:w-[120px] bg-white rounded-xl sm:rounded-2xl border border-charcoal-100 p-2.5 sm:p-4 text-center animate-pulse shrink-0"
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto rounded-xl sm:rounded-2xl bg-charcoal-100 mb-1.5 sm:mb-3" />
            <div className="h-2.5 sm:h-3 bg-charcoal-100 rounded w-3/4 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const { t } = useLanguage()

  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getFeaturedProducts(10),
  })

  const { data: newest, isLoading: newestLoading } = useQuery({
    queryKey: ['products', 'newest'],
    queryFn: () => getProducts({ sort: 'newest', limit: 10 }),
  })

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-8 left-4 w-32 h-32 sm:w-72 sm:h-72 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-4 right-4 w-40 h-40 sm:w-96 sm:h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-400/20 rounded-full blur-3xl hidden md:block" />
        </div>

        <div className="relative max-w-7xl mx-auto container-padding py-6 sm:py-14 lg:py-20 xl:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="max-w-xl lg:max-w-none">
              <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm text-primary-100 mb-5 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-gold-400" />
                <span>{t('cashOnDelivery')} · {t('nationwideDelivery')}</span>
              </div>
              <h1 className="text-[1.35rem] leading-snug sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-6xl font-bold tracking-tight sm:leading-[1.15]">
                {t('heroTitle1')}
                <br />
                <span className="text-gold-400 text-[1.25rem] sm:text-inherit">{t('heroTitle2')}</span>
              </h1>
              <p className="mt-2.5 sm:mt-5 md:mt-6 text-[13px] leading-relaxed sm:text-base md:text-lg text-primary-100/95 max-w-xl line-clamp-3 sm:line-clamp-none">
                {t('heroSubtitle')}
              </p>
              <div className="mt-4 sm:mt-7 md:mt-8 flex flex-wrap gap-2.5 sm:gap-3">
                <Link to="/shop">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="gap-1.5 h-10 px-4 text-sm rounded-full shadow-md sm:h-12 sm:px-7 sm:text-base sm:shadow-lg font-semibold"
                  >
                    {t('shopNow')} <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </Link>
                <Link to="/shop?sort=newest">
                  <Button
                    size="lg"
                    variant="onPrimary"
                    className="h-10 px-4 text-sm rounded-full sm:h-12 sm:px-7 sm:text-base font-medium"
                  >
                    {t('newArrivals')}
                  </Button>
                </Link>
              </div>

              <div className="hidden md:flex items-center gap-6 mt-10 pt-8 border-t border-white/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-gold-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t('nationwideDelivery')}</p>
                    <p className="text-xs text-primary-200">{t('allRegions')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-gold-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t('cashOnDelivery')}</p>
                    <p className="text-xs text-primary-200">{t('payWhenReceive')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="relative aspect-[4/3] max-w-lg ml-auto">
                <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                  <div className="absolute inset-6 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="px-3 py-1.5 rounded-full bg-gold-500/90 text-charcoal-900 text-xs font-bold shadow">
                        {t('featuredProducts')}
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-white/25 rounded-full w-3/4" />
                      <div className="h-3 bg-white/15 rounded-full w-1/2" />
                      <div className="flex gap-2 pt-2">
                        <div className="h-20 flex-1 rounded-xl bg-white/15 border border-white/10" />
                        <div className="h-20 flex-1 rounded-xl bg-white/15 border border-white/10" />
                        <div className="h-20 flex-1 rounded-xl bg-white/15 border border-white/10" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 px-4 py-3 rounded-2xl bg-white shadow-xl text-charcoal-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t('secureShopping')}</p>
                    <p className="text-xs text-charcoal-500">{t('safeProtected')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories — horizontal strip on all breakpoints (pro style on desktop) */}
      <section className="max-w-7xl mx-auto container-padding py-5 sm:py-10 md:py-12">
        <div className="flex items-center justify-between mb-3 sm:mb-5 md:mb-6">
          <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-charcoal-900">{t('shopByCategory')}</h2>
          <Link
            to="/shop"
            className="text-xs sm:text-sm md:text-base text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
          >
            {t('viewAll')} <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>
        {categoriesLoading ? (
          <CategorySkeleton />
        ) : categories && categories.length > 0 ? (
          <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-hide scroll-smooth">
            <div className="flex gap-3 sm:gap-4 md:gap-5 w-max pb-1">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.slug || cat.name)
                return (
                  <Link
                    key={cat.id}
                    to={`/shop?category=${cat.id}`}
                    className="group shrink-0 w-[76px] sm:w-[110px] md:w-[128px] bg-white rounded-xl sm:rounded-2xl border border-charcoal-100 p-2.5 sm:p-4 md:p-5 text-center shadow-sm hover:shadow-md hover:border-primary-200 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
                  >
                    <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto rounded-xl sm:rounded-2xl bg-primary-50 flex items-center justify-center mb-1.5 sm:mb-3 group-hover:bg-primary-100 group-hover:scale-105 transition-all duration-200">
                      <Icon
                        className="h-5 w-5 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary-600"
                        strokeWidth={1.75}
                      />
                    </div>
                    <h3 className="font-medium text-[10px] sm:text-xs md:text-sm text-charcoal-800 group-hover:text-primary-600 line-clamp-2 leading-tight transition-colors">
                      {cat.name}
                    </h3>
                  </Link>
                )
              })}
            </div>
          </div>
        ) : null}
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto container-padding py-6 sm:py-10 md:py-14">
        <div className="flex items-center justify-between mb-3 sm:mb-6 md:mb-8">
          <div>
            <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-charcoal-900">{t('featuredProducts')}</h2>
            <p className="hidden md:block text-sm text-charcoal-500 mt-1">{t('heroSubtitle')?.slice(0, 60)}</p>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm md:text-base text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
          >
            {t('viewAll')} <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>
        {featuredLoading ? (
          <ProductGridSkeleton />
        ) : featured && featured.products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 md:gap-6">
            {featured.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>

      {/* New arrivals */}
      <section className="bg-white py-6 sm:py-10 md:py-14">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex items-center justify-between mb-3 sm:mb-6 md:mb-8">
            <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-charcoal-900">{t('newArrivals')}</h2>
            <Link
              to="/shop?sort=newest"
              className="text-xs sm:text-sm md:text-base text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
            >
              {t('viewAll')} <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
          {newestLoading ? (
            <ProductGridSkeleton />
          ) : newest && newest.products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 md:gap-6">
              {newest.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto container-padding py-8 sm:py-12 md:py-16">
        <div className="relative bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 rounded-2xl sm:rounded-3xl p-5 sm:p-10 md:p-14 text-center text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-lg sm:text-3xl md:text-4xl font-bold">{t('readyToShop')}</h2>
            <p className="mt-1.5 sm:mt-3 md:mt-4 text-xs sm:text-base md:text-lg text-primary-100 max-w-lg mx-auto leading-relaxed">
              {t('readyToShopDesc')}
            </p>
            <Link to="/shop" className="inline-block mt-4 sm:mt-6 md:mt-8">
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full h-10 px-6 text-sm sm:h-12 sm:px-10 sm:text-base font-semibold shadow-lg"
              >
                {t('exploreShop')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
