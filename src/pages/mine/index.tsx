import React, { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

const MinePage: React.FC = () => {
  // 用户信息（后续可从 API 或登录状态获取）
  const [user] = useState({
    id: 1,
    nickname: '微信用户',
    avatar: 'https://picsum.photos/id/64/200/200',
    mobile: '138****8888',
  })

  const handleNav = (url: string) => {
    Taro.navigateTo({ url })
  }

  const orderActions = [
    { icon: '📋', label: '全部订单', url: '/pages/order-list/index' },
    { icon: '💰', label: '待付款', url: '/pages/order-list/index?status=0' },
    { icon: '📦', label: '待发货', url: '/pages/order-list/index?status=1' },
    { icon: '🚚', label: '待收货', url: '/pages/order-list/index?status=2' },
    { icon: '⭐', label: '待评价', url: '/pages/order-list/index?status=3' },
  ]

  const menuItems = [
    { icon: '📍', label: '收货地址', url: '/pages/address-list/index' },
    { icon: '🎫', label: '我的优惠券', url: '/pages/coupon/index' },
    { icon: '🛡️', label: '售后记录', url: '/pages/after-sale-list/index' },
    { icon: '💬', label: '联系客服', url: '' },
    { icon: '⚙️', label: '设置', url: '' },
  ]

  return (
    <View className={styles.minePage}>
      {/* 用户头部 */}
      <View className={styles.userHeader}>
        <View className={styles.userInfo}>
          <Image className={styles.avatar} src={user.avatar} mode='aspectFill' />
          <View className={styles.userMeta}>
            <Text className={styles.nickname}>{user.nickname}</Text>
            <Text className={styles.mobile}>{user.mobile}</Text>
          </View>
        </View>
      </View>

      {/* 订单入口 */}
      <View className={styles.orderCard}>
        <View className={styles.orderHeader} onClick={() => handleNav('/pages/order-list/index')}>
          <Text className={styles.orderTitle}>我的订单</Text>
          <Text className={styles.orderAll}>查看全部</Text>
        </View>
        <View className={styles.orderActions}>
          {orderActions.map((action, index) => (
            <View key={index} className={styles.orderAction} onClick={() => handleNav(action.url)}>
              <Text className={styles.actionIcon}>{action.icon}</Text>
              <Text className={styles.actionLabel}>{action.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 功能菜单 */}
      <View className={styles.menuList}>
        {menuItems.map((item, index) => (
          <View key={index} className={styles.menuItem} onClick={() => item.url && handleNav(item.url)}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>{item.icon}</Text>
              <Text className={styles.menuLabel}>{item.label}</Text>
            </View>
            <Text className={styles.menuArrow}>&gt;</Text>
          </View>
        ))}
      </View>

      <View className={styles.safeBottom} />
    </View>
  )
}

export default MinePage