import React, { useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/types'
import { searchProducts } from '@/api'

const hotSearch = ['连衣裙', '口红', '耳机', '男装夹克', '台灯', '坚果礼盒', '美白精华', '碎花裙']

const SearchPage: React.FC = () => {
  const [keyword, setKeyword] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!keyword.trim()) {
      Taro.showToast({ title: '请输入搜索关键词', icon: 'none' })
      return
    }

    try {
      setSearching(true)
      setShowResult(true)

      const data = await searchProducts(keyword, 1, 20)

      if (data?.list && Array.isArray(data.list)) {
        setProducts(
          data.list.map((p: any) => ({
            id: p.id,
            categoryId: p.category_id || 0,
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
      console.error('搜索失败:', error)
      setProducts([])
    } finally {
      setSearching(false)
    }
  }

  const handleHotTag = (tag: string) => {
    setKeyword(tag)
    // 自动触发搜索
    setTimeout(() => handleSearch(), 100)
  }

  return (
    <View className={styles.searchPage}>
      <View className={styles.searchInput}>
        <Input
          placeholder='搜索商品名称'
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
          onConfirm={handleSearch}
          confirmType='search'
        />
        <Text className={styles.searchBtn} onClick={handleSearch}>搜索</Text>
      </View>

      {showResult ? (
        <View className={styles.productList}>
          {searching ? (
            <View style={{ padding: '50px 0', textAlign: 'center' }}>
              <Text>搜索中...</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={{ padding: '50px 0', textAlign: 'center' }}>
              <Text>未找到相关商品</Text>
            </View>
          ) : (
            <View className={styles.productGrid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          )}
        </View>
      ) : (
        <>
          <Text className={styles.hotTitle}>热门搜索</Text>
          <View className={styles.hotTags}>
            {hotSearch.map((tag) => (
              <Text key={tag} className={styles.hotTag} onClick={() => handleHotTag(tag)}>
                {tag}
              </Text>
            ))}
          </View>
        </>
      )}
    </View>
  )
}

export default SearchPage