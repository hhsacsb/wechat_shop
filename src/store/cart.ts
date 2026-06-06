import { create } from 'zustand'
import { CartItem } from '@/types'
import { getCartList, updateCartItem as apiUpdateCartItem, deleteCartItems as apiDeleteCartItems } from '@/api'

interface CartState {
  items: CartItem[]
  loading: boolean
  fetchCart: () => Promise<void>
  findItem: (productId: number, skuId: number) => CartItem | undefined
  addItem: (item: CartItem) => void
  updateQuantity: (id: number, quantity: number) => Promise<void>
  toggleCheck: (id: number) => void
  toggleCheckAll: (checked: boolean) => void
  removeItem: (id: number) => Promise<void>
  getCheckedItems: () => CartItem[]
  getTotalAmount: () => number
  getTotalCount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true })
    try {
      const data = await getCartList()

      // 转换 API 响应为前端格式
      if (data?.list && Array.isArray(data.list)) {
        const items = data.list.map((item: any) => ({
          id: item.id,
          userId: item.user_id || 1,
          productId: item.product_id || 0,
          skuId: item.sku_id || 0,
          quantity: item.quantity || 1,
          checked: !!item.checked,
          productName: item.product_name || item.productName || '',
          skuDesc: item.sku_desc || item.skuDesc || '',
          price: item.price || 0,
          coverImage: item.cover_image || item.coverImage || '',
          stock: item.stock || 0,
        }))
        set({ items })
      } else {
        set({ items: [] })
      }
    } catch (err) {
      console.error('[CartStore] fetchCart error:', err)
      // API 失败时使用空数组（生产环境应显示错误提示）
      set({ items: [] })
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

  updateQuantity: async (id, quantity) => {
    // 先更新本地状态（乐观更新）
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    }))

    try {
      // 调用 API 更新
      await apiUpdateCartItem({ cart_id: id, quantity })
    } catch (error) {
      console.error('[CartStore] updateQuantity error:', error)
      // API 失败时回滚或提示用户
    }
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

  removeItem: async (id) => {
    // 先从本地状态移除（乐观更新）
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }))

    try {
      // 调用 API 删除
      await apiDeleteCartItems([id])
    } catch (error) {
      console.error('[CartStore] removeItem error:', error)
      // API 失败时可以重新加载购物车
      get().fetchCart()
    }
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