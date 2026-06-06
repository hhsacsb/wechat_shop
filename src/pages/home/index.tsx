import React, { useState } from 'react'
import { View, Text, Image, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import ProductCard from '@/components/ProductCard'
import { Banner, Category, Product } from '@/types'
import { mockBanners, mockHomeCategories, mockHotProducts, mockNewProducts } from '@/data/home'

const HomePage: React.FC = () => {
  const [banners] = useState<Banner[]>(mockBanners)
  const [categories] = useState<Category[]>(mockHomeCategories)
  const [hotProducts] = useState<Product[]>(mockHotProducts)
  const [newProducts] = useState<Product[]>(mockNewProducts)

  const handleSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index' })
  }

  const handleCategoryClick = (cat: Category) => {
    Taro.navigateTo({ url: `/pages/product-list/index?categoryId=${cat.id}&name=${cat.name}` })
  }

  return (
    <View className={styles.homePage}>
      {/* 顶部搜索栏 */}
      <View className={styles.header}>
        <View className={styles.searchBar} onClick={handleSearch}>
          <Text className={styles.searchPlaceholder}>搜索商品</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.scrollContent} enhanced showScrollbar={false}>
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