import React, { useState, useEffect } from 'react'
import { View, Text, Image, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import ProductCard from '@/components/ProductCard'
import { Banner, Category, Product } from '@/types'
import { getHomeData, getCategoryTree } from '@/api'

const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [hotProducts, setHotProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    try {
      setLoading(true)
      // 并行请求首页数据和分类
      const [homeData, categoryData] = await Promise.all([
        getHomeData(),
        getCategoryTree(),
      ])

      // 转换轮播图格式
      if (homeData.banners) {
        setBanners(homeData.banners.map((b: any) => ({
          id: b.id,
          image: b.image,
          url: '',
          title: '',
          sort: 0,
        })))
      }

      // 转换分类格式（后端已返回顶级分类）
      if (Array.isArray(categoryData)) {
        setCategories(categoryData.map((c: any) => ({
          id: c.id,
          parentId: c.parent_id || 0,
          name: c.name,
          icon: c.icon || '',
          sort: c.sort || 0,
          status: c.status || 1,
        })))
      }

      // 转换热门商品
      if (homeData.hot_products) {
        setHotProducts(homeData.hot_products.map((p: any) => ({
          id: p.id,
          categoryId: 0,
          name: p.name,
          subtitle: '',
          coverImage: p.cover_image || p.coverImage,
          content: '',
          price: p.price,
          originalPrice: 0,
          salesCount: 0,
          status: 1,
          skus: [],
          images: [],
        })))
      }

      // 转换新品
      if (homeData.new_products) {
        setNewProducts(homeData.new_products.map((p: any) => ({
          id: p.id,
          categoryId: 0,
          name: p.name,
          subtitle: '',
          coverImage: p.cover_image || p.coverImage,
          content: '',
          price: p.price,
          originalPrice: 0,
          salesCount: 0,
          status: 1,
          skus: [],
          images: [],
        })))
      }
    } catch (error) {
      console.error('加载首页数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index' })
  }

  const handleCategoryClick = (cat: Category) => {
    Taro.navigateTo({ url: `/pages/product-list/index?categoryId=${cat.id}&name=${cat.name}` })
  }

  if (loading) {
    return (
      <View className={styles.homePage}>
        <View style={{ padding: '100px 0', textAlign: 'center' }}>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.homePage}>
      <ScrollView scrollY className={styles.scrollContent} enhanced showScrollbar={false}>
        {/* 搜索框（放在 banner 上面） */}
        <View
          className={styles.searchBar}
          hoverClass={styles.searchBarHover}
          onClick={(e) => {
            // 阻止事件冒泡到 ScrollView，避免被滚动判断吞掉点击
            e.stopPropagation()
            handleSearch()
          }}
        >
          <Text className={styles.searchPlaceholder}>搜索商品</Text>
        </View>

        {/* 轮播图 */}
        <View className={styles.swiperSection}>
          <Swiper className={styles.swiper} autoplay interval={3000} circular indicatorDots indicatorColor='rgba(255,255,255,0.6)' indicatorActiveColor='#FF5A3C'>
            {banners.map((banner) => (
              <SwiperItem key={banner.id}>
                <Image className={styles.bannerImage} src={banner.image} mode='aspectFill' />
              </SwiperItem>
            ))}
          </Swiper>
        </View>

        {/* 分类导航 */}
        <View className={styles.categoryNav}>
          {categories.map((cat) => (
            <View key={cat.id} className={styles.categoryItem} onClick={() => handleCategoryClick(cat)}>
              <Image className={styles.categoryIcon} src={cat.icon} mode='aspectFill' />
              <Text className={styles.categoryName}>{cat.name}</Text>
            </View>
          ))}
        </View>

        {/* 热门推荐 */}
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>热门推荐</Text>
          <Text className={styles.sectionMore}>查看更多</Text>
        </View>
        <View className={styles.productGrid}>
          {hotProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>

        {/* 新品推荐 */}
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>新品上市</Text>
          <Text className={styles.sectionMore}>查看更多</Text>
        </View>
        <ScrollView className={styles.newProducts} scrollX enhanced showScrollbar={false}>
          {newProducts.map((product) => (
            <View key={product.id} className={styles.newProductItem}>
              <ProductCard product={product} />
            </View>
          ))}
        </ScrollView>

        <View className={styles.safeBottom} />
      </ScrollView>
    </View>
  )
}

export default HomePage