import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import EmptyState from '@/components/EmptyState'
import { getAddressList, deleteAddress } from '@/api'

const AddressListPage: React.FC = () => {
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 判断是否为选择模式
  const isSelectMode = Taro.getCurrentInstance().router?.params?.select === '1'

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      setLoading(true)
      const data = await getAddressList()

      if (Array.isArray(data)) {
        setAddresses(data)
      } else {
        setAddresses([])
      }
    } catch (error) {
      console.error('加载地址失败:', error)
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    Taro.navigateTo({ url: '/pages/address-edit/index' })
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAddress(id)
      Taro.showToast({ title: '删除成功', icon: 'success' })
      loadAddresses()
    } catch (error) {
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  // 选择模式：点击地址卡片 -> 存储选中地址并返回
  const handleSelectAddress = (addr: any) => {
    Taro.setStorageSync('selectedAddress', addr)
    Taro.navigateBack()
  }

  if (loading) {
    return (
      <View className={styles.page} style={{ padding: '100px 0', textAlign: 'center' }}>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      {addresses.length === 0 ? (
        <EmptyState title='暂无收货地址' description='请添加收货地址' />
      ) : (
        addresses.map((addr) => (
          <View
            key={addr.id}
            className={styles.addressCard}
            onClick={isSelectMode ? () => handleSelectAddress(addr) : undefined}
          >
            <Text>
              <Text className={styles.addressName}>{addr.consignee}</Text>
              <Text className={styles.addressMobile}>{addr.mobile}</Text>
              {(addr.is_default || addr.isDefault) && <Text className={styles.defaultTag}>默认</Text>}
            </Text>
            <Text className={styles.addressDetail}>
              {addr.province}{addr.city}{addr.district}{addr.detail_address || addr.detailAddress}
            </Text>
            {!isSelectMode && (
              <View className={styles.addressActions}>
                <Text className={styles.actionText} onClick={() => Taro.navigateTo({ url: `/pages/address-edit/index?id=${addr.id}` })}>编辑</Text>
                <Text className={styles.actionText} onClick={() => handleDelete(addr.id)}>删除</Text>
                {!(addr.is_default || addr.isDefault) && <Text className={styles.actionText}>设为默认</Text>}
              </View>
            )}
          </View>
        ))
      )}

      {!isSelectMode && (
        <View className={styles.addBtn}>
          <View className={styles.addBtnInner} onClick={handleAdd}>新增地址</View>
        </View>
      )}
    </View>
  )
}

export default AddressListPage