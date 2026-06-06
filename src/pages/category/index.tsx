import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import ProductCard from '@/components/ProductCard'
import { Category, Product } from '@/types'
import { getCategoryTree, getProductList } from '@/api'

const CategoryPage: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (categories.length > 0) {
      loadProducts()
    }
  }, [activeIndex, categories])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategoryTree()

      // 转换分类格式
      if (Array.isArray(data)) {
        const allCats = data.map((c: any) => ({
          id: c.id,
          parentId: c.parent_id || 0,
          name: c.name,
          icon: c.icon || '',
          sort: c.sort || 0,
          status: c.status || 1,
        }))
        setCategories(allCats)
      }
    } catch (error) {
      console.error('加载分类失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    const parentCategories = categories.filter((c) => c.parentId === 0)
    const activeCat = parentCategories[activeIndex]

    if (!activeCat) return

    try {
      // 获取当前分类下的商品
      const data = await getProductList({
        category_id: activeCat.id,
        page_size: 4,
      })

      if (data?.list) {
        setProducts(
          data.list.map((p: any) => ({
            id: p.id,
            categoryId: p.category_id || activeCat.id,
            name: p.name || '',
            subtitle: p.subtitle || '',
            coverImage: p.cover_image || p.coverImage || '',
            content: p.content || '',
            price: p.price || 0,
            originalPrice: p.original_price || p.originalPrice || 0,
            salesCount: p.sales_count || p.salesCount || 0,
            status: p.status || 1,
            skus: [],
            images: [],
          }))
        )
      }
    } catch (error) {
      console.error('加载商品失败:', error)
    }
  }

  const parentCategories = categories.filter((c) => c.parentId === 0)
  const activeCat = parentCategories[activeIndex]
  const subCategories = categories.filter((c) => c.parentId === activeCat?.id)

  const handleSubCategoryClick = (cat: any) => {
    Taro.navigateTo({
      url: `/pages/product-list/index?categoryId=${cat.id}&name=${cat.name}`,
    })
  }

  if (loading && categories.length === 0) {
    return (
      <View className={styles.categoryPage} style={{ padding: '100px 0', textAlign: 'center' }}>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className={styles.categoryPage}>
      {/* 左侧导航 */}
      <ScrollView className={styles.leftNav} scrollY enhanced showScrollbar={false}>
        {parentCategories.map((cat, index) => (
          <View
            key={cat.id}
            className={classnames(styles.navItem, { [styles.active]: index === activeIndex })}
            onClick={() => setActiveIndex(index)}
          >
            <Text>{cat.name}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 右侧内容 */}
      <ScrollView className={styles.rightContent} scrollY enhanced showScrollbar={false}>
        {/* 子分类 */}
        {subCategories.length > 0 && (
          <>
            <Text className={styles.sectionTitle}>分类</Text>
            <View className={styles.subCategoryGrid}>
              {subCategories.map((cat) => (
                <View
                  key={cat.id}
                  className={styles.subCategoryItem}
                  onClick={() => handleSubCategoryClick(cat)}
                >
                  <Image
                    className={styles.subCategoryImage}
                    src={`https://picsum.photos/id/${(cat.id * 10) % 300}/200/200`}
                    mode='aspectFill'
                  />
                  <Text className={styles.subCategoryName}>{cat.name}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* 推荐商品 */}
        <View className={styles.recommendSection}>
          <Text className={styles.recommendTitle}>推荐商品</Text>
          <View className={styles.recommendGrid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default CategoryPage