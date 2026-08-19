import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminGetProducts } from '@/services/admin'
import { Button } from '@/components/ui/button'

export default function AdminInventory() {
  const { data: products, isLoading } = useQuery({ queryKey: ['admin', 'products'], queryFn: adminGetProducts })
  const sorted = [...(products || [])].sort((a, b) => a.stock_quantity - b.stock_quantity)

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal-900">Inventory</h1>
        <Link to="/admin/products"><Button variant="outline" size="sm">Manage Products</Button></Link>
      </div>
      {isLoading ? <div className="animate-pulse h-40 bg-charcoal-100 rounded-xl" /> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-charcoal-50 text-left"><tr><th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">SKU</th><th className="px-4 py-3 font-medium">Stock</th><th className="px-4 py-3 font-medium">Status</th></tr></thead>
            <tbody className="divide-y">
              {sorted.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                  <td className={`px-4 py-3 font-medium ${p.stock_quantity < 10 ? 'text-red-600' : ''}`}>{p.stock_quantity}</td>
                  <td className="px-4 py-3">
                    {p.stock_quantity === 0 ? <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Out of stock</span>
                      : p.stock_quantity < 10 ? <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Low</span>
                      : <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
