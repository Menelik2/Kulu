import { supabase } from '@/lib/supabase'
import type { Product, Category, Order, Profile } from '@/types/database'
import { slugify } from '@/lib/utils'

export async function adminGetProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Product[]
}

export async function adminGetProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Product
}

export async function adminCreateProduct(payload: {
  name: string; description?: string; price: number; discount_price?: number | null
  sku: string; stock_quantity: number; category_id?: string | null; brand?: string
  is_active?: boolean; is_featured?: boolean
}) {
  const slug = slugify(payload.name)
  const { data, error } = await supabase
    .from('products')
    .insert({ ...payload, slug, discount_price: payload.discount_price || null })
    .select().single()
  if (error) throw error
  return data as Product
}

export async function adminUpdateProduct(id: string, payload: Partial<{
  name: string; description: string; price: number; discount_price: number | null
  sku: string; stock_quantity: number; category_id: string | null; brand: string
  is_active: boolean; is_featured: boolean
}>) {
  const updates: Record<string, unknown> = { ...payload }
  if (payload.name) updates.slug = slugify(payload.name)
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Product
}

export async function adminDeleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function adminGetCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order')
  if (error) throw error
  return (data || []) as Category[]
}

export async function adminCreateCategory(payload: { name: string; description?: string; is_active?: boolean }) {
  const slug = slugify(payload.name)
  const { data, error } = await supabase.from('categories').insert({ ...payload, slug }).select().single()
  if (error) throw error
  return data as Category
}

export async function adminUpdateCategory(id: string, payload: Partial<{ name: string; description: string; is_active: boolean; sort_order: number }>) {
  const updates: Record<string, unknown> = { ...payload }
  if (payload.name) updates.slug = slugify(payload.name)
  const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Category
}

export async function adminDeleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

export async function adminGetOrders(status?: string) {
  let q = supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) throw error
  return (data || []) as Order[]
}

export async function adminGetOrder(id: string) {
  const { data, error } = await supabase.from('orders').select('*, items:order_items(*)').eq('id', id).single()
  if (error) throw error
  return data as Order
}

export async function adminUpdateOrderStatus(id: string, status: string) {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single()
  if (error) throw error

  const statusLabels: Record<string, string> = {
    confirmed: 'confirmed',
    processing: 'being prepared',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
  }
  const label = statusLabels[status]
  if (label && data) {
    await supabase.from('notifications').insert({
      user_id: data.user_id,
      title: `Order ${label}`,
      message: `Your order ${data.order_number} has been ${label}.`,
      type: 'order',
      link: `/orders/${data.id}`,
    })
  }

  return data as Order
}

export async function adminGetCustomers() {
  const { data, error } = await supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Profile[]
}

export async function adminGetDashboardStats() {
  const [products, orders, customers, lowStock] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id, total, status, created_at'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('products').select('id, name, stock_quantity').lt('stock_quantity', 10).eq('is_active', true),
  ])
  const allOrders = orders.data || []
  const totalSales = allOrders.reduce((s, o) => s + Number(o.total || 0), 0)
  const today = new Date().toISOString().slice(0, 10)
  const todaySales = allOrders.filter((o) => o.created_at?.startsWith(today)).reduce((s, o) => s + Number(o.total || 0), 0)
  const pending = allOrders.filter((o) => o.status === 'pending').length
  const delivered = allOrders.filter((o) => o.status === 'delivered').length
  const salesByDay: Record<string, number> = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    salesByDay[d.toISOString().slice(0, 10)] = 0
  }
  allOrders.forEach((o) => {
    const day = o.created_at?.slice(0, 10)
    if (day && day in salesByDay) salesByDay[day] += Number(o.total || 0)
  })
  return {
    totalProducts: products.count || 0,
    totalOrders: allOrders.length,
    totalCustomers: customers.count || 0,
    totalSales, todaySales,
    pendingOrders: pending, deliveredOrders: delivered,
    lowStock: lowStock.data || [],
    salesByDay: Object.entries(salesByDay).map(([date, total]) => ({ date, total })),
    recentOrders: allOrders.slice(0, 5) as Order[],
  }
}

export async function getMyOrders(userId: string) {
  const { data, error } = await supabase.from('orders').select('*, items:order_items(*)').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Order[]
}

export async function getMyOrder(orderId: string) {
  const { data, error } = await supabase.from('orders').select('*, items:order_items(*)').eq('id', orderId).single()
  if (error) throw error
  return data as Order
}

export async function getWishlist(userId: string) {
  const { data: wl } = await supabase.from('wishlists').select('id').eq('user_id', userId).single()
  if (!wl) return []
  const { data, error } = await supabase.from('wishlist_items').select('*, product:products(*, images:product_images(*))').eq('wishlist_id', wl.id)
  if (error) throw error
  return data || []
}

export async function toggleWishlist(userId: string, productId: string) {
  const { data: wl } = await supabase.from('wishlists').select('id').eq('user_id', userId).single()
  if (!wl) throw new Error('Wishlist not found')
  const { data: existing } = await supabase.from('wishlist_items').select('id').eq('wishlist_id', wl.id).eq('product_id', productId).maybeSingle()
  if (existing) {
    await supabase.from('wishlist_items').delete().eq('id', existing.id)
    return false
  }
  await supabase.from('wishlist_items').insert({ wishlist_id: wl.id, product_id: productId })
  return true
}
