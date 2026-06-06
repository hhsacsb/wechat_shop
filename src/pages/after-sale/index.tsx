import React, { useState } from 'react'
import { View, Text, Image, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'

const reasons = ['商品质量问题', '商品与描述不符', '尺码不合适', '发错商品', '不想要了', '其他']

const AfterSalePage: React.FC = () => {
  const [selectedReason, setSelectedReason] = useState('')
  const [remark, setRemark] = useState('')

  const handleSubmit = () => {
    if (!selectedReason) {
      Taro.showToast({ title: '请选择售后原因', icon: 'none' })
      return
    }
    Taro.showLoading({ title: '提交中...' })
    setTimeout(() => {
      Taro.hideLoading()
      Taro.showToast({ title: '申请已提交', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    }, 1000)
  }

  return (
    <View className={styles.page}>
      {/* 商品信息 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>商品信息</Text>
        <View className={styles.productInfo}>
          <Image
            className={styles.productImage}
            src='https://picsum.photos/id/103/300/300'
            mode='aspectFill'
          />
          <View className={styles.productMeta}>
            <Text className={styles.productName}>春季新款连衣裙</Text>
            <Text className={styles.productSku}>白色/M</Text>
          </View>
        </View>
      </View>

      {/* 售后原因 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>售后原因</Text>
        <View className={styles.reasonList}>
          {reasons.map((reason) => (
            <View
              key={reason}
              className={styles.reasonItem}
              onClick={() => setSelectedReason(reason)}
            >
              <Text className={styles.reasonText}>{reason}</Text>
              <View
                className={classnames(styles.radio, { [styles.selected]: selectedReason === reason })}
              >
                {selectedReason === reason && <View className={styles.radioDot} />}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 说明 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>问题说明（选填）</Text>
        <Textarea
          className={styles.textarea}
          placeholder='请详细描述您的问题'
          value={remark}
          onInput={(e) => setRemark(e.detail.value)}
        />
      </View>

      <View className={styles.submitBtn} onClick={handleSubmit}>提交申请</View>
    </View>
  )
}

export default AfterSalePage