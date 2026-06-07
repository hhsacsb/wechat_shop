import React, { useState, useEffect } from 'react'
import { View, Text, Input, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { createAddress, updateAddress, getAddressDetail } from '@/api'

const AddressEditPage: React.FC = () => {
  const router = useRouter()
  const [consignee, setConsignee] = useState('')
  const [mobile, setMobile] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [detail, setDetail] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [saving, setSaving] = useState(false)

  const [loading, setLoading] = useState(false)

  // 地区选择器值，格式 [省, 市, 区]
  const regionValue = province ? [province, city, district] : []

  const handleRegionChange = (e: any) => {
    const [selProvince, selCity, selDistrict] = e.detail.value
    setProvince(selProvince)
    setCity(selCity)
    setDistrict(selDistrict)
  }

  useEffect(() => {
    // 如果有 id 参数，表示编辑模式，需要加载地址详情
    if (router.params?.id) {
      const id = Number(router.params.id)
      if (!id) return

      setLoading(true)
      getAddressDetail(id)
        .then((addr: any) => {
          if (!addr) return
          setConsignee(addr.consignee || '')
          setMobile(addr.mobile || '')
          setProvince(addr.province || '')
          setCity(addr.city || '')
          setDistrict(addr.district || '')
          setDetail(addr.detail_address || addr.detailAddress || '')
          setIsDefault(!!(addr.is_default || addr.isDefault))
        })
        .catch((error) => {
          console.error('加载地址详情失败:', error)
          Taro.showToast({ title: '加载地址失败', icon: 'none' })
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [])

  const handleSave = async () => {
    if (!consignee || !mobile) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    if (!province) {
      Taro.showToast({ title: '请选择所在地区', icon: 'none' })
      return
    }

    if (!detail) {
      Taro.showToast({ title: '请填写详细地址', icon: 'none' })
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
        province,
        city,
        district,
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
          <Picker mode='region' value={regionValue} onChange={handleRegionChange}>
            <View className={`${styles.input} ${!province ? styles.placeholder : ''}`}>
              {province ? `${province} ${city} ${district}` : '请选择省市区'}
            </View>
          </Picker>
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