import { supabase } from '@/lib/supabase'
import type { Supplier } from '@/types/database'

export async function adminGetSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')
  if (error) throw error
  return (data || []) as Supplier[]
}

export async function adminGetSupplier(id: string) {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Supplier
}

export async function adminCreateSupplier(payload: {
  name: string
  contact_person?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  region?: string | null
  notes?: string | null
  is_active?: boolean
}) {
  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      name: payload.name.trim(),
      contact_person: payload.contact_person?.trim() || null,
      email: payload.email?.trim() || null,
      phone: payload.phone?.trim() || null,
      address: payload.address?.trim() || null,
      city: payload.city?.trim() || null,
      region: payload.region?.trim() || null,
      notes: payload.notes?.trim() || null,
      is_active: payload.is_active ?? true,
    })
    .select()
    .single()
  if (error) throw error
  return data as Supplier
}

export async function adminUpdateSupplier(
  id: string,
  payload: Partial<{
    name: string
    contact_person: string | null
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    region: string | null
    notes: string | null
    is_active: boolean
  }>
) {
  const updates: Record<string, unknown> = { ...payload }
  if (typeof payload.name === 'string') updates.name = payload.name.trim()
  const { data, error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Supplier
}

export async function adminDeleteSupplier(id: string) {
  // Products.supplier_id will SET NULL via FK
  const { error } = await supabase.from('suppliers').delete().eq('id', id)
  if (error) throw error
}

/** Count products linked to each supplier */
export async function adminGetSupplierProductCounts() {
  const { data, error } = await supabase
    .from('products')
    .select('supplier_id')
    .not('supplier_id', 'is', null)
  if (error) throw error
  const counts: Record<string, number> = {}
  for (const row of data || []) {
    const sid = row.supplier_id as string
    if (sid) counts[sid] = (counts[sid] || 0) + 1
  }
  return counts
}
