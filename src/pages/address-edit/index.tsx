import React, { useState, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { createAddress, updateAddress } from '@/api'

const AddressEditPage: React.FC = () => {
  const router = useRouter()
  const [consignee, setConsignee] = useState('')
  const [mobile, setMobile] = useState('')
  const [detail, setDetail] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // 如果有 id 参数，表示编辑模式，需要加载地址详情
    if (router.params?.id) {
      // TODO: 从 API 加载地址详情
      console.log('Edit address id:', router.params.id)
    }
  }, [])

  const handleSave = async () => {
    if (!consignee || !mobile || !detail) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    if (!/^1\d{10}$/.test(mobile)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }

    if (saving) return

    try {
      setSaving(true)
      Taro.showLoading({ title: '保存中...' })

      const addressData = {
        consignee,
        mobile,
        province: '', // TODO: 需要地区选择器
        city: '',
        district: '',
        detail_address: detail,
        is_default: isDefault ? 1 : 0,
      }

      if (router.params?.id) {
        // 编辑模式
        await updateAddress({
          id: Number(router.params.id),
          ...addressData,
        })
      } else {
        // 新增模式
        await createAddress(addressData)
      }

      Taro.hideLoading()
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch (error) {
      console.error('保存地址失败:', error)
      Taro.hideLoading()
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setSaving(false)
    }
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