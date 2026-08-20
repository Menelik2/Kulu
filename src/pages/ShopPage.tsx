import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { getProducts, getCategories } from '@/services/products'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/features/language/LanguageContext'

export default function ShopPage() {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFilters, setMobileFilters] = useState(false)

  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const sort = (searchParams.get('sort') as string) || 'newest'
  const page = Number(searchParams.get('page') || '1')
  const inStock = searchParams.get('inStock') === '1'

  const [searchInput, setSearchInput] = useState(q)

  useEffect(() => {
    setSearchInput(q)
  }, [q])

  const SORT_OPTIONS = [
    { value: 'newest', label: t('sortNewest') },
    { value: 'price_asc', label: t('sortPriceAsc') },
    { value: 'price_desc', label: t('sortPriceDesc') },
    { value: 'popular', label: t('sortPopular') },
    { value: 'bestselling', label: t('sortBestselling') },
  ] as const

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['products', { q, category, sort, page, inStock }],
    queryFn: () =>
      getProducts({
        search: q || undefined,
        category: category || undefined,
        sort: sort as any,
        page,
        limit: 12,
        inStock: inStock || undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam('q', searchInput.trim())
  }

  const activeFilterCount = (category ? 1 : 0) + (inStock ? 1 : 0)

  return (
    <div className="max-w-7xl mx-auto container-padding py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">{t('shop')}</h1>
          <p className="text-charcoal-500 mt-0.5 text-sm">
            {data
              ? `${data.total} ${data.total === 1 ? t('product') : t('products')}`
              : t('loading')}
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-10 rounded-full h-11"
            />
          </div>
          <Button type="submit" className="rounded-full h-11 px-5">
            {t('search')}
          </Button>
        </form>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0 space-y-6">
          <div>
            <h3 className="font-semibold text-sm text-charcoal-900 mb-3">{t('categories')}</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => updateParam('category', '')}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl text-sm',
                    !category ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-charcoal-50'
                  )}
                >
                  {t('all')}
                </button>
              </li>
              {categories?.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => updateParam('category', c.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-xl text-sm',
                      category === c.id ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-charcoal-50'
                    )}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-charcoal-900 mb-3">{t('availability')}</h3>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => updateParam('inStock', e.target.checked ? '1' : '')}
                className="rounded border-charcoal-300 text-primary-600 focus:ring-primary-600"
              />
              {t('inStockOnly')}
            </label>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-5">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden rounded-full h-9 relative"
              onClick={() => setMobileFilters(true)}
            >
              <SlidersHorizontal className="h-4 w-4" /> {t('filters')}
              {activeFilterCount > 0 && (
                <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="h-9 rounded-full border border-charcoal-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading && !data && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-charcoal-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-charcoal-100 rounded w-3/4" />
                    <div className="h-4 bg-charcoal-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && !data && (
            <div className="text-center py-16">
              <p className="text-charcoal-500">{t('failedLoad')}</p>
            </div>
          )}

          {data && data.products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-charcoal-500 text-lg">{t('noProducts')}</p>
              <Button variant="outline" className="mt-4 rounded-full" onClick={() => setSearchParams({})}>
                {t('clearFilters')}
              </Button>
            </div>
          )}

          {data && data.products.length > 0 && (
            <>
              <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5', isFetching && 'opacity-70 transition-opacity')}>
                {data.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {data.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8 sm:mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={page <= 1}
                    onClick={() => updateParam('page', String(page - 1))}
                  >
                    {t('previous')}
                  </Button>
                  <span className="flex items-center px-3 text-sm text-charcoal-600">
                    {t('pageOf', { page, total: data.totalPages })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={page >= data.totalPages}
                    onClick={() => updateParam('page', String(page + 1))}
                  >
                    {t('next')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pb-safe max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="w-10 h-1 bg-charcoal-200 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">{t('filters')}</h3>
              <button onClick={() => setMobileFilters(false)} className="p-2 rounded-full hover:bg-charcoal-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <h4 className="font-medium text-sm text-charcoal-600 mb-2">{t('categories')}</h4>
            <ul className="space-y-1 mb-6">
              <li>
                <button
                  onClick={() => {
                    updateParam('category', '')
                    setMobileFilters(false)
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl text-[15px]',
                    !category && 'bg-primary-50 text-primary-700 font-medium'
                  )}
                >
                  {t('all')}
                </button>
              </li>
              {categories?.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      updateParam('category', c.id)
                      setMobileFilters(false)
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl text-[15px]',
                      category === c.id && 'bg-primary-50 text-primary-700 font-medium'
                    )}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>

            <h4 className="font-medium text-sm text-charcoal-600 mb-2">{t('availability')}</h4>
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] cursor-pointer hover:bg-charcoal-50">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => updateParam('inStock', e.target.checked ? '1' : '')}
                className="rounded border-charcoal-300 text-primary-600 focus:ring-primary-600 h-4 w-4"
              />
              {t('inStockOnly')}
            </label>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full h-11"
                onClick={() => {
                  setSearchParams({})
                  setMobileFilters(false)
                }}
              >
                {t('clearFilters')}
              </Button>
              <Button className="flex-1 rounded-full h-11" onClick={() => setMobileFilters(false)}>
                {t('applyFilters')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
