import { api } from '@/services/request'

/** 获取地址列表 */
export const getAddressList = () => api.get<any[]>('/api/address/list')

/** 创建地址 */
export const createAddress = (data: {
  consignee: string
  mobile: string
  province: string
  city: string
  district: string
  detail_address: string
  is_default?: number
}) => api.post('/api/address/create', data)

/** 更新地址 */
export const updateAddress = (data: {
  id: number
  consignee: string
  mobile: string
  province: string
  city: string
  district: string
  detail_address: string
  is_default?: number
}) => api.put('/api/address/update', data)

/** 删除地址 */
export const deleteAddress = (id: number) =>
  api.delete('/api/address/delete', { id })
