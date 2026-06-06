import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { mockAddresses } from '@/data/order'
import EmptyState from '@/components/EmptyState'

const AddressListPage: React.FC = () => {
  const [addresses] = useState(mockAddresses)

  const handleAdd = () => {
    Taro.navigateTo({ url: '/pages/address-edit/index' })
  }

  return (
    <View className={styles.page}>
      {addresses.length === 0 ? (
        <EmptyState title='暂无收货地址' description='请添加收货地址' />
      ) : (
        addresses.map((addr) => (
          <View key={addr.id} className={styles.addressCard}>
            <Text>
              <Text className={styles.addressName}>{addr.consignee}</Text>
              <Text className={styles.addressMobile}>{addr.mobile}</Text>
              {addr.isDefault && <Text className={styles.defaultTag}>默认</Text>}
            </Text>
            <Text className={styles.addressDetail}>
              {addr.province}{addr.city}{addr.district}{addr.detailAddress}
            </Text>
            <View className={styles.addressActions}>
              <Text className={styles.actionText}>编辑</Text>
              <Text className={styles.actionText}>删除</Text>
              {!addr.isDefault && <Text className={styles.actionText}>设为默认</Text>}
            </View>
          </View>
        ))
      )}

      <View className={styles.addBtn}>
        <View className={styles.addBtnInner} onClick={handleAdd}>新增地址</View>
      </View>
    </View>
  )
}

export default AddressListPage