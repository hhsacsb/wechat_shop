import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'

const PayResultPage: React.FC = () => {
  const [success, setSuccess] = useState(true)
  const [amount, setAmount] = useState('0.00')

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.success) {
      setSuccess(params.success === '1')
    }
    if (params?.amount) {
      setAmount(params.amount as string)
    }
  }, [])

  const handleViewOrder = () => {
    Taro.redirectTo({ url: '/pages/order-list/index' })
  }

  const handleBackHome = () => {
    Taro.switchTab({ url: '/pages/home/index' })
  }

  return (
    <View>
      <View className={styles.payResultPage}>
        <View className={classnames(styles.resultIcon, { [styles.success]: success, [styles.fail]: !success })}>
          {success ? '✓' : '✗'}
        </View>
        <Text className={styles.resultTitle}>
          {success ? '支付成功' : '支付失败'}
        </Text>
        <Text className={styles.resultAmount}>¥{amount}</Text>
        <Text className={styles.resultDesc}>
          {success ? '您的订单已支付成功，请耐心等待发货' : '支付未成功，请重新尝试'}
        </Text>
        <View className={styles.actionButtons}>
          {success ? (
            <>
              <View className={styles.secondaryBtn} onClick={handleBackHome}>返回首页</View>
              <View className={styles.primaryBtn} onClick={handleViewOrder}>查看订单</View>
            </>
          ) : (
            <>
              <View className={styles.secondaryBtn} onClick={handleBackHome}>返回首页</View>
              <View className={styles.primaryBtn} onClick={handleViewOrder}>重新支付</View>
            </>
          )}
        </View>
      </View>
    </View>
  )
}

export default PayResultPage