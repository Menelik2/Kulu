import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '@/types/database'
import { toast } from 'sonner'

interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_KEY = 'kulu_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product: Product, quantity = 1) => {
    if (product.stock_quantity < 1) {
      toast.error('This product is out of stock')
      return
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id)
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock_quantity)
        if (newQty === existing.quantity) {
          toast.info('Maximum available stock reached')
          return prev
        }
        toast.success('Cart updated')
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, quantity: newQty, product } : i
        )
      }
      toast.success('Added to cart')
      return [...prev, { product_id: product.id, quantity: Math.min(quantity, product.stock_quantity), product }]
    })
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId))
    toast.success('Removed from cart')
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId)
      return
    }
    setItems((prev) => {
      let hitMax = false
      const next = prev.map((i) => {
        if (i.product_id !== productId) return i
        const max = i.product?.stock_quantity ?? quantity
        if (quantity > max) {
          hitMax = true
          return { ...i, quantity: max }
        }
        return { ...i, quantity }
      })
      if (hitMax) {
        // Defer toast so we don't call it during render of setState
        queuePromise.resolve().then(() => toast.info('Maximum available stock reached'))
      }
      return next
    })
  }

  const clearCart = () => {
    setItems([])
  }

  const isInCart = (productId: string) => items.some((i) => i.product_id === productId)

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const subtotal = items.reduce((sum, i) => {
    const price = i.product
      ? (i.product.discount_price && i.product.discount_price < i.product.price
          ? i.product.discount_price
          : i.product.price)
      : 0
    return sum + price * i.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
