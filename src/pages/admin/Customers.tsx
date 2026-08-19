import { useQuery } from '@tanstack/react-query'
import { adminGetCustomers } from '@/services/admin'

export default function AdminCustomers() {
  const { data: customers, isLoading } = useQuery({ queryKey: ['admin', 'customers'], queryFn: adminGetCustomers })

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h1 className="text-2xl font-bold text-charcoal-900">Customers</h1>
      {isLoading ? <div className="animate-pulse h-40 bg-charcoal-100 rounded-xl" /> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-charcoal-50 text-left"><tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Phone</th><th className="px-4 py-3 font-medium">Joined</th></tr></thead>
            <tbody className="divide-y">
              {customers?.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium">{c.full_name || '—'}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-charcoal-500 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {customers?.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-charcoal-500">No customers yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
