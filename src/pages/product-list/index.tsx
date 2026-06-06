import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import ProductCard from '@/components/ProductCard'
import { mockProductList } from '@/data/product'

const filters = ['综合', '销量', '价格↑', '价格↓']

const ProductListPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState(0)
  const [products, setProducts] = useState([...mockProductList])
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.name) {
      setCategoryName(decodeURIComponent(params.name as string))
    }
  }, [])

  const handleFilter = (index: number) => {
    setActiveFilter(index)
    const sorted = [...mockProductList]
    switch (index) {
      case 1:
        sorted.sort((a, b) => b.salesCount - a.salesCount)
        break
      case 2:
        sorted.sort((a, b) => a.price - b.price)
        break
      case 3:
        sorted.sort((a, b) => b.price - a.price)
        break
      default:
        break
    }
    setProducts(sorted)
  }

  return (
    <View className={styles.productListPage}>
      <View className={styles.filterBar}>
        {filters.map((filter, index) => (
          <Text
            key={filter}
            className={classnames(styles.filterItem, { [styles.active]: index === activeFilter })}
            onClick={() => handleFilter(index)}
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