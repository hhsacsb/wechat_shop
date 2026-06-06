import React, { useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import ProductCard from '@/components/ProductCard'
import { mockCategories, mockProductList } from '@/data/product'

const CategoryPage: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const parentCategories = mockCategories.filter((c) => c.parentId === 0)
  const activeCat = parentCategories[activeIndex]

  const subCategories = mockCategories.filter((c) => c.parentId === activeCat?.id)
  const recommendProducts = mockProductList.slice(0, 4)

  const handleSubCategoryClick = (cat: any) => {
    Taro.navigateTo({
      url: `/pages/product-list/index?categoryId=${cat.id}&name=${cat.name}`,
    })
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
            {recommendProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default CategoryPage