import { api } from '@/services/request'
import { PageResponse } from '@/types'

/** 申请售后 */
export const applyAfterSale = (data: {
  order_id: number
  order_item_id?: number
  type: string
  reason: string
  description?: string
  images?: string[]
  amount: number
}) => api.post('/api/after-sale/apply', data)

/** 获取用户售后列表 */
export const getAfterSaleList = (page = 1, pageSize = 10) =>
  api.get<PageResponse<any>>('/api/after-sale/list', { page, page_size: pageSize })

/** 获取售后详情 */
export const getAfterSaleDetail = (after_sale_id: number) =>
  api.get<any>('/api/after-sale/detail', { after_sale_id })
