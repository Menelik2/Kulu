import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { adminGetProducts, adminDeleteProduct } from '@/services/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatETB, getEffectivePrice } from '@/lib/utils'
import { toast } from 'sonner'

export default function AdminProducts() {
  const [search, setSearch] = useState('')
  const qc = useQueryClient()
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: adminGetProducts,
  })
  const del = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      qc.invalidateQueries({ queryKey: ['admin', 'supplier_product_counts'] })
      toast.success('Product deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })
  const filtered = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.supplier?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-3 sm:p-6 space-y-4 max-w-full overflow-x-hidden pb-8">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900">Products</h1>
        <Link to="/admin/products/new">
          <Button size="sm" className="rounded-full h-9 shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </Link>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, SKU, supplier…"
          className="pl-10 h-11 rounded-xl"
        />
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-charcoal-100 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {filtered?.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-charcoal-100 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-charcoal-900 text-sm leading-snug line-clamp-2">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">
                      {p.category?.name || 'No category'}
                      {p.supplier?.name ? ` · ${p.supplier.name}` : ''}
                    </p>
                    <p className="text-[10px] font-mono text-charcoal-400 mt-0.5">{p.sku}</p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                      p.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-charcoal-100 text-charcoal-600'
                    }`}
                  >
                    {p.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-primary-600">
                    {formatETB(getEffectivePrice(p.price, p.discount_price))}
                  </span>
                  <span
                    className={
                      p.stock_quantity < 10 ? 'text-red-600 font-semibold text-xs' : 'text-xs text-charcoal-600'
                    }
                  >
                    Stock: {p.stock_quantity}
                  </span>
                </div>
                <div className="flex gap-2 pt-0.5">
                  <Link to={`/admin/products/${p.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full h-9 rounded-lg text-xs">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-red-600 border-red-200"
                    onClick={() => {
                      if (confirm('Delete this product and all related data?')) del.mutate(p.id)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {filtered?.length === 0 && (
              <p className="text-center text-charcoal-500 py-10 text-sm">No products found</p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-charcoal-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-charcoal-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-charcoal-600">Product</th>
                    <th className="px-4 py-3 font-medium text-charcoal-600">SKU</th>
                    <th className="px-4 py-3 font-medium text-charcoal-600">Supplier</th>
                    <th className="px-4 py-3 font-medium text-charcoal-600">Price</th>
                    <th className="px-4 py-3 font-medium text-charcoal-600">Stock</th>
                    <th className="px-4 py-3 font-medium text-charcoal-600">Status</th>
                    <th className="px-4 py-3 font-medium text-charcoal-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {filtered?.map((p) => (
                    <tr key={p.id} className="hover:bg-charcoal-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-charcoal-900">{p.name}</div>
                        <div className="text-xs text-charcoal-500">{p.category?.name}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                      <td className="px-4 py-3 text-charcoal-700">
                        {p.supplier?.name ? (
                          <span className="text-sm">{p.supplier.name}</span>
                        ) : (
                          <span className="text-xs text-charcoal-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {formatETB(getEffectivePrice(p.price, p.discount_price))}
                      </td>
                      <td className="px-4 py-3">
                        <span className={p.stock_quantity < 10 ? 'text-red-600 font-medium' : ''}>
                          {p.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            p.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-charcoal-100 text-charcoal-600'
                          }`}
                        >
                          {p.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Link to={`/admin/products/${p.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                            onClick={() => {
                              if (confirm('Delete this product?')) del.mutate(p.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-charcoal-500">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
