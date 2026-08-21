import { supabase } from '@/lib/supabase'
import type { Product, Category, Order, Profile, Review, DeliveryConfig, InventoryTransaction } from '@/types/database'
import { slugify } from '@/lib/utils'
import { deleteAllProductImages } from '@/services/productImages'

const PRODUCT_SELECT_WITH_SUPPLIER =
  '*, category:categories(*), supplier:suppliers(*), images:product_images(*)'
const PRODUCT_SELECT_BASIC =
  '*, category:categories(*), images:product_images(*)'

async function selectProducts(orderCreatedDesc: boolean) {
  let q = supabase.from('products').select(PRODUCT_SELECT_WITH_SUPPLIER)
  if (orderCreatedDesc) q = q.order('created_at', { ascending: false })
  const { data, error } = await q
  if (!error) return (data || []) as Product[]

  console.warn('products+supplier select failed, falling back:', error.message)
  let q2 = supabase.from('products').select(PRODUCT_SELECT_BASIC)
  if (orderCreatedDesc) q2 = q2.order('created_at', { ascending: false })
  const { data: data2, error: error2 } = await q2
  if (error2) throw error2
  return (data2 || []) as Product[]
}

export async function adminGetProducts() {
  return selectProducts(true)
}

export async function adminGetProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT_WITH_SUPPLIER)
    .eq('id', id)
    .single()
  if (!error && data) return data as Product

  const { data: data2, error: error2 } = await supabase
    .from('products')
    .select(PRODUCT_SELECT_BASIC)
    .eq('id', id)
    .single()
  if (error2) throw error2
  return data2 as Product
}

export async function adminCreateProduct(payload: {
  name: string; description?: string; price: number; discount_price?: number | null
  sku: string; stock_quantity: number; category_id?: string | null
  supplier_id?: string | null; brand?: string
  is_active?: boolean; is_featured?: boolean
}) {
  const slug = slugify(payload.name)
  const { data, error } = await supabase
    .from('products')
    .insert({
      ...payload,
      slug,
      discount_price: payload.discount_price || null,
      supplier_id: payload.supplier_id || null,
      is_active: payload.is_active ?? true,
      is_featured: payload.is_featured ?? false,
    })
    .select()
    .single()
  if (error) throw error
  return data as Product
}

export async function adminUpdateProduct(id: string, payload: Partial<{
  name: string; description: string; price: number; discount_price: number | null
  sku: string; stock_quantity: number; category_id: string | null
  supplier_id: string | null; brand: string
  is_active: boolean; is_featured: boolean
}>) {
  const updates: Record<string, unknown> = { ...payload }
  if (payload.name) updates.slug = slugify(payload.name)
  if ('supplier_id' in payload) updates.supplier_id = payload.supplier_id || null
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Product
}

/** Delete product + all product_images rows + storage files */
export async function adminDeleteProduct(id: string) {
  // Prefer explicit image cleanup (DB rows + storage folder) before product row
  try {
    await deleteAllProductImages(id)
  } catch (e) {
    console.warn('Image cleanup before product delete:', e)
    // Product delete still cascades product_images rows in DB
  }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error

  // Safety: remove any leftover image rows (should be 0 after CASCADE)
  await supabase.from('product_images').delete().eq('product_id', id)
}

export async function adminAdjustStock(params: {
  productId: string
  quantityChange: number
  reason: string
  performedBy?: string | null
  setAbsolute?: boolean
}) {
  const { productId, reason, performedBy = null, setAbsolute = false } = params
  let quantityChange = params.quantityChange

  const { data: product, error: fetchErr } = await supabase
    .from('products')
    .select('id, stock_quantity, name')
    .eq('id', productId)
    .single()
  if (fetchErr) throw fetchErr
  if (!product) throw new Error('Product not found')

  const current = Number(product.stock_quantity) || 0
  if (setAbsolute) {
    quantityChange = quantityChange - current
  }
  if (quantityChange === 0) {
    return product as Product
  }

  const next = current + quantityChange
  if (next < 0) throw new Error('Stock cannot go below zero')

  const { data: updated, error: updErr } = await supabase
    .from('products')
    .update({ stock_quantity: next, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select()
    .single()
  if (updErr) throw updErr

  const { error: txErr } = await supabase.from('inventory_transactions').insert({
    product_id: productId,
    quantity_change: quantityChange,
    reason: reason || (quantityChange > 0 ? 'stock_in' : 'stock_out'),
    performed_by: performedBy,
  })
  if (txErr) {
    console.warn('inventory_transactions insert failed:', txErr)
  }

  return updated as Product
}

export async function adminGetInventoryTransactions(limit = 40) {
  const { data, error } = await supabase
    .from('inventory_transactions')
    .select('*, product:products(id, name, sku)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []) as (InventoryTransaction & {
    product?: { id: string; name: string; sku: string } | null
  })[]
}

export async function adminGetCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order')
  if (error) throw error
  return (data || []) as Category[]
}

