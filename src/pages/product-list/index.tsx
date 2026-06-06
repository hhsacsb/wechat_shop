import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/types'
import { getProductList } from '@/api'

const filters = ['综合', '销量', '价格↑', '价格↓']

const ProductListPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(true)
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.name) {
      setCategoryName(decodeURIComponent(params.name as string))
    }
    if (params?.categoryId) {
      setCategoryId(Number(params.categoryId))
    }
    loadProducts()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [activeFilter])

  const loadProducts = async () => {
    try {
      setLoading(true)

      // 构建查询参数
      const params: any = { page: 1, page_size: 50 }
      if (categoryId) {
        params.category_id = categoryId
      }

      // 排序参数
      switch (activeFilter) {
        case 1:
          params.sort = 'sales'
          break
        case 2:
          params.sort = 'price_asc'
          break
        case 3:
          params.sort = 'price_desc'
          break
        default:
          break
      }

      const data = await getProductList(params)

      if (data?.list && Array.isArray(data.list)) {
        setProducts(
          data.list.map((p: any) => ({
            id: p.id,
            categoryId: p.category_id || categoryId || 0,
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
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('加载商品列表失败:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className={styles.productListPage} style={{ padding: '100px 0', textAlign: 'center' }}>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className={styles.productListPage}>
      <View className={styles.filterBar}>
        {filters.map((filter, index) => (
          <Text
            key={filter}
            className={classnames(styles.filterItem, { [styles.active]: index === activeFilter })}
            onClick={() => setActiveFilter(index)}
          >
            {filter}
          </Text>
        ))}
      </View>
      <View className={styles.productGrid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
    </View>
  )
}

export default ProductListPage