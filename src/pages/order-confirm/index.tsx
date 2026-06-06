import React, { useState } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { mockAddresses, mockCoupons } from '@/data/order'
import { useCartStore } from '@/store/cart'

const OrderConfirmPage: React.FC = () => {
  const [address] = useState(mockAddresses[0])
  const [remark, setRemark] = useState('')
  const getCheckedItems = useCartStore((state) => state.getCheckedItems)
  const getTotalAmount = useCartStore((state) => state.getTotalAmount)
  const items = getCheckedItems()
  const totalAmount = getTotalAmount()
  const coupon = mockCoupons[0]

  const discount = totalAmount >= coupon.minAmount ? coupon.amount : 0
  const payAmount = totalAmount - discount

  const handleSubmit = () => {
    Taro.showLoading({ title: '提交中...' })
    setTimeout(() => {
      Taro.hideLoading()
      Taro.redirectTo({ url: '/pages/pay-result/index?amount=' + payAmount + '&success=1' })
    }, 1500)
  }

  return (
    <View className={styles.confirmPage}>
      {/* 地址 */}
      <View className={styles.addressCard}>
        {address ? (
          <View className={styles.addressInfo}>
            <Text className={styles.addressName}>{address.consignee}</Text>
            <Text className={styles.addressMobile}>{address.mobile}</Text>
            <Text className={styles.addressDetail}>
              {address.province}{address.city}{address.district}{address.detailAddress}
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
        {items.length > 0 ? items.map((item) => (
          <View key={item.id} className={styles.orderItem}>
            <Image className={styles.itemImage} src={item.coverImage} mode='aspectFill' />
            <View className={styles.itemInfo}>
              <Text className={styles.itemName}>{item.productName}</Text>
              <Text className={styles.itemSku}>{item.skuDesc}</Text>
              <View className={styles.itemBottom}>
                <Text className={styles.itemPrice}>¥{item.price}</Text>
                <Text className={styles.itemQty}>x{item.quantity}</Text>
              </View>
            </View>
          </View>
        )) : (
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