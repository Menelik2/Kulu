import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search, Truck, Phone, Mail, MapPin } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  adminGetSuppliers,
  adminCreateSupplier,
  adminUpdateSupplier,
  adminDeleteSupplier,
  adminGetSupplierProductCounts,
} from '@/services/suppliers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Supplier } from '@/types/database'

type SupplierForm = {
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
  city: string
  region: string
  notes: string
  is_active: boolean
}

const emptyForm: SupplierForm = {
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  region: '',
  notes: '',
  is_active: true,
}

export default function AdminSuppliers() {
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['admin', 'suppliers'],
    queryFn: adminGetSuppliers,
  })

  const { data: productCounts } = useQuery({
    queryKey: ['admin', 'supplier_product_counts'],
    queryFn: adminGetSupplierProductCounts,
  })

  const { register, handleSubmit, reset } = useForm<SupplierForm>({ defaultValues: emptyForm })

  const save = useMutation({
    mutationFn: async (data: SupplierForm) => {
      const payload = {
        name: data.name,
        contact_person: data.contact_person || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        region: data.region || null,
        notes: data.notes || null,
        is_active: data.is_active,
      }
      if (editing) return adminUpdateSupplier(editing.id, payload)
      return adminCreateSupplier(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'suppliers'] })
      qc.invalidateQueries({ queryKey: ['admin', 'supplier_product_counts'] })
      toast.success(editing ? 'Supplier updated' : 'Supplier created')
      setShowForm(false)
      setEditing(null)
      reset(emptyForm)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const del = useMutation({
    mutationFn: adminDeleteSupplier,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'suppliers'] })
      qc.invalidateQueries({ queryKey: ['admin', 'supplier_product_counts'] })
      toast.success('Supplier deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const openCreate = () => {
    setEditing(null)
    reset(emptyForm)
    setShowForm(true)
  }

  const openEdit = (s: Supplier) => {
    setEditing(s)
    reset({
      name: s.name,
      contact_person: s.contact_person || '',
      email: s.email || '',
      phone: s.phone || '',
      address: s.address || '',
      city: s.city || '',
      region: s.region || '',
      notes: s.notes || '',
      is_active: s.is_active,
    })
    setShowForm(true)
  }

  const q = search.trim().toLowerCase()
  const filtered = (suppliers || []).filter((s) => {
    if (!q) return true
    return (
      s.name.toLowerCase().includes(q) ||
      (s.contact_person || '').toLowerCase().includes(q) ||
      (s.phone || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.city || '').toLowerCase().includes(q) ||
      (s.region || '').toLowerCase().includes(q)
    )
  })

  const activeCount = (suppliers || []).filter((s) => s.is_active).length

  return (
    <div className="p-3 sm:p-6 space-y-4 max-w-full overflow-x-hidden pb-8">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 flex items-center gap-2">
            <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 shrink-0" />
            Suppliers
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
            {suppliers?.length ?? 0} total · {activeCount} active
          </p>
        </div>
        <Button size="sm" className="rounded-full h-9 shrink-0" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add supplier</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, city…"
          className="pl-10 h-11 rounded-xl"
        />
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit((d) => save.mutate(d))}
          className="bg-white rounded-xl border border-charcoal-100 p-3 sm:p-5 space-y-3 w-full max-w-2xl"
        >
          <h2 className="font-semibold text-charcoal-900 text-sm sm:text-base">
            {editing ? 'Edit supplier' : 'New supplier'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="name">Company / supplier name *</Label>
              <Input
                id="name"
                className="h-11 rounded-xl"
                {...register('name', { required: true, minLength: 2 })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact_person">Contact person</Label>
              <Input id="contact_person" className="h-11 rounded-xl" {...register('contact_person')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" className="h-11 rounded-xl" {...register('phone')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="h-11 rounded-xl" {...register('email')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                className="h-11 rounded-xl"
                {...register('region')}
                placeholder="e.g. Amhara"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                className="h-11 rounded-xl"
                {...register('city')}
                placeholder="e.g. Bahir Dar"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" className="h-11 rounded-xl" {...register('address')} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                className="h-11 rounded-xl"
                {...register('notes')}
                placeholder="Payment terms, lead time…"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_active')} className="rounded border-charcoal-300" />
            Active
          </label>
          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" className="rounded-full" loading={save.isPending}>
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                setShowForm(false)
                setEditing(null)
                reset(emptyForm)
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="animate-pulse h-40 bg-charcoal-100 rounded-xl" />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-charcoal-100 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-charcoal-900">{s.name}</p>
                    {s.contact_person && (
                      <p className="text-xs text-charcoal-600 mt-0.5">{s.contact_person}</p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      s.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-charcoal-100 text-charcoal-600'
                    }`}
                  >
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-0.5 text-xs text-charcoal-500">
                  {s.phone && (
                    <p className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {s.phone}
                    </p>
                  )}
                  {s.email && (
                    <p className="flex items-center gap-1 break-all">
                      <Mail className="h-3 w-3 shrink-0" /> {s.email}
                    </p>
                  )}
                  {(s.city || s.region) && (
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {[s.city, s.region].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <p className="text-[11px] text-charcoal-400">
                  Products linked: {productCounts?.[s.id] ?? 0}
                </p>
                <div className="flex gap-2 pt-0.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 rounded-lg text-xs"
                    onClick={() => openEdit(s)}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-red-600 border-red-200"
                    onClick={() => {
                      if (
                        confirm(
                          `Delete supplier "${s.name}"? Products linked will be unlinked.`
                        )
                      ) {
                        del.mutate(s.id)
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-charcoal-500 py-10 text-sm">
                {search ? 'No suppliers match your search' : 'No suppliers yet'}
              </p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-charcoal-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-charcoal-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-charcoal-600">Supplier</th>
                    <th className="px-4 py-3 font-medium text-charcoal-600">Contact</th>
                    <th className="px-4 py-3 font-medium text-charcoal-600">Location</th>
                    <th className="px-4 py-3 font-medium text-charcoal-600">Products</th>
                    <th className="px-4 py-3 font-medium text-charcoal-600">Status</th>
                    <th className="px-4 py-3 font-medium text-charcoal-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-charcoal-50/80">
                      <td className="px-4 py-3">
                        <div className="font-medium text-charcoal-900">{s.name}</div>
                        {s.notes && (
                          <div className="text-xs text-charcoal-400 line-clamp-1 mt-0.5">{s.notes}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {s.contact_person && (
                          <div className="text-charcoal-800">{s.contact_person}</div>
                        )}
                        <div className="flex flex-col gap-0.5 text-xs text-charcoal-500 mt-0.5">
                          {s.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {s.phone}
                            </span>
                          )}
                          {s.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {s.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-charcoal-600">
                        {(s.city || s.region) && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {[s.city, s.region].filter(Boolean).join(', ')}
                          </span>
                        )}
                        {s.address && (
                          <div className="text-charcoal-400 mt-0.5 line-clamp-1">{s.address}</div>
                        )}
                        {!s.city && !s.region && !s.address && '—'}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-charcoal-700">
                        {productCounts?.[s.id] ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            s.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-charcoal-100 text-charcoal-600'
                          }`}
                        >
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete supplier "${s.name}"? Products linked will be unlinked.`
                                )
                              ) {
                                del.mutate(s.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-charcoal-500">
                        {search
                          ? 'No suppliers match your search'
                          : 'No suppliers yet — add your first supplier'}
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
