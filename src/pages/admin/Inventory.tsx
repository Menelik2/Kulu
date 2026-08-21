import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  CheckCircle2,
  History,
  Minus,
  Package,
  PackageX,
  Plus,
  Search,
  Warehouse,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  adminAdjustStock,
  adminGetInventoryTransactions,
  adminGetProducts,
} from '@/services/admin'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Product } from '@/types/database'

const LOW_THRESHOLD = 10

type StockFilter = 'all' | 'ok' | 'low' | 'out'

function stockStatus(qty: number): StockFilter {
  if (qty <= 0) return 'out'
  if (qty < LOW_THRESHOLD) return 'low'
  return 'ok'
}

function StatusBadge({ qty }: { qty: number }) {
  const s = stockStatus(qty)
  if (s === 'out')
    return (
      <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
        Out of stock
      </span>
    )
  if (s === 'low')
    return (
      <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
        Low stock
      </span>
    )
  return (
    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
      In stock
    </span>
  )
}

function StockAdjustRow({
  product,
  onAdjusted,
}: {
  product: Product
  onAdjusted: () => void
}) {
  const { user } = useAuth()
  const [delta, setDelta] = useState('1')
  const [setMode, setSetMode] = useState(false)
  const [value, setValue] = useState(String(product.stock_quantity))

  const adjust = useMutation({
    mutationFn: async (opts: { change?: number; absolute?: number; reason: string }) => {
      if (opts.absolute !== undefined) {
        return adminAdjustStock({
          productId: product.id,
          quantityChange: opts.absolute,
          setAbsolute: true,
          reason: opts.reason,
          performedBy: user?.id ?? null,
        })
      }
      return adminAdjustStock({
        productId: product.id,
        quantityChange: opts.change ?? 0,
        reason: opts.reason,
        performedBy: user?.id ?? null,
      })
    },
    onSuccess: () => {
      toast.success('Stock updated')
      onAdjusted()
    },
    onError: (e: Error) => toast.error(e.message || 'Could not update stock'),
  })

  const n = Math.max(1, Math.floor(Number(delta) || 1))

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {!setMode ? (
        <>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8"
            disabled={adjust.isPending || product.stock_quantity <= 0}
            onClick={() =>
              adjust.mutate({ change: -n, reason: n === 1 ? 'manual_out' : `manual_out_${n}` })
            }
            aria-label="Decrease stock"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Input
            type="number"
            min={1}
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            className="h-8 w-14 text-center text-xs px-1"
            title="Step size"
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8"
            disabled={adjust.isPending}
            onClick={() =>
              adjust.mutate({ change: n, reason: n === 1 ? 'manual_in' : `manual_in_${n}` })
            }
            aria-label="Increase stock"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => {
              setValue(String(product.stock_quantity))
              setSetMode(true)
            }}
          >
            Set
          </Button>
        </>
      ) : (
        <>
          <Input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-8 w-20 text-xs"
          />
          <Button
            type="button"
            size="sm"
            className="h-8 text-xs"
            disabled={adjust.isPending}
            onClick={() => {
              const abs = Math.max(0, Math.floor(Number(value) || 0))
              adjust.mutate(
                { absolute: abs, reason: 'set_absolute' },
                { onSuccess: () => setSetMode(false) }
              )
            }}
          >
            Save
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setSetMode(false)}>
            Cancel
          </Button>
        </>
      )}
    </div>
  )
}

