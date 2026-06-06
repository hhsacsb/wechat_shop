import { api } from '@/services/request'

/** 获取可用优惠券列表 */
export const getCouponList = () => api.get<any[]>('/api/coupon/list')
