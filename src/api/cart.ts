import { api } from '@/services/request'
import { PageResponse } from '@/types'

/** 获取购物车列表 */
export const getCartList = () => api.get<PageResponse<any>>('/api/cart/list')

/** 添加到购物车 */
export const addToCart = (data: { product_id: number; sku_id: number; quantity: number }) =>
  api.post('/api/cart/add', data)

/** 更新购物车项 */
export const updateCartItem = (data: { cart_id: number; quantity?: number; checked?: number }) =>
  api.put('/api/cart/update', data)

/** 删除购物车项 */
export const deleteCartItems = (cart_ids: number[]) =>
  api.delete('/api/cart/delete', { cart_ids })
