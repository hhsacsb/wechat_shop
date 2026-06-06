import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { useCartStore } from '@/store/cart'
import { getAddressList, getCouponList, createOrder, previewOrder } from '@/api'

// 立即购买时从 URL 解析的商品信息
interface BuyNowItem {
  productId: number
  productName: string
  coverImage: string
  skuId: number
  skuDesc: string
  price: number
  quantity: number
}

// 生成稳定 ID（避免 Date.now() 每次渲染变化）
const makeStableId = (productId: number, skuId: number) => `${productId}_${skuId}`

const OrderConfirmPage: React.FC = () => {
  const [addresses, setAddresses] = useState<any[]>([])
  const [coupons, setCoupons] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null)
  const [remark, setRemark] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // 用字符串 key 存储，避免数字 id 冲突
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({})
  const getCheckedItems = useCartStore((state) => state.getCheckedItems)

  // 加载地址和优惠券
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [addrData, couponData] = await Promise.all([
        getAddressList().catch(() => []),
        getCouponList().catch(() => []),
      ])

      if (Array.isArray(addrData)) {
        setAddresses(addrData)
        // 默认选中第一个默认地址
        const defaultAddr = addrData.find((a: any) => a.is_default || a.isDefault)
        setSelectedAddress(defaultAddr || (addrData.length > 0 ? addrData[0] : null))
      }

      if (Array.isArray(couponData)) {
        setCoupons(couponData)
        setSelectedCoupon(couponData[0] || null)
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  // 判断是否为"立即购买"模式（只在首次计算）
  const buyNowItem = useMemo<BuyNowItem | null>(() => {
    try {
      const params = Taro.getCurrentInstance().router?.params?.buyNow
      if (params) {
        return JSON.parse(decodeURIComponent(params))
      }
    } catch {}
    return null
  }, [])

  // 稳定化商品列表 + 统一 id 格式
  const sourceItems = useMemo(() => {
    if (buyNowItem) {
      return [{
        stableId: makeStableId(buyNowItem.productId, buyNowItem.skuId),
        productId: buyNowItem.productId,
        productName: buyNowItem.productName,
        coverImage: buyNowItem.coverImage,
        skuId: buyNowItem.skuId,
        skuDesc: buyNowItem.skuDesc,
        price: buyNowItem.price,
        quantity: buyNowItem.quantity,
      }]
    }
    return getCheckedItems().map((item) => ({
      ...item,
      stableId: makeStableId(item.productId, item.skuId),
    }))
  }, [buyNowItem])

  // 首次挂载时初始化数量（只执行一次）
  const initializedRef = React.useRef(false)
  if (!initializedRef.current && sourceItems.length > 0) {
    initializedRef.current = true
    const init: Record<string, number> = {}
    sourceItems.forEach((item) => { init[item.stableId] = item.quantity })
    // 同步设置初始值，避免首次渲染空白
    Object.keys(qtyMap).length === 0 && setQtyMap(init)
  }

  // 获取某项当前数量
  const getQty = useCallback((stableId: string): number => {
    return qtyMap[stableId] ?? 1
  }, [qtyMap])

  // 调整数量
  const handleQtyChange = useCallback((stableId: string, delta: number) => {
    setQtyMap((prev) => {
      const current = prev[stableId] ?? 1
      const newQty = Math.max(1, current + delta)
      return { ...prev, [stableId]: newQty }
    })
  }, [])

  // 实时计算总金额
  const totalAmount = useMemo(() => {
    return sourceItems.reduce(
      (sum, item) => sum + item.price * getQty(item.stableId),
      0
    )
  }, [sourceItems, qtyMap])

  const coupon = selectedCoupon
  const discount = (coupon && totalAmount >= (coupon.min_amount || coupon.minAmount)) ? (coupon.amount || 0) : 0
  const payAmount = totalAmount - discount

  const handleSubmit = async () => {
    if (!selectedAddress) {
      Taro.showToast({ title: '请选择收货地址', icon: 'none' })
      return
    }

    if (submitting) return

    try {
      setSubmitting(true)
      Taro.showLoading({ title: '提交中...' })

      // 构建订单数据
      const orderData: any = {
        source: buyNowItem ? 'buy_now' : 'cart',
        address_id: selectedAddress.id,
        remark,
        coupon_id: selectedCoupon?.id,
      }

      if (buyNowItem) {
        orderData.product_id = buyNowItem.productId
        orderData.sku_id = buyNowItem.skuId
        orderData.quantity = getQty(makeStableId(buyNowItem.productId, buyNowItem.skuId))
      } else {
        const checkedItems = getCheckedItems()
        orderData.cart_ids = checkedItems.map((item) => item.id)
      }

      // 调用创建订单 API
      const result = await createOrder(orderData)

      Taro.hideLoading()
      Taro.redirectTo({
        url: `/pages/pay-result/index?amount=${payAmount}&success=1&orderId=${result.order_id || result.id}`,
      })
    } catch (error) {
      console.error('提交订单失败:', error)
      Taro.hideLoading()
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className={styles.confirmPage}>
      {/* 地址 */}
      <View className={styles.addressCard} onClick={() => Taro.navigateTo({ url: '/pages/address-list/index' })}>
        {selectedAddress ? (
          <View className={styles.addressInfo}>
            <Text className={styles.addressName}>{selectedAddress.consignee}</Text>
            <Text className={styles.addressMobile}>{selectedAddress.mobile}</Text>
            <Text className={styles.addressDetail}>
              {selectedAddress.province}{selectedAddress.city}{selectedAddress.district}{selectedAddress.detail_address || selectedAddress.detailAddress}
            </Text>
          </View>
        ) : (
          <View className={styles.addressEmpty}>
            <Text>请添加收货地址</Text>
          </View>
        )}
      </View>

      {/* 商品列表 */}
      <View className={styles.orderItems}>
        {sourceItems.length > 0 ? sourceItems.map((item) => {
          const qty = getQty(item.stableId)
          return (
            <View key={item.stableId} className={styles.orderItem}>
              <Image className={styles.itemImage} src={item.coverImage} mode='aspectFill' />
              <View className={styles.itemInfo}>
                <Text className={styles.itemName}>{item.productName}</Text>
                <Text className={styles.itemSku}>{item.skuDesc}</Text>
                <View className={styles.itemBottom}>
                  <Text className={styles.itemPrice}>¥{item.price}</Text>
                  {/* 数量加减按钮 */}
                  <View className={styles.qtyControl}>
                    <View
                      className={`${styles.qtyBtn} ${qty <= 1 ? styles.qtyBtnDisabled : ''}`}
                      onClick={() => handleQtyChange(item.stableId, -1)}
                    >
                      <Text>-</Text>
                    </View>
                    <Text className={styles.qtyNum}>{qty}</Text>
                    <View
                      className={styles.qtyBtn}
                      onClick={() => handleQtyChange(item.stableId, 1)}
                    >
                      <Text>+</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )
        }) : (
          <Text>请先在购物车选择商品</Text>
        )}
      </View>

      {/* 优惠券 */}
      <View className={styles.couponRow}>
        <Text className={styles.couponLabel}>优惠券</Text>
        <Text className={styles.couponValue}>
          {discount > 0 ? `-¥${discount}` : '暂无可用'}
        </Text>
      </View>

      {/* 备注 */}
      <View className={styles.remarkRow}>
        <Text className={styles.remarkLabel}>备注</Text>
        <Input placeholder='选填：请备注您的需求' value={remark} onInput={(e) => setRemark(e.detail.value)} />
      </View>

      {/* 金额汇总 */}
      <View className={styles.summaryCard}>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>商品金额</Text>
          <Text className={styles.summaryValue}>¥{totalAmount.toFixed(2)}</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>优惠金额</Text>
          <Text className={styles.summaryValue}>-¥{discount.toFixed(2)}</Text>
        </View>
        <View className={`${styles.summaryRow} ${styles.totalRow}`}>
          <Text className={styles.summaryLabel}>实付金额</Text>
          <Text className={styles.summaryValue}>¥{payAmount.toFixed(2)}</Text>
        </View>
      </View>

      {/* 底部提交 */}
      <View className={styles.bottomBar}>
        <Text className={styles.totalAmount}>¥{payAmount.toFixed(2)}</Text>
        <View className={styles.submitBtn} onClick={handleSubmit}>提交订单</View>
      </View>
    </View>
  )
}

export default OrderConfirmPage