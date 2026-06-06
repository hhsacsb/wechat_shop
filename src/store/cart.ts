import { create } from 'zustand'
import { CartItem } from '@/types'
import { mockCartItems } from '@/data/cart'

interface CartState {
  items: CartItem[]
  loading: boolean
  fetchCart: () => void
  findItem: (productId: number, skuId: number) => CartItem | undefined
  addItem: (item: CartItem) => void
  updateQuantity: (id: number, quantity: number) => void
  toggleCheck: (id: number) => void
  toggleCheckAll: (checked: boolean) => void
  removeItem: (id: number) => void
  getCheckedItems: () => CartItem[]
  getTotalAmount: () => number
  getTotalCount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,

  fetchCart: () => {
    set({ loading: true })
    try {
      set({ items: mockCartItems })
    } catch (err) {
      console.error('[CartStore] fetchCart error:', err)
    } finally {
      set({ loading: false })
    }
  },

  // 查找购物车中是否已存在指定商品+SKU
  findItem: (productId, skuId) => {
    return get().items.find(
      (i) => i.productId === productId && i.skuId === skuId
    )
  },

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find(
        (i) => i.productId === item.productId && i.skuId === item.skuId
      )
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        }
      }
      return { items: [...state.items, { ...item, id: Date.now() }] }
    })
  },

  updateQuantity: (id, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    }))
  },

  toggleCheck: (id) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }))
  },

  toggleCheckAll: (checked) => {
    set((state) => ({
      items: state.items.map((item) => ({ ...item, checked })),
    }))
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }))
  },

  getCheckedItems: () => {
    return get().items.filter((item) => item.checked)
  },

  getTotalAmount: () => {
    return get()
      .items.filter((item) => item.checked)
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  getTotalCount: () => {
    return get()
      .items.filter((item) => item.checked)
      .reduce((sum, item) => sum + item.quantity, 0)
  },
}))