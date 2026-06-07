import React, { useState, useEffect } from 'react'
import { View, Text, Image, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { getProductDetail, addToCart } from '@/api'
import { useCartStore } from '@/store/cart'
import { Product, Sku, CartItem } from '@/types'

const ProductDetailPage: React.FC = () => {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedSku, setSelectedSku] = useState<Sku | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)
  const fetchCart = useCartStore((state) => state.fetchCart)

  useEffect(() => {
    if (router.params?.id) {
      loadProductDetail(Number(router.params.id))
    }
  }, [])

  useEffect(() => {
    if (product?.skus && product.skus.length > 0) {
      setSelectedSku(product.skus[0])
    }
  }, [product])

  const loadProductDetail = async (id: number) => {
    try {
      setLoading(true)
      const data = await getProductDetail(id)

      // 转换 API 响应为前端格式
      setProduct({
        id: data.id,
        categoryId: data.category_id || 0,
        name: data.name || '',
        subtitle: data.subtitle || '',
        coverImage: data.cover_image || data.coverImage || '',
        content: data.content || '',
        price: data.price || 0,
        originalPrice: data.original_price || data.originalPrice || 0,
        salesCount: data.sales_count || data.salesCount || 0,
        status: data.status || 1,
        skus: (data.skus || []).map((s: any) => ({
          id: s.id,
          productId: s.product_id || id,
          skuCode: s.sku_code || '',
          specValue: s.spec_value || s.specValue || '',
          price: s.price || 0,
          stock: s.stock || 0,
          image: s.image || '',
        })),
        images: (data.images || []).map((img: any) =>
          typeof img === 'string' ? img : img.url || img.image || ''
        ),
      })
    } catch (error) {
      console.error('加载商品详情失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 加入购物车
  const handleAddCart = async () => {
    if (!product || !selectedSku || added) return

    try {
      // 调用后端 API 加入购物车
      await addToCart({
        product_id: product.id,
        sku_id: selectedSku.id,
        quantity,
      })

      // 乐观更新本地 store：让 cart 页面（或 tabbar 角标）能立即看到新加的商品，
      // 即便后端 list 接口暂时读不到也不影响体验。
      // 使用 Date.now() 作临时 id，fetchCart 拉回服务端真实 id 后会自然覆盖。
      addItem({
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
      })

      // 静默与服务器对账：失败也不影响用户已看到的本地结果
      fetchCart().catch((e) => {
        console.warn('[ProductDetail] 加入购物车后静默拉取失败:', e)
      })

      setAdded(true)
      Taro.showToast({ title: '已加入购物车', icon: 'success' })
    } catch (error) {
      console.error('加入购物车失败:', error)
      // 如果 API 失败，降级为本地状态（开发阶段）
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
      setAdded(true)
      Taro.showToast({ title: '已加入购物车(本地)', icon: 'success' })
    }
  }

  // 立即购买
  const handleBuyNow = () => {
    if (!product || !selectedSku) return
    const params = encodeURIComponent(JSON.stringify({
      productId: product.id,
      productName: product.name,
      coverImage: product.coverImage,
      skuId: selectedSku.id,
      skuDesc: selectedSku.specValue,
      price: selectedSku.price,
      quantity,
    }))
    Taro.navigateTo({ url: `/pages/order-confirm/index?buyNow=${params}` })
  }

  if (loading || !product) {
    return (
      <View className={styles.detailPage} style={{ padding: '100px 0', textAlign: 'center' }}>
        <Text>加载中...</Text>
      </View>
    )
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
        <View
          className={`${styles.cartBtn} ${added ? styles.cartBtnDisabled : ''}`}
          onClick={handleAddCart}
        >
          {added ? '已加入' : '加入购物车'}
        </View>
        <View className={styles.buyBtn} onClick={handleBuyNow}>立即购买</View>
      </View>
    </View>
  )
}

export default ProductDetailPage