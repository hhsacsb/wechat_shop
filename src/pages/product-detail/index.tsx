import React, { useState, useEffect } from 'react'
import { View, Text, Image, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { mockProductDetail } from '@/data/product'
import { useCartStore } from '@/store/cart'
import { Sku, CartItem } from '@/types'

const ProductDetailPage: React.FC = () => {
  const [product] = useState(mockProductDetail)
  const [selectedSku, setSelectedSku] = useState<Sku | null>(null)
  const [quantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    if (product.skus.length > 0) {
      setSelectedSku(product.skus[0])
    }
  }, [product])

  const handleAddCart = () => {
    if (!selectedSku) return
    const cartItem: CartItem = {
      id: Date.now(),
      userId: 1,
      productId: product.id,
      skuId: selectedSku.id,
      quantity,
      checked: true,
      productName: product.name,
      skuDesc: selectedSku.specValue,
      price: selectedSku.price,
      coverImage: product.coverImage,
      stock: selectedSku.stock,
    }
    addItem(cartItem)
    Taro.showToast({ title: '已加入购物车', icon: 'success' })
  }

  const handleBuyNow = () => {
    Taro.navigateTo({ url: '/pages/order-confirm/index' })
  }

  return (
    <View className={styles.detailPage}>
      <ScrollView scrollY>
        {/* 商品图片 */}
        <Swiper className={styles.imageSwiper} autoplay indicatorDots indicatorColor='rgba(255,255,255,0.6)' indicatorActiveColor='#FF5A3C'>
          {product.images.map((img, index) => (
            <SwiperItem key={index}>
              <Image className={styles.swiperImage} src={img} mode='aspectFill' />
            </SwiperItem>
          ))}
        </Swiper>

        {/* 价格和名称 */}
        <View className={styles.infoSection}>
          <View className={styles.priceRow}>
            <Text className={styles.currentPrice}>¥{selectedSku?.price || product.price}</Text>
            <Text className={styles.originalPrice}>¥{product.originalPrice}</Text>
            <Text className={styles.salesInfo}>已售 {product.salesCount}</Text>
          </View>
          <Text className={styles.productName}>{product.name}</Text>
          <Text className={styles.subtitle}>{product.subtitle}</Text>
        </View>

        {/* SKU 选择 */}
        <View className={styles.skuSection}>
          <Text className={styles.skuTitle}>选择规格</Text>
          <View className={styles.skuOptions}>
            {product.skus.map((sku) => (
              <Text
                key={sku.id}
                className={classnames(styles.skuOption, { [styles.selected]: selectedSku?.id === sku.id })}
                onClick={() => setSelectedSku(sku)}
              >
                {sku.specValue}
              </Text>
            ))}
          </View>
        </View>

        {/* 商品详情 */}
        <View className={styles.contentSection}>
          <Text className={styles.contentTitle}>商品详情</Text>
          <Text className={styles.contentText}>{product.content}</Text>
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <View className={styles.cartBtn} onClick={handleAddCart}>加入购物车</View>
        <View className={styles.buyBtn} onClick={handleBuyNow}>立即购买</View>
      </View>
    </View>
  )
}

export default ProductDetailPage