import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Users, Mail, Phone } from 'lucide-react'
import { adminGetCustomers } from '@/services/admin'
import { Input } from '@/components/ui/input'

export default function AdminCustomers() {
  const [search, setSearch] = useState('')
  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: adminGetCustomers,
  })

  const q = search.trim().toLowerCase()
  const filtered = (customers || []).filter((c) => {
    if (!q) return true
    return (
      (c.full_name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-3 sm:p-6 space-y-4 max-w-full overflow-x-hidden pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 flex items-center gap-2">
          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
          Customers
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
          {customers?.length ?? 0} registered
        </p>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone…"
          className="pl-10 h-11 rounded-xl"
        />
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-charcoal-100 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-charcoal-100 p-3 space-y-1.5"
              >
                <p className="font-semibold text-sm text-charcoal-900">
                  {c.full_name || '—'}
                </p>
                <p className="text-xs text-charcoal-600 flex items-center gap-1.5 break-all">
                  <Mail className="h-3 w-3 shrink-0 text-charcoal-400" />
                  {c.email}
                </p>
                {c.phone && (
                  <p className="text-xs text-charcoal-600 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 shrink-0 text-charcoal-400" />
                    {c.phone}
                  </p>
                )}
                <p className="text-[10px] text-charcoal-400 pt-0.5">
                  Joined {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-charcoal-500 py-10 text-sm">
                {search ? 'No customers match' : 'No customers yet'}
              </p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-charcoal-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-charcoal-50">
                      <td className="px-4 py-3 font-medium">{c.full_name || '—'}</td>
                      <td className="px-4 py-3">{c.email}</td>
                      <td className="px-4 py-3">{c.phone || '—'}</td>
                      <td className="px-4 py-3 text-charcoal-500 text-xs">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-charcoal-500">
                        {search ? 'No customers match' : 'No customers yet'}
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
