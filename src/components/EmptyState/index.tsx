import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import styles from './index.module.scss'

interface EmptyStateProps {
  image?: string
  title?: string
  description?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  image = 'https://picsum.photos/id/64/300/300',
  title = '暂无内容',
  description = '这里还没有任何内容',
}) => {
  return (
    <View className={styles.emptyState}>
      <Image className={styles.image} src={image} mode='aspectFit' />
      <Text className={styles.title}>{title}</Text>
      <Text className={styles.description}>{description}</Text>
    </View>
  )
}

export default EmptyState