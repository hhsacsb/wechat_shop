import React, { useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'

const AddressEditPage: React.FC = () => {
  const [consignee, setConsignee] = useState('')
  const [mobile, setMobile] = useState('')
  const [detail, setDetail] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  const handleSave = () => {
    if (!consignee || !mobile || !detail) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    Taro.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 1500)
  }

  return (
    <View className={styles.page}>
      <View className={styles.formCard}>
        <View className={styles.formItem}>
          <Text className={styles.label}>收货人</Text>
          <Input
            className={styles.input}
            placeholder='请输入收货人姓名'
            value={consignee}
            onInput={(e) => setConsignee(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.label}>手机号</Text>
          <Input
            className={styles.input}
            placeholder='请输入手机号'
            type='number'
            maxlength={11}
            value={mobile}
            onInput={(e) => setMobile(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.label}>所在地区</Text>
          <Input className={`${styles.input} ${styles.placeholder}`} placeholder='请选择省市区' disabled />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.label}>详细地址</Text>
          <Input
            className={styles.input}
            placeholder='街道、门牌号等'
            value={detail}
            onInput={(e) => setDetail(e.detail.value)}
          />
        </View>
        <View className={styles.switchRow}>
          <Text className={styles.switchLabel}>设为默认地址</Text>
          <View className={classnames(styles.switch, { [styles.on]: isDefault })} onClick={() => setIsDefault(!isDefault)}>
            <View className={styles.switchKnob} />
          </View>
        </View>
      </View>
      <View className={styles.saveBtn} onClick={handleSave}>保存</View>
    </View>
  )
}

export default AddressEditPage