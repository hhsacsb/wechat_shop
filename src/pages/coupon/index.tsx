import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import { mockCoupons } from '@/data/order'
import EmptyState from '@/components/EmptyState'

const CouponPage: React.FC = () => {
  const [coupons] = useState(mockCoupons)

  return (
    <View className={styles.page}>
      {coupons.length === 0 ? (
        <EmptyState title='暂无优惠券' description='关注活动获取优惠券' />
      ) : (
        coupons.map((coupon) => (
          <View key={coupon.id} className={styles.couponCard}>
            <View className={styles.couponLeft}>
              <Text className={styles.couponAmount}>
                <Text className={styles.couponUnit}>¥</Text>
                {coupon.amount}
              </Text>
            </View>
            <View className={styles.couponRight}>
              <Text className={styles.couponName}>{coupon.name}</Text>
              <Text className={styles.couponDesc}>{coupon.description}</Text>
              <Text className={styles.couponTime}>
                {coupon.startTime} ~ {coupon.endTime}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  )
}

export default CouponPage