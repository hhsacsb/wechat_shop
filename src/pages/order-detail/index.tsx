import React, { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { mockOrders } from '@/data/order'

const orderStatusMap: Record<number, string> = {
  0: '待付款',
  1: '待发货',
  2: '待收货',
  3: '待评价',
  4: '已完成',
  5: '已取消',
}

const OrderDetailPage: React.FC = () => {
  const [order] = useState(mockOrders[0])

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.id) {
      console.log('[OrderDetail] load order id:', params.id)
    }
  }, [])

  const address = order.addressSnapshot ? JSON.parse(order.addressSnapshot as string) : null

  return (
    <View className={styles.detailPage}>
      {/* 状态头 */}
      <View className={styles.statusHeader}>
        <Text className={styles.statusTitle}>{orderStatusMap[order.orderStatus]}</Text>
        <Text className={styles.statusDesc}>
          {order.orderStatus === 1 ? '商家正在准备您的商品，请耐心等待' : ''}
          {order.orderStatus === 2 ? '商品正在配送中，请注意查收' : ''}
        </Text>
      </View>

      {/* 地址 */}
      {address && (
        <View className={styles.addressSection}>
          <Text>
            <Text className={styles.addressName}>{address.consignee}</Text>
            <Text className={styles.addressMobile}>{address.mobile}</Text>
          </Text>
          <Text className={styles.addressDetail}>
            {address.province}{address.city}{address.district}{address.detailAddress}
          </Text>
        </View>
      )}

      {/* 商品列表 */}
      <View className={styles.orderItems}>
        {order.items.map((item) => (
          <View key={item.id} className={styles.orderItem}>
            <Image className={styles.itemImage} src={item.coverImage} mode='aspectFill' />
            <View className={styles.itemInfo}>
              <Text className={styles.itemName}>{item.productName}</Text>
              <Text className={styles.itemSku}>{item.skuDesc}</Text>
            </View>
            <View style={{ textAlign: 'right' }}>
              <Text className={styles.itemPrice}>¥{item.price}</Text>
              <Text className={styles.itemQty}>x{item.quantity}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 信息汇总 */}
      <View className={styles.infoSection}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>订单编号</Text>
          <Text className={styles.infoValue}>{order.orderNo}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>下单时间</Text>
          <Text className={styles.infoValue}>{order.createdAt}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>商品金额</Text>
          <Text className={styles.infoValue}>¥{order.totalAmount}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>优惠金额</Text>
          <Text className={styles.infoValue}>-¥{order.discountAmount}</Text>
        </View>
        <View className={`${styles.infoRow} ${styles.totalRow}`}>
          <Text className={styles.infoLabel}>实付金额</Text>
          <Text className={styles.infoValue}>¥{order.payAmount}</Text>
        </View>
        {order.remark && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>备注</Text>
            <Text className={styles.infoValue}>{order.remark}</Text>
          </View>
        )}
      </View>

      {/* 底部操作 */}
      <View className={styles.bottomActions}>
        {order.orderStatus === 0 && (
          <>
            <View className={styles.actionBtn}>取消订单</View>
            <View className={`${styles.actionBtn} ${styles.primary}`}>立即支付</View>
          </>
        )}
        {order.orderStatus === 2 && (
          <View className={`${styles.actionBtn} ${styles.primary}`}>确认收货</View>
        )}
        {order.orderStatus >= 3 && (
          <>
            <View className={styles.actionBtn}>再次购买</View>
            <View className={styles.actionBtn}>申请售后</View>
          </>
        )}
      </View>
    </View>
  )
}

export default OrderDetailPage