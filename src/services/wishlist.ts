import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/database'

export type WishlistRow = {
  id: string
  wishlist_id: string
  product_id: string
  product?: Product | null
}

/** Get or create the user's wishlist row (required before items). */
export async function ensureWishlist(userId: string): Promise<string> {
  const { data: existing, error: selectError } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (selectError) throw selectError
  if (existing?.id) return existing.id

  const { data: created, error: insertError } = await supabase
    .from('wishlists')
    .insert({ user_id: userId })
    .select('id')
    .single()

  // Race: another tab may have created it
  if (insertError) {
    const { data: again, error: againError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()
    if (againError) throw againError
    if (again?.id) return again.id
    throw insertError
  }

  return created.id
}

export async function getWishlist(userId: string): Promise<WishlistRow[]> {
  const wishlistId = await ensureWishlist(userId)

  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*, product:products(*, images:product_images(*))')
    .eq('wishlist_id', wishlistId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as WishlistRow[]
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  const { data: wl } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!wl?.id) return false

  const { data } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('wishlist_id', wl.id)
    .eq('product_id', productId)
    .maybeSingle()

  return !!data
}

/** @returns true if product is now on the wishlist, false if removed */
export async function toggleWishlist(userId: string, productId: string): Promise<boolean> {
  const wishlistId = await ensureWishlist(userId)

  const { data: existing, error: findError } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('wishlist_id', wishlistId)
    .eq('product_id', productId)
    .maybeSingle()

  if (findError) throw findError

  if (existing) {
    const { error } = await supabase.from('wishlist_items').delete().eq('id', existing.id)
    if (error) throw error
    return false
  }

  const { error } = await supabase.from('wishlist_items').insert({
    wishlist_id: wishlistId,
    product_id: productId,
  })
  if (error) throw error
  return true
}

export async function getWishlistProductIds(userId: string): Promise<Set<string>> {
  const { data: wl } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!wl?.id) return new Set()

  const { data, error } = await supabase
    .from('wishlist_items')
    .select('product_id')
    .eq('wishlist_id', wl.id)

  if (error) throw error
  return new Set((data || []).map((r) => r.product_id as string))
}
