import React, { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import styles from './index.module.scss'
import EmptyState from '@/components/EmptyState'
import { AfterSale } from '@/types'

const mockAfterSales: AfterSale[] = [
  { id: 1, orderId: 1, orderNo: 'ORD20250101001', productName: '春季新款连衣裙', skuDesc: '白色/M', amount: 299, reason: '商品质量问题', status: 1, createdAt: '2025-01-05 10:00:00' },
  { id: 2, orderId: 2, orderNo: 'ORD20250102002', productName: '蓝牙无线降噪耳机', skuDesc: '星空黑', amount: 699, reason: '不想要了', status: 2, createdAt: '2025-01-06 14:00:00' },
]

const statusMap: Record<number, string> = {
  0: '待审核',
  1: '审核中',
  2: '已完成',
  3: '已拒绝',
}

const AfterSaleListPage: React.FC = () => {
  const [list] = useState(mockAfterSales)

  return (
    <View className={styles.page}>
      {list.length === 0 ? (
        <EmptyState title='暂无售后记录' description='您还没有申请过售后' />
      ) : (
        list.map((item) => (
          <View key={item.id} className={styles.card}>
            <View className={styles.cardHeader}>
              <Text className={styles.orderNo}>{item.orderNo}</Text>
              <Text className={styles.status}>{statusMap[item.status] || '未知'}</Text>
            </View>
            <View className={styles.productInfo}>
              <Image className={styles.image} src='https://picsum.photos/id/103/300/300' mode='aspectFill' />
              <View className={styles.info}>
                <Text className={styles.name}>{item.productName}</Text>
                <Text className={styles.sku}>{item.skuDesc}</Text>
              </View>
            </View>
            <Text className={styles.reason}>原因：{item.reason}</Text>
            <Text className={styles.amount}>退款金额：¥{item.amount}</Text>
          </View>
        ))
      )}
    </View>
  )
}

export default AfterSaleListPage