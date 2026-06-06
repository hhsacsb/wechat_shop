// 商品 Mock 数据
import { Category, Product, Sku } from '@/types'

// 商品分类
export const mockCategories: Category[] = [
  { id: 1, parentId: 0, name: '推荐', icon: '', sort: 1, status: 1 },
  { id: 2, parentId: 0, name: '女装', icon: '', sort: 2, status: 1 },
  { id: 3, parentId: 0, name: '男装', icon: '', sort: 3, status: 1 },
  { id: 4, parentId: 0, name: '美妆', icon: '', sort: 4, status: 1 },
  { id: 5, parentId: 0, name: '家居', icon: '', sort: 5, status: 1 },
  { id: 6, parentId: 0, name: '数码', icon: '', sort: 6, status: 1 },
  { id: 7, parentId: 0, name: '食品', icon: '', sort: 7, status: 1 },
  { id: 8, parentId: 0, name: '运动', icon: '', sort: 8, status: 1 },
  { id: 9, parentId: 2, name: '连衣裙', icon: '', sort: 1, status: 1 },
  { id: 10, parentId: 2, name: '上衣', icon: '', sort: 2, status: 1 },
  { id: 11, parentId: 2, name: '裤子', icon: '', sort: 3, status: 1 },
  { id: 12, parentId: 3, name: '外套', icon: '', sort: 1, status: 1 },
  { id: 13, parentId: 3, name: 'T恤', icon: '', sort: 2, status: 1 },
  { id: 14, parentId: 3, name: '衬衫', icon: '', sort: 3, status: 1 },
]

// 生成SKU
const createSkus = (productId: number, basePrice: number): Sku[] => [
  { id: (productId - 1) * 3 + 1, productId, skuCode: `SKU${productId}A`, specValue: '白色/S', price: basePrice, stock: 100, image: '' },
  { id: (productId - 1) * 3 + 2, productId, skuCode: `SKU${productId}B`, specValue: '白色/M', price: basePrice, stock: 80, image: '' },
  { id: (productId - 1) * 3 + 3, productId, skuCode: `SKU${productId}C`, specValue: '白色/L', price: basePrice + 20, stock: 60, image: '' },
]

// 商品详情
export const mockProductDetail: Product = {
  id: 1,
  categoryId: 2,
  name: '春季新款连衣裙 气质优雅收腰显瘦 法式碎花长裙',
  subtitle: '优雅气质 收腰显瘦 法式浪漫',
  coverImage: 'https://picsum.photos/id/103/300/300',
  content: '精选优质面料，手感柔软舒适。收腰设计，完美展现身材曲线。适合日常通勤、约会聚会等多种场合。',
  price: 299,
  originalPrice: 599,
  salesCount: 2345,
  status: 1,
  skus: createSkus(1, 299),
  images: [
    'https://picsum.photos/id/103/750/500',
    'https://picsum.photos/id/431/750/500',
    'https://picsum.photos/id/1080/750/500',
  ],
}

// 商品列表
export const mockProductList: Product[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  categoryId: (i % 6) + 2,
  name: `精选商品${i + 1} 品质生活从这里开始`,
  subtitle: `商品副标题${i + 1}`,
  coverImage: `https://picsum.photos/id/${[103, 119, 250, 225, 1, 292, 431, 201, 220, 230, 582, 580][i]}/300/300`,
  content: '',
  price: 99 + i * 50,
  originalPrice: 199 + i * 80,
  salesCount: 1000 + i * 500,
  status: 1,
  skus: createSkus(i + 1, 99 + i * 50),
  images: [],
}))