export default function AdminInventory() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<StockFilter>('all')
  const [showHistory, setShowHistory] = useState(true)

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: adminGetProducts,
  })

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['admin', 'inventory_tx'],
    queryFn: () => adminGetInventoryTransactions(50),
    enabled: showHistory,
  })

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'products'] })
    qc.invalidateQueries({ queryKey: ['admin', 'inventory_tx'] })
  }

  const stats = useMemo(() => {
    const list = products || []
    const totalSkus = list.length
    const totalUnits = list.reduce((s, p) => s + (p.stock_quantity || 0), 0)
    const out = list.filter((p) => p.stock_quantity <= 0).length
    const low = list.filter((p) => p.stock_quantity > 0 && p.stock_quantity < LOW_THRESHOLD).length
    const ok = list.filter((p) => p.stock_quantity >= LOW_THRESHOLD).length
    return { totalSkus, totalUnits, out, low, ok }
  }, [products])

  const filtered = useMemo(() => {
    let list = [...(products || [])]
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.category?.name || '').toLowerCase().includes(q)
      )
    }
    if (filter !== 'all') {
      list = list.filter((p) => stockStatus(p.stock_quantity) === filter)
    }
    list.sort((a, b) => a.stock_quantity - b.stock_quantity)
    return list
  }, [products, search, filter])

  const filters: { id: StockFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: stats.totalSkus },
    { id: 'out', label: 'Out of stock', count: stats.out },
    { id: 'low', label: 'Low', count: stats.low },
    { id: 'ok', label: 'OK', count: stats.ok },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 flex items-center gap-2">
            <Warehouse className="h-6 w-6 text-primary-600" />
            Inventory
          </h1>
          <p className="text-sm text-charcoal-500 mt-0.5">
            Stock levels for all products. Low threshold: under {LOW_THRESHOLD} units.
          </p>
        </div>
        <Link to="/admin/products">
          <Button variant="outline" size="sm">
            Manage products
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-charcoal-100 p-4">
          <div className="flex items-center gap-2 text-charcoal-500 text-xs font-medium mb-1">
            <Package className="h-3.5 w-3.5" /> SKUs
          </div>
          <p className="text-2xl font-bold text-charcoal-900">{stats.totalSkus}</p>
          <p className="text-xs text-charcoal-400 mt-0.5">{stats.totalUnits} total units</p>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-100 p-4">
          <div className="flex items-center gap-2 text-green-700 text-xs font-medium mb-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> In stock
          </div>
          <p className="text-2xl font-bold text-charcoal-900">{stats.ok}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-4">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-medium mb-1">
            <AlertTriangle className="h-3.5 w-3.5" /> Low stock
          </div>
          <p className="text-2xl font-bold text-amber-800">{stats.low}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-100 p-4">
          <div className="flex items-center gap-2 text-red-700 text-xs font-medium mb-1">
            <PackageX className="h-3.5 w-3.5" /> Out of stock
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.out}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, SKU, or category…"
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                filter === f.id
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-charcoal-600 border-charcoal-200 hover:border-primary-300'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="animate-pulse h-48 bg-charcoal-100 rounded-xl" />
      ) : (
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-charcoal-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-charcoal-600">Product</th>
                  <th className="px-4 py-3 font-medium text-charcoal-600">SKU</th>
                  <th className="px-4 py-3 font-medium text-charcoal-600">Stock</th>
                  <th className="px-4 py-3 font-medium text-charcoal-600">Status</th>
                  <th className="px-4 py-3 font-medium text-charcoal-600">Adjust</th>
                  <th className="px-4 py-3 font-medium text-charcoal-600">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-charcoal-50/80">
                    <td className="px-4 py-3">
                      <div className="font-medium text-charcoal-900">{p.name}</div>
                      <div className="text-xs text-charcoal-500">{p.category?.name || '—'}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-charcoal-600">{p.sku}</td>
                    <td
                      className={`px-4 py-3 font-semibold tabular-nums ${
                        p.stock_quantity <= 0
                          ? 'text-red-600'
                          : p.stock_quantity < LOW_THRESHOLD
                            ? 'text-amber-700'
                            : 'text-charcoal-900'
                      }`}
                    >
                      {p.stock_quantity}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge qty={p.stock_quantity} />
                    </td>
                    <td className="px-4 py-3">
                      <StockAdjustRow product={p} onAdjusted={refresh} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="text-xs font-medium text-primary-600 hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-charcoal-500">
                      No products match this filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent stock movements */}
      <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-charcoal-50"
          onClick={() => setShowHistory((v) => !v)}
        >
          <span className="font-semibold text-charcoal-900 flex items-center gap-2 text-sm">
            <History className="h-4 w-4 text-primary-600" />
            Recent stock movements
          </span>
          <span className="text-xs text-charcoal-400">{showHistory ? 'Hide' : 'Show'}</span>
        </button>
        {showHistory && (
          <div className="border-t border-charcoal-100">
            {txLoading ? (
              <div className="p-6 text-sm text-charcoal-500">Loading history…</div>
            ) : !transactions?.length ? (
              <div className="p-6 text-sm text-charcoal-500">
                No stock adjustments logged yet. Use + / − or Set on a product to record a movement.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead className="bg-charcoal-50 text-left text-charcoal-600">
                    <tr>
                      <th className="px-4 py-2 font-medium">When</th>
                      <th className="px-4 py-2 font-medium">Product</th>
                      <th className="px-4 py-2 font-medium">Change</th>
                      <th className="px-4 py-2 font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="px-4 py-2 text-xs text-charcoal-500 whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <div className="font-medium text-charcoal-800">
                            {tx.product?.name || '—'}
                          </div>
                          <div className="text-xs font-mono text-charcoal-400">
                            {tx.product?.sku}
                          </div>
                        </td>
                        <td
                          className={`px-4 py-2 font-semibold tabular-nums ${
                            tx.quantity_change > 0 ? 'text-green-700' : 'text-red-600'
                          }`}
                        >
                          {tx.quantity_change > 0 ? '+' : ''}
                          {tx.quantity_change}
                        </td>
                        <td className="px-4 py-2 text-xs text-charcoal-600">{tx.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
