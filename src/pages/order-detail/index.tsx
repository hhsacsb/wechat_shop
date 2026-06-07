import React, { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { getOrderDetail, cancelOrder, payOrder, confirmReceipt } from '@/api'

const orderStatusMap: Record<number, string> = {
  0: '待付款',
  1: '待发货',
  2: '待收货',
  3: '待评价',
  4: '已完成',
  5: '已取消',
}

interface OrderDetail {
  id: number
  orderNo: string
  orderStatus: number
  totalAmount: number
  payAmount: number
  discountAmount: number
  addressSnapshot: string
  remark: string
  createdAt: string
  items: Array<{
    id: number
    productName: string
    skuDesc: string
    price: number
    quantity: number
    coverImage: string
  }>
}

const OrderDetailPage: React.FC = () => {
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.id) {
      loadOrderDetail(Number(params.id))
    }
  }, [])

  const loadOrderDetail = async (orderId: number) => {
    try {
      setLoading(true)
      const data = await getOrderDetail(orderId)

      setOrder({
        id: data.id || orderId,
        orderNo: data.order_no || '',
        orderStatus: data.order_status ?? 0,
        totalAmount: data.total_amount || 0,
        payAmount: data.pay_amount || 0,
        discountAmount: data.discount_amount || 0,
        addressSnapshot: data.address_snapshot || data.addressSnapshot || '',
        remark: data.remark || '',
        createdAt: data.created_at || data.createdAt || '',
        items: (data.items || []).map((item: any) => ({
          id: item.id,
          productName: item.product_name || '',
          skuDesc: item.sku_desc || '',
          price: item.price || 0,
          quantity: item.quantity || 1,
          coverImage: item.cover_image || '',
        })),
      })
    } catch (error) {
      console.error('加载订单详情失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !order) {
    return (
      <View className={styles.detailPage} style={{ padding: '100px 0', textAlign: 'center' }}>
        <Text>加载中...</Text>
      </View>
    )
  }

  const address = order.addressSnapshot as Record<string, any> | null

  const handleCancel = async () => {
    try {
      await cancelOrder(order.id)
      Taro.showToast({ title: '取消成功', icon: 'success' })
      loadOrderDetail(order.id)
    } catch (error) {
      Taro.showToast({ title: '取消失败', icon: 'none' })
    }
  }

  const handlePay = async () => {
    try {
      await payOrder(order.id)
      Taro.redirectTo({ url: `/pages/pay-result/index?amount=${order.payAmount}&success=1&orderId=${order.id}` })
    } catch (error) {
      Taro.showToast({ title: '支付失败', icon: 'none' })
    }
  }

  const handleConfirm = async () => {
    try {
      await confirmReceipt(order.id)
      Taro.showToast({ title: '确认收货成功', icon: 'success' })
      loadOrderDetail(order.id)
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

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
            <View className={styles.actionBtn} onClick={handleCancel}>取消订单</View>
            <View className={`${styles.actionBtn} ${styles.primary}`} onClick={handlePay}>立即支付</View>
          </>
        )}
        {order.orderStatus === 2 && (
          <View className={`${styles.actionBtn} ${styles.primary}`} onClick={handleConfirm}>确认收货</View>
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