import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { useCartStore } from '@/store/cart'
import { getAddressList, getUsableCoupons, createOrder, deleteCartItems } from '@/api'

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
  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null)
  const [remark, setRemark] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // 用字符串 key 存储，避免数字 id 冲突
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({})

  // 优惠券相关
  const [showCouponPopup, setShowCouponPopup] = useState(false)
  const [usableCoupons, setUsableCoupons] = useState<any[]>([])

  const getCheckedItems = useCartStore((state) => state.getCheckedItems)
  const removeCheckedItems = useCartStore((state) => state.removeCheckedItems)

  // 页面显示时重新加载数据（从地址选择页返回时刷新，也覆盖首次加载）
  useDidShow(() => {
    loadAddress()
    loadUsableCoupons()
  })

  const loadAddress = async () => {
    try {
      const addrData = await getAddressList().catch(() => [])

      if (Array.isArray(addrData)) {
        setAddresses(addrData)

        // 优先使用从地址选择页带回的选中地址
        const storedAddr = Taro.getStorageSync('selectedAddress')
        if (storedAddr) {
          setSelectedAddress(storedAddr)
          Taro.removeStorageSync('selectedAddress')
        } else {
          // 默认选中默认地址
          const defaultAddr = addrData.find((a: any) => a.is_default || a.isDefault)
          setSelectedAddress(defaultAddr || (addrData.length > 0 ? addrData[0] : null))
        }
      }
    } catch (error) {
      console.error('加载地址失败:', error)
    }
  }

  // 预加载可用优惠券
  const loadUsableCoupons = async () => {
    if (totalAmount <= 0) return
    try {
      const data = await getUsableCoupons(totalAmount)
      setUsableCoupons(Array.isArray(data) ? data : [])
    } catch {
      setUsableCoupons([])
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

  // 优惠金额
  const discount = selectedCoupon ? Number(selectedCoupon.amount) : 0
  const payAmount = Math.max(0, (Number(totalAmount) || 0) - discount)

  // 跳转到地址选择页（选择模式）
  const handleAddressSelect = () => {
    Taro.navigateTo({ url: '/pages/address-list/index?select=1' })
  }

  // 打开优惠券选择弹窗
  const handleOpenCouponPicker = async () => {
    await loadUsableCoupons()
    setShowCouponPopup(true)
  }

  // 选择优惠券
  const handleSelectCoupon = (coupon: any) => {
    setSelectedCoupon(coupon)
    setShowCouponPopup(false)
  }

  // 取消选择优惠券
  const handleClearCoupon = () => {
    setSelectedCoupon(null)
    setShowCouponPopup(false)
  }

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
      }

      // 传入 user_coupon_id（如果选择了优惠券）
      if (selectedCoupon) {
        orderData.user_coupon_id = selectedCoupon.user_coupon_id
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

      // 订单创建成功后清理购物车（仅购物车结算模式需要）：
      // 1) 同步清掉本地 store 中已勾选的项，避免页面残留
      // 2) 通知服务端删除对应购物车项，保证下次 fetchCart 不会拉回
      if (!buyNowItem) {
        const removedIds = removeCheckedItems()
        if (removedIds.length > 0) {
          try {
            await deleteCartItems(removedIds)
          } catch (e) {
            // 删除失败不阻塞支付流程：本地已清，依赖下次 fetchCart 与服务端对账
            console.error('[OrderConfirm] 删除已结算购物车项失败:', e)
          }
        }
      }

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
      <View className={styles.addressCard} onClick={handleAddressSelect}>
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
                  <Text className={styles.itemPrice}>¥{Number(item.price).toFixed(2)}</Text>
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

      {/* 优惠券 - 点击弹出选择 */}
      <View className={styles.couponRow} onClick={handleOpenCouponPicker}>
        <Text className={styles.couponLabel}>优惠券</Text>
        <View className={styles.couponValueWrap}>
          <Text className={styles.couponValue}>
            {selectedCoupon
              ? `-¥${Number(selectedCoupon.amount).toFixed(2)}`
              : usableCoupons.length > 0
                ? `${usableCoupons.length}张可用`
                : '选择优惠券'}
          </Text>
          <Text className={styles.couponArrow}>&gt;</Text>
        </View>
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
          <Text className={styles.summaryValue}>¥{Number(totalAmount).toFixed(2)}</Text>
        </View>
        {discount > 0 && (
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>优惠金额</Text>
            <Text className={styles.summaryValue}>-¥{Number(discount).toFixed(2)}</Text>
          </View>
        )}
        <View className={`${styles.summaryRow} ${styles.totalRow}`}>
          <Text className={styles.summaryLabel}>实付金额</Text>
          <Text className={styles.summaryValue}>¥{Number(payAmount).toFixed(2)}</Text>
        </View>
      </View>

      {/* 底部提交 */}
      <View className={styles.bottomBar}>
        <Text className={styles.totalAmount}>¥{Number(payAmount).toFixed(2)}</Text>
        <View className={styles.submitBtn} onClick={handleSubmit}>提交订单</View>
      </View>

      {/* 优惠券选择弹窗 */}
      {showCouponPopup && (
        <View className={styles.popupOverlay} onClick={() => setShowCouponPopup(false)}>
          <View className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.popupDragHandle} />
            <View className={styles.popupHeader}>
              <Text className={styles.popupTitle}>选择优惠券</Text>
              <Text className={styles.popupClose} onClick={() => setShowCouponPopup(false)}>✕</Text>
            </View>
            <View className={styles.popupList}>
              {/* 不使用优惠券选项 */}
              <View
                className={`${styles.popupNoCoupon} ${!selectedCoupon ? styles.popupNoCouponActive : ''}`}
                onClick={handleClearCoupon}
              >
                <Text className={styles.popupNoCouponText}>不使用优惠券</Text>
                <View className={styles.popupNoCouponIcon} />
              </View>

              {usableCoupons.length === 0 ? (
                <View className={styles.popupEmpty}>
                  <Text>暂无可用的优惠券，去"我的→优惠券"领取吧</Text>
                </View>
              ) : (
                usableCoupons.map((coupon: any) => (
                  <View
                    key={coupon.user_coupon_id}
                    className={`${styles.popupItem} ${selectedCoupon?.user_coupon_id === coupon.user_coupon_id ? styles.popupItemActive : ''}`}
                    onClick={() => handleSelectCoupon(coupon)}
                  >
                    <View className={styles.popupItemInfo}>
                      <Text className={styles.popupItemName}>{coupon.name}</Text>
                      <Text className={styles.popupItemDesc}>{coupon.description}</Text>
                      <Text className={styles.popupItemTime}>
                        有效期至：{coupon.end_time?.slice(0, 10)}
                      </Text>
                    </View>
                    <Text className={styles.popupItemAmount}>-¥{Number(coupon.amount).toFixed(2)}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default OrderConfirmPage