import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '../types'

interface AddItemOptions {
  name?: string
  price?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, options?: AddItemOptions) => void
  removeItem: (productId: number, name?: string, price?: string) => void
  updateQuantity: (productId: number, quantity: number, name?: string, price?: string) => void
  clearCart: () => void
  totalCount: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)
const STORAGE_KEY = 'doubleb_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product: Product, quantity = 1, options?: AddItemOptions) => {
    const lineName = options?.name || product.name
    const linePrice = options?.price || product.price
    const lineKey = `${product.id}:${lineName}:${linePrice}`

    setItems((prev) => {
      const existing = prev.find(
        (i) => `${i.product_id}:${i.name}:${i.price}` === lineKey,
      )
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock)
        return prev.map((i) =>
          `${i.product_id}:${i.name}:${i.price}` === lineKey ? { ...i, quantity: newQty } : i,
        )
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: lineName,
          price: linePrice,
          quantity: Math.min(quantity, product.stock),
          image_url: product.image_url,
          stock: product.stock,
        },
      ]
    })
  }

  const lineKey = (item: CartItem) => `${item.product_id}:${item.name}:${item.price}`

  const removeItem = (productId: number, name?: string, price?: string) => {
    setItems((prev) =>
      prev.filter((i) => {
        if (name && price) return lineKey(i) !== `${productId}:${name}:${price}`
        return i.product_id !== productId
      }),
    )
  }

  const updateQuantity = (productId: number, quantity: number, name?: string, price?: string) => {
    const key = name && price ? `${productId}:${name}:${price}` : String(productId)
    if (quantity <= 0) {
      removeItem(productId, name, price)
      return
    }
    setItems((prev) =>
      prev.map((i) => {
        const match = name && price ? lineKey(i) === key : i.product_id === productId
        return match ? { ...i, quantity: Math.min(quantity, i.stock) } : i
      }),
    )
  }

  const clearCart = () => setItems([])

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalCount, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
