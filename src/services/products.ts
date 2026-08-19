import { supabase } from '@/lib/supabase'
import type { Product, Category } from '@/types/database'

export interface ProductFilters {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'bestselling'
  page?: number
  limit?: number
  featured?: boolean
}

export async function getProducts(filters: ProductFilters = {}) {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    inStock,
    sort = 'newest',
    page = 1,
    limit = 12,
    featured,
  } = filters

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*)
    `, { count: 'exact' })
    .eq('is_active', true)

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }
  if (category) {
    query = query.eq('category_id', category)
  }
  if (minPrice !== undefined) {
    query = query.gte('price', minPrice)
  }
  if (maxPrice !== undefined) {
    query = query.lte('price', maxPrice)
  }
  if (inStock) {
    query = query.gt('stock_quantity', 0)
  }
  if (featured) {
    query = query.eq('is_featured', true)
  }

  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'popular':
      query = query.order('view_count', { ascending: false })
      break
    case 'bestselling':
      query = query.order('sold_count', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data, error, count } = await query

  if (error) throw error

  return {
    products: (data || []) as Product[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data as Product
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []) as Category[]
}

export async function getFeaturedProducts(limit = 8) {
  return getProducts({ featured: true, limit })
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*)
    `)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .neq('id', excludeId)
    .limit(limit)

  if (error) throw error
  return (data || []) as Product[]
}
