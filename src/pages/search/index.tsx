import React, { useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import ProductCard from '@/components/ProductCard'
import { mockProductList } from '@/data/product'

const hotSearch = ['连衣裙', '口红', '耳机', '男装夹克', '台灯', '坚果礼盒', '美白精华', '碎花裙']

const SearchPage: React.FC = () => {
  const [keyword, setKeyword] = useState('')
  const [showResult, setShowResult] = useState(false)

  const handleSearch = () => {
    if (!keyword.trim()) {
      Taro.showToast({ title: '请输入搜索关键词', icon: 'none' })
      return
    }
    setShowResult(true)
  }

  const handleHotTag = (tag: string) => {
    setKeyword(tag)
    setShowResult(true)
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
          <View className={styles.productGrid}>
            {mockProductList.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
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