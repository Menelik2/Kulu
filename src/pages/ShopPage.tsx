import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { getProducts, getCategories } from '@/services/products'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Popular' },
  { value: 'bestselling', label: 'Best Selling' },
] as const

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFilters, setMobileFilters] = useState(false)

  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const sort = (searchParams.get('sort') as typeof SORT_OPTIONS[number]['value']) || 'newest'
  const page = Number(searchParams.get('page') || '1')
  const inStock = searchParams.get('inStock') === '1'

  const [searchInput, setSearchInput] = useState(q)

  useEffect(() => { setSearchInput(q) }, [q])

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', { q, category, sort, page, inStock }],
    queryFn: () => getProducts({
      search: q || undefined,
      category: category || undefined,
      sort, page, limit: 12,
      inStock: inStock || undefined,
    }),
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

  return (
    <div className="max-w-7xl mx-auto container-padding py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">Shop</h1>
          <p className="text-charcoal-500 mt-1">
            {data ? data.total + ' product' + (data.total !== 1 ? 's' : '') : 'Loading...'}
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
            <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products..." className="pl-10" />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0 space-y-6">
          <div>
            <h3 className="font-semibold text-sm text-charcoal-900 mb-3">Categories</h3>
            <ul className="space-y-1">
              <li>
                <button onClick={() => updateParam('category', '')} className={cn('w-full text-left px-3 py-1.5 rounded-lg text-sm', !category ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-charcoal-50')}>All</button>
              </li>
              {categories?.map((c) => (
                <li key={c.id}>
                  <button onClick={() => updateParam('category', c.id)} className={cn('w-full text-left px-3 py-1.5 rounded-lg text-sm', category === c.id ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-charcoal-50')}>{c.name}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-charcoal-900 mb-3">Availability</h3>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={inStock} onChange={(e) => updateParam('inStock', e.target.checked ? '1' : '')} className="rounded border-charcoal-300 text-primary-600 focus:ring-primary-600" />
              In stock only
            </label>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-6">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setMobileFilters(true)}>
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
            <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="h-9 rounded-lg border border-charcoal-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600">
              {SORT_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </div>

          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-charcoal-100 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-charcoal-100" />
                  <div className="p-4 space-y-2"><div className="h-4 bg-charcoal-100 rounded w-3/4" /><div className="h-4 bg-charcoal-100 rounded w-1/2" /></div>
                </div>
              ))}
            </div>
          )}

          {isError && <div className="text-center py-16"><p className="text-charcoal-500">Failed to load products.</p></div>}

          {!isLoading && data && data.products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-charcoal-500 text-lg">No products found</p>
              <Button variant="outline" className="mt-4" onClick={() => setSearchParams({})}>Clear filters</Button>
            </div>
          )}

          {!isLoading && data && data.products.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {data.products.map((p) => (<ProductCard key={p.id} product={p} />))}
              </div>
              {data.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updateParam('page', String(page - 1))}>Previous</Button>
                  <span className="flex items-center px-3 text-sm text-charcoal-600">Page {page} of {data.totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => updateParam('page', String(page + 1))}>Next</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setMobileFilters(false)}><X className="h-5 w-5" /></button>
            </div>
            <ul className="space-y-1">
              <li><button onClick={() => { updateParam('category', ''); setMobileFilters(false) }} className={cn('w-full text-left px-3 py-2 rounded-lg text-sm', !category && 'bg-primary-50 text-primary-700')}>All</button></li>
              {categories?.map((c) => (
                <li key={c.id}><button onClick={() => { updateParam('category', c.id); setMobileFilters(false) }} className={cn('w-full text-left px-3 py-2 rounded-lg text-sm', category === c.id && 'bg-primary-50 text-primary-700')}>{c.name}</button></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
