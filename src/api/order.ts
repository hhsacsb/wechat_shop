import { api } from '@/services/request'
import { PageResponse } from '@/types'

/** 订单预览 */
export const previewOrder = (data: {
  source: string
  cart_ids?: number[]
  coupon_id?: number
  address_id?: number
}) => api.post<any>('/api/order/preview', data)

/** 创建订单 */
export const createOrder = (data: {
  source: string
  address_id: number
  coupon_id?: number
  remark?: string
  cart_ids?: number[]
  product_id?: number
  sku_id?: number
  quantity?: number
}) => api.post<any>('/api/order/create', data)

/** 支付订单 */
export const payOrder = (order_id: number) => api.post('/api/order/pay', { order_id })

/** 获取用户订单列表 */
export const getOrderList = (params: {
  status?: number
  page?: number
  page_size?: number
}) => api.get<PageResponse<any>>('/api/order/list', params)

/** 获取订单详情 */
export const getOrderDetail = (order_id: number) =>
  api.get<any>('/api/order/detail', { order_id })

/** 取消订单 */
export const cancelOrder = (order_id: number) =>
  api.post('/api/order/cancel', { order_id })

/** 确认收货 */
export const confirmReceipt = (order_id: number) =>
  api.post('/api/order/confirm', { order_id })
