'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { CartItem, Product } from '@/lib/types'

interface CartContextType {
  items: CartItem[]
  add: (product: Product) => void
  remove: (productId: string) => void
  clear: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      try { setItems(JSON.parse(saved)) } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const add = useCallback((product: Product) => {
    setItems(prev => {
      if (prev.find(i => i.product.id === product.id)) return prev
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const remove = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const count = items.length

  return <CartContext.Provider value={{ items, add, remove, clear, total, count }}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
