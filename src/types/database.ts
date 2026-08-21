export type UserRole = 'customer' | 'admin'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentMethod = 'cod' | 'telebirr' | 'chapa' | 'stripe'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type DeliveryStatus = 'pending' | 'preparing' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  region: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  discount_price: number | null
  sku: string
  stock_quantity: number
  category_id: string | null
  supplier_id?: string | null
  brand: string | null
  specifications: Record<string, string> | null
  is_active: boolean
  is_featured: boolean
  view_count: number
  sold_count: number
  created_at: string
  updated_at: string
  category?: Category | null
  supplier?: Supplier | null
  images?: ProductImage[]
  average_rating?: number
  review_count?: number
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
  created_at: string
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  region: string
  city: string
  sub_city: string | null
  woreda: string | null
  kebele: string | null
  house_info: string | null
  delivery_instructions: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  subtotal: number
  delivery_fee: number
  discount_amount: number
  total: number
  delivery_region: string
  delivery_city: string
  delivery_sub_city: string | null
  delivery_woreda: string | null
  delivery_kebele: string | null
  delivery_house_info: string | null
  delivery_instructions: string | null
  delivery_status: DeliveryStatus
  estimated_delivery_date: string | null
  customer_name: string
  customer_phone: string
  customer_email: string
  notes: string | null
  cancelled_reason: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  user?: Profile
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_sku: string
  product_image_url: string | null
  unit_price: number
  quantity: number
  total_price: number
  created_at: string
  product?: Product
}

export interface Wishlist {
  id: string
  user_id: string
  created_at: string
}

export interface WishlistItem {
  id: string
  wishlist_id: string
  product_id: string
  created_at: string
  product?: Product
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  order_item_id: string | null
  rating: number
  comment: string | null
  is_visible: boolean
  created_at: string
  updated_at: string
  user?: Profile
  product?: Product
}

export interface InventoryTransaction {
  id: string
  product_id: string
  quantity_change: number
  reason: string
  reference_id: string | null
  performed_by: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  link: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  admin_id: string
  action: string
  entity: string
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  admin?: Profile
}

export interface DeliveryConfig {
  id: string
  region: string
  city: string | null
  fee: number
  estimated_days_min: number
  estimated_days_max: number
  is_active: boolean
}

export interface CartItem {
  product_id: string
  quantity: number
  product?: Product
}