export async function adminCreateCategory(payload: { name: string; description?: string; is_active?: boolean }) {
  const slug = slugify(payload.name)
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: payload.name.trim(),
      description: payload.description || null,
      slug,
      is_active: payload.is_active ?? true,
    })
    .select()
    .single()
  if (error) throw error
  return data as Category
}

export async function adminUpdateCategory(id: string, payload: Partial<{ name: string; description: string; is_active: boolean; sort_order: number }>) {
  const updates: Record<string, unknown> = { ...payload }
  if (payload.name) updates.slug = slugify(payload.name)
  if ('is_active' in payload) updates.is_active = !!payload.is_active
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
  if (label && data?.user_id) {
    const { error: nErr } = await supabase.from('notifications').insert({
      user_id: data.user_id,
      title: `Order ${label}`,
      message: `Your order ${data.order_number} has been ${label}.`,
      type: 'order',
      link: `/orders/${data.id}`,
    })
    if (nErr) console.warn('order status notification failed:', nErr.message)
  }

  return data as Order
}

export async function adminDeleteOrder(id: string) {
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw error
}

export async function adminGetCustomers() {
  const { data, error } = await supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Profile[]
}

export async function adminGetReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, product:products(id, name, slug), user:profiles(id, full_name, email)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Review[]
}

export async function adminSetReviewVisibility(id: string, is_visible: boolean) {
  const { data, error } = await supabase
    .from('reviews')
    .update({ is_visible })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Review
}

export async function adminDeleteReview(id: string) {
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) throw error
}

const DEFAULT_DELIVERY: { region: string; fee: number; estimated_days_min: number; estimated_days_max: number }[] = [
  { region: 'Addis Ababa', fee: 80, estimated_days_min: 1, estimated_days_max: 2 },
  { region: 'Oromia', fee: 150, estimated_days_min: 2, estimated_days_max: 4 },
  { region: 'Amhara', fee: 180, estimated_days_min: 3, estimated_days_max: 5 },
  { region: 'Tigray', fee: 220, estimated_days_min: 4, estimated_days_max: 7 },
  { region: 'SNNPR', fee: 180, estimated_days_min: 3, estimated_days_max: 5 },
  { region: 'Sidama', fee: 160, estimated_days_min: 2, estimated_days_max: 4 },
  { region: 'Dire Dawa', fee: 200, estimated_days_min: 3, estimated_days_max: 5 },
  { region: 'Harari', fee: 200, estimated_days_min: 3, estimated_days_max: 5 },
  { region: 'Somali', fee: 250, estimated_days_min: 4, estimated_days_max: 8 },
  { region: 'Afar', fee: 250, estimated_days_min: 4, estimated_days_max: 8 },
  { region: 'Benishangul-Gumuz', fee: 220, estimated_days_min: 4, estimated_days_max: 7 },
  { region: 'Gambela', fee: 250, estimated_days_min: 4, estimated_days_max: 8 },
]

export async function adminGetDeliveryConfigs() {
  const { data, error } = await supabase
    .from('delivery_configs')
    .select('*')
    .order('region')
  if (error) throw error
  return (data || []) as DeliveryConfig[]
}

export async function adminUpdateDeliveryConfig(
  id: string,
  payload: Partial<{ fee: number; estimated_days_min: number; estimated_days_max: number; is_active: boolean }>
) {
  const { data, error } = await supabase
    .from('delivery_configs')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as DeliveryConfig
}

export async function adminEnsureDefaultDeliveryConfigs() {
  const existing = await adminGetDeliveryConfigs()
  if (existing.length > 0) return existing

  const { data, error } = await supabase
    .from('delivery_configs')
    .insert(
      DEFAULT_DELIVERY.map((d) => ({
        region: d.region,
        city: null,
        fee: d.fee,
        estimated_days_min: d.estimated_days_min,
        estimated_days_max: d.estimated_days_max,
        is_active: true,
      }))
    )
    .select()
  if (error) throw error
  return (data || []) as DeliveryConfig[]
}

export async function getDeliveryConfigs() {
  const { data, error } = await supabase
    .from('delivery_configs')
    .select('*')
    .eq('is_active', true)
    .order('region')
  if (error) throw error
  if (data && data.length > 0) return data as DeliveryConfig[]
  return DEFAULT_DELIVERY.map((d, i) => ({
    id: `default-${i}`,
    region: d.region,
    city: null,
    fee: d.fee,
    estimated_days_min: d.estimated_days_min,
    estimated_days_max: d.estimated_days_max,
    is_active: true,
  })) as DeliveryConfig[]
}

export function feeForRegion(configs: DeliveryConfig[], region: string, fallback = 150): number {
  const match = configs.find((c) => c.region === region && c.is_active)
  return match ? Number(match.fee) : fallback
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

/** @deprecated use @/services/wishlist */
export { getWishlist, toggleWishlist } from '@/services/wishlist'
