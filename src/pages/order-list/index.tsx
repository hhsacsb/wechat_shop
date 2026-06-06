import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { mockOrders } from '@/data/order'
import EmptyState from '@/components/EmptyState'

const tabs = ['全部', '待付款', '待发货', '待收货', '已完成']

const orderStatusMap: Record<number, string> = {
  0: '待付款',
  1: '待发货',
  2: '待收货',
  3: '待评价',
  4: '已完成',
  5: '已取消',
}

const OrderListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.status) {
      const idx = parseInt(params.status as string) + 1
      if (idx >= 0 && idx < tabs.length) {
        setActiveTab(idx)
      }
    }
  }, [])

  const filteredOrders = activeTab === 0
    ? mockOrders
    : mockOrders.filter((o) => o.orderStatus === activeTab - 1)

  const handleOrderDetail = (orderId: number) => {
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${orderId}` })
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
        {filteredOrders.length === 0 ? (
          <EmptyState title='暂无订单' description='快去挑选心仪的商品吧' />
        ) : (
          filteredOrders.map((order) => (
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
                      <View className={styles.actionBtn}>取消订单</View>
                      <View className={`${styles.actionBtn} ${styles.primary}`}>立即支付</View>
                    </>
                  )}
                  {order.orderStatus === 2 && (
                    <View className={`${styles.actionBtn} ${styles.primary}`}>确认收货</View>
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