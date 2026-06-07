import React, { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { getAvailableCoupons, getUserCoupons, claimCoupon } from '@/api'
import EmptyState from '@/components/EmptyState'

/** 优惠券类型描述 */
const getTypeLabel = (type: number) => {
  const map: Record<number, string> = { 1: '满减券', 2: '折扣券', 3: '无门槛券' }
  return map[type] || ''
}

/** 状态标签 */
const statusLabel: Record<number, { text: string; color: string }> = {
  0: { text: '未使用', color: '#07c160' },
  1: { text: '已使用', color: '#999' },
  2: { text: '已过期', color: '#999' },
}

const CouponPage: React.FC = () => {
  // 0=可领取 1=我的优惠券
  const [tab, setTab] = useState<'available' | 'mine'>('available')
  const [availableList, setAvailableList] = useState<any[]>([])
  const [myCoupons, setMyCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      if (tab === 'available') {
        const data = await getAvailableCoupons()
        setAvailableList(Array.isArray(data) ? data : [])
      } else {
        const data = await getUserCoupons()
        setMyCoupons(Array.isArray(data) ? data : [])
      }
    } catch {
      // 已由 request.ts 统一处理错误提示
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [tab])

  const handleClaim = async (couponId: number) => {
    try {
      await claimCoupon(couponId)
      Taro.showToast({ title: '领取成功', icon: 'success' })
      loadData()
    } catch {
      // 统一错误提示
    }
  }

  const renderCouponCard = (coupon: any, isMine: boolean) => (
    <View key={isMine ? coupon.id : coupon.id} className={styles.couponCard}>
      <View className={styles.couponLeft}>
        <Text className={styles.couponAmount}>
          <Text className={styles.couponUnit}>
            {coupon.type === 2 ? '' : '¥'}
          </Text>
          {coupon.type === 2 ? `${coupon.amount}折` : coupon.amount}
        </Text>
        <Text className={styles.couponType}>{getTypeLabel(coupon.type)}</Text>
      </View>
      <View className={styles.couponRight}>
        <Text className={styles.couponName}>{coupon.name}</Text>
        <Text className={styles.couponDesc}>{coupon.description}</Text>
        <Text className={styles.couponTime}>
          {coupon.start_time?.slice(0, 10)} ~ {coupon.end_time?.slice(0, 10)}
        </Text>
        {isMine && (
          <Text
            className={styles.couponStatus}
            style={{ color: statusLabel[coupon.status]?.color }}
          >
            {statusLabel[coupon.status]?.text || ''}
          </Text>
        )}
      </View>
      {!isMine && (
        <View className={styles.couponAction}>
          <Button
            className={styles.claimBtn}
            onClick={() => handleClaim(coupon.id)}
          >
            领取
          </Button>
        </View>
      )}
    </View>
  )

  return (
    <View className={styles.page}>
      {/* Tab 切换 */}
      <View className={styles.tabBar}>
        <View
          className={`${styles.tabItem} ${tab === 'available' ? styles.tabActive : ''}`}
          onClick={() => setTab('available')}
        >
          <Text>可领取</Text>
        </View>
        <View
          className={`${styles.tabItem} ${tab === 'mine' ? styles.tabActive : ''}`}
          onClick={() => setTab('mine')}
        >
          <Text>我的优惠券</Text>
        </View>
      </View>

      {loading ? (
        <EmptyState title='加载中...' description='' />
      ) : tab === 'available' ? (
        availableList.length === 0 ? (
          <EmptyState title='暂无可用优惠券' description='关注活动获取更多优惠' />
        ) : (
          availableList.map((c) => renderCouponCard(c, false))
        )
      ) : (
        myCoupons.length === 0 ? (
          <EmptyState title='暂无优惠券' description='去领券中心看看' />
        ) : (
          myCoupons.map((c) => renderCouponCard(c, true))
        )
      )}
    </View>
  )
}

export default CouponPage