import React from 'react'
import { View, Text, Image, Checkbox } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import EmptyState from '@/components/EmptyState'
import { useCartStore } from '@/store/cart'

const CartPage: React.FC = () => {
  const { items, fetchCart, updateQuantity, toggleCheck, toggleCheckAll, removeItem, getTotalAmount, getTotalCount } = useCartStore()

  // 使用 useDidShow 替代 useEffect：从其他页面（结算完成、详情页等）返回购物车时
  // 都能重新拉取最新数据，保证与服务端一致。
  useDidShow(() => {
    fetchCart()
  })

  const allChecked = items.length > 0 && items.every((item) => item.checked)

  const handleSettle = () => {
    const checkedItems = items.filter((item) => item.checked)
    if (checkedItems.length === 0) {
      Taro.showToast({ title: '请选择商品', icon: 'none' })
      return
    }
    Taro.navigateTo({ url: '/pages/order-confirm/index' })
  }

  if (items.length === 0) {
    return (
      <View className={styles.cartPage}>
        <EmptyState title='购物车是空的' description='快去挑选心仪的商品吧' />
      </View>
    )
  }

  return (
    <View className={styles.cartPage}>
      {items.map((item) => (
        <View key={item.id} className={styles.cartItem}>
          <Checkbox value=''
            className={styles.checkBox}
            checked={item.checked}
            onClick={() => toggleCheck(item.id)}
            color='#FF5A3C'
          />
          <Image className={styles.itemImage} src={item.coverImage} mode='aspectFill' />
          <View className={styles.itemInfo}>
            <Text className={styles.itemName}>{item.productName}</Text>
            <Text className={styles.itemSku}>{item.skuDesc}</Text>
            <View className={styles.itemBottom}>
              <Text className={styles.itemPrice}>¥{item.price}</Text>
              <View className={styles.quantityControl}>
                <View className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</View>
                <Text className={styles.qtyInput}>{item.quantity}</Text>
                <View className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</View>
              </View>
            </View>
          </View>
          <Text className={styles.deleteBtn} onClick={() => removeItem(item.id)}>删除</Text>
        </View>
      ))}

      {/* 底部结算栏 */}
      <View className={styles.bottomBar}>
        <View className={styles.checkAll}>
          <Checkbox value=''
            className={styles.checkBox}
            checked={allChecked}
            onClick={() => toggleCheckAll(!allChecked)}
            color='#FF5A3C'
          />
          <Text className={styles.checkAllText}>全选</Text>
        </View>
        <View className={styles.totalArea}>
          <Text className={styles.totalLabel}>合计：</Text>
          <Text className={styles.totalPrice}>
            <Text className={styles.totalPriceSymbol}>¥</Text>
            {getTotalAmount().toFixed(2)}
          </Text>
        </View>
        <View className={styles.settleBtn} onClick={handleSettle}>
          结算({getTotalCount()})
        </View>
      </View>
    </View>
  )
}

export default CartPage