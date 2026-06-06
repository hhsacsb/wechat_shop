import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import EmptyState from '@/components/EmptyState'
import { getOrderList, cancelOrder, payOrder, confirmReceipt } from '@/api'

const tabs = ['全部', '待付款', '待发货', '待收货', '已完成']

const orderStatusMap: Record<number, string> = {
  0: '待付款',
  1: '待发货',
  2: '待收货',
  3: '待评价',
  4: '已完成',
  5: '已取消',
}

interface OrderItem {
  id: number
  orderNo: string
  orderStatus: number
  totalAmount: number
  payAmount: number
  items: Array<{
    id: number
    productName: string
    skuDesc: string
    price: number
    quantity: number
    coverImage: string
  }>
}

const OrderListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.status) {
      const idx = parseInt(params.status as string) + 1
      if (idx >= 0 && idx < tabs.length) {
        setActiveTab(idx)
      }
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [activeTab])

  const loadOrders = async () => {
    try {
      setLoading(true)
      // activeTab=0 表示全部，其他对应 status (1-4)
      const params: any = { page: 1, page_size: 50 }
      if (activeTab > 0) {
        params.status = activeTab - 1
      }

      const data = await getOrderList(params)

      if (data?.list && Array.isArray(data.list)) {
        setOrders(
          data.list.map((o: any) => ({
            id: o.id,
            orderNo: o.order_no || '',
            orderStatus: o.order_status ?? o.orderStatus,
            totalAmount: o.total_amount || o.totalAmount || 0,
            payAmount: o.pay_amount || o.payAmount || 0,
            items: (o.items || []).map((item: any) => ({
              id: item.id,
              productName: item.product_name || item.productName || '',
              skuDesc: item.sku_desc || item.skuDesc || '',
              price: item.price || 0,
              quantity: item.quantity || 1,
              coverImage: item.cover_image || item.coverImage || '',
            })),
          }))
        )
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('加载订单列表失败:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleOrderDetail = (orderId: number) => {
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${orderId}` })
  }

  const handleCancelOrder = async (order: OrderItem) => {
    try {
      await cancelOrder(order.id)
      Taro.showToast({ title: '取消成功', icon: 'success' })
      loadOrders()
    } catch (error) {
      console.error('取消订单失败:', error)
      Taro.showToast({ title: '取消失败', icon: 'none' })
    }
  }

  const handlePayOrder = async (order: OrderItem) => {
    try {
      await payOrder(order.id)
      Taro.redirectTo({ url: `/pages/pay-result/index?amount=${order.payAmount}&success=1&orderId=${order.id}` })
    } catch (error) {
      console.error('支付失败:', error)
      Taro.showToast({ title: '支付失败', icon: 'none' })
    }
  }

  const handleConfirmReceipt = async (order: OrderItem) => {
    try {
      await confirmReceipt(order.id)
      Taro.showToast({ title: '确认收货成功', icon: 'success' })
      loadOrders()
    } catch (error) {
      console.error('确认收货失败:', error)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  if (loading) {
    return (
      <View className={styles.orderListPage} style={{ padding: '100px 0', textAlign: 'center' }}>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className={styles.orderListPage}>
      <View className={styles.tabBar}>
        {tabs.map((tab, index) => (
          <Text
            key={tab}
            className={classnames(styles.tabItem, { [styles.active]: index === activeTab })}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </Text>
        ))}
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 88rpx)' }}>
        {orders.length === 0 ? (
          <EmptyState title='暂无订单' description='快去挑选心仪的商品吧' />
        ) : (
          orders.map((order) => (
            <View key={order.id} className={styles.orderCard} onClick={() => handleOrderDetail(order.id)}>
              <View className={styles.orderHeader}>
                <Text className={styles.orderNo}>{order.orderNo}</Text>
                <Text className={styles.orderStatus}>
                  {orderStatusMap[order.orderStatus] || '未知'}
                </Text>
              </View>
              <View className={styles.orderBody}>
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
              <View className={styles.orderFooter}>
                <Text className={styles.orderTotal}>
                  合计：<Text className={styles.totalPrice}>¥{order.payAmount}</Text>
                </Text>
                <View className={styles.orderActions}>
                  {order.orderStatus === 0 && (
                    <>
                      <View className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); handleCancelOrder(order) }}>取消订单</View>
                      <View className={`${styles.actionBtn} ${styles.primary}`} onClick={(e) => { e.stopPropagation(); handlePayOrder(order) }}>立即支付</View>
                    </>
                  )}
                  {order.orderStatus === 2 && (
                    <View className={`${styles.actionBtn} ${styles.primary}`} onClick={(e) => { e.stopPropagation(); handleConfirmReceipt(order) }}>确认收货</View>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

export default OrderListPage