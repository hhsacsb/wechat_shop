import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { Product } from '@/types'
import styles from './index.module.scss'

interface ProductCardProps {
  product: Product
  className?: string
  mode?: 'grid' | 'list'
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className, mode = 'grid' }) => {
  const handleClick = () => {
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${product.id}` })
  }

  return (
    <View
      className={classnames(styles.productCard, className, {
        [styles.listMode]: mode === 'list',
      })}
      onClick={handleClick}
    >
      <Image
        className={styles.coverImage}
        src={product.coverImage}
        mode='aspectFill'
        lazyLoad
      />
      <View className={styles.info}>
        <Text className={styles.name}>{product.name}</Text>
        {mode === 'list' && <Text className={styles.subtitle}>{product.subtitle}</Text>}
        <View className={styles.bottomRow}>
          <View className={styles.priceArea}>
            <Text className={styles.priceSymbol}>¥</Text>
            <Text className={styles.price}>{product.price}</Text>
            {product.originalPrice > product.price && (
              <Text className={styles.originalPrice}>¥{product.originalPrice}</Text>
            )}
          </View>
          <Text className={styles.salesCount}>已售{product.salesCount}</Text>
        </View>
      </View>
    </View>
  )
}

export default ProductCard