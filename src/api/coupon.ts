import { api } from '@/services/request'

/** 获取可用优惠券列表（原有） */
export const getCouponList = () => api.get<any[]>('/api/coupon/list')

/** 获取待领取的优惠券列表 */
export const getAvailableCoupons = () => api.get<any[]>('/api/coupon/available')

/** 领取优惠券 */
export const claimCoupon = (couponId: number) => api.post('/api/coupon/claim', { coupon_id: couponId })

/** 获取我的优惠券（已领取的） */
export const getUserCoupons = () => api.get<any[]>('/api/coupon/user/list')

/** 获取可用于订单的优惠券 */
export const getUsableCoupons = (totalAmount: number) =>
  api.get<any[]>('/api/coupon/usable', { total_amount: totalAmount })

/** 计算优惠券折扣 */
export const calculateDiscount = (userCouponId: number, totalAmount: number) =>
  api.get<any>('/api/coupon/calculate', { user_coupon_id: userCouponId, total_amount: totalAmount })