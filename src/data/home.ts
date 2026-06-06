// 首页 Mock 数据
import { Banner, Category, Product } from '@/types'

// 轮播图数据
export const mockBanners: Banner[] = [
  { id: 1, image: 'https://picsum.photos/id/292/750/400', url: '', title: '春季新品上市', sort: 1 },
  { id: 2, image: 'https://picsum.photos/id/312/750/400', url: '', title: '限时特惠低至5折', sort: 2 },
  { id: 3, image: 'https://picsum.photos/id/326/750/400', url: '', title: '会员专享福利', sort: 3 },
]

// 首页分类导航
export const mockHomeCategories: Category[] = [
  { id: 1, parentId: 0, name: '推荐', icon: 'https://picsum.photos/id/1/200/200', sort: 1, status: 1 },
  { id: 2, parentId: 0, name: '女装', icon: 'https://picsum.photos/id/103/200/200', sort: 2, status: 1 },
  { id: 3, parentId: 0, name: '男装', icon: 'https://picsum.photos/id/119/200/200', sort: 3, status: 1 },
  { id: 4, parentId: 0, name: '美妆', icon: 'https://picsum.photos/id/250/200/200', sort: 4, status: 1 },
  { id: 5, parentId: 0, name: '家居', icon: 'https://picsum.photos/id/225/200/200', sort: 5, status: 1 },
  { id: 6, parentId: 0, name: '数码', icon: 'https://picsum.photos/id/2/200/200', sort: 6, status: 1 },
  { id: 7, parentId: 0, name: '食品', icon: 'https://picsum.photos/id/292/200/200', sort: 7, status: 1 },
  { id: 8, parentId: 0, name: '运动', icon: 'https://picsum.photos/id/160/200/200', sort: 8, status: 1 },
]

// 热门推荐商品
export const mockHotProducts: Product[] = [
  { id: 1, categoryId: 2, name: '春季新款连衣裙 气质优雅收腰显瘦', subtitle: '优雅气质 收腰显瘦', coverImage: 'https://picsum.photos/id/103/300/300', content: '', price: 299, originalPrice: 599, salesCount: 2345, status: 1, skus: [], images: [] },
  { id: 2, categoryId: 3, name: '男士商务休闲夹克 立领修身', subtitle: '商务休闲 立领修身', coverImage: 'https://picsum.photos/id/119/300/300', content: '', price: 459, originalPrice: 899, salesCount: 1876, status: 1, skus: [], images: [] },
  { id: 3, categoryId: 4, name: '大牌口红礼盒 丝绒哑光不掉色', subtitle: '丝绒质感 持久不脱色', coverImage: 'https://picsum.photos/id/250/300/300', content: '', price: 189, originalPrice: 369, salesCount: 5621, status: 1, skus: [], images: [] },
  { id: 4, categoryId: 5, name: '北欧风台灯 护眼LED阅读灯', subtitle: '护眼无频闪 北欧简约设计', coverImage: 'https://picsum.photos/id/582/300/300', content: '', price: 159, originalPrice: 259, salesCount: 987, status: 1, skus: [], images: [] },
  { id: 5, categoryId: 6, name: '蓝牙无线降噪耳机 超长续航', subtitle: '主动降噪 40小时续航', coverImage: 'https://picsum.photos/id/1/300/300', content: '', price: 699, originalPrice: 1299, salesCount: 3421, status: 1, skus: [], images: [] },
  { id: 6, categoryId: 7, name: '进口坚果礼盒 每日坚果混合装', subtitle: '精选坚果 每日营养', coverImage: 'https://picsum.photos/id/292/300/300', content: '', price: 128, originalPrice: 198, salesCount: 7654, status: 1, skus: [], images: [] },
]

// 新品推荐
export const mockNewProducts: Product[] = [
  { id: 7, categoryId: 2, name: '法式复古碎花裙 方领泡泡袖', subtitle: '法式复古 浪漫碎花', coverImage: 'https://picsum.photos/id/431/300/300', content: '', price: 259, originalPrice: 499, salesCount: 1234, status: 1, skus: [], images: [] },
  { id: 8, categoryId: 3, name: '男士 polo 衫 纯棉珠地布', subtitle: '纯棉透气 珠地挺括', coverImage: 'https://picsum.photos/id/201/300/300', content: '', price: 199, originalPrice: 399, salesCount: 876, status: 1, skus: [], images: [] },
  { id: 9, categoryId: 4, name: '美白精华液 烟酰胺淡斑', subtitle: '烟酰胺淡斑 焕亮肌肤', coverImage: 'https://picsum.photos/id/220/300/300', content: '', price: 329, originalPrice: 659, salesCount: 4321, status: 1, skus: [], images: [] },
  { id: 10, categoryId: 5, name: '日式简约陶瓷餐具套装', subtitle: '日式简约 精致生活', coverImage: 'https://picsum.photos/id/230/300/300', content: '', price: 189, originalPrice: 358, salesCount: 654, status: 1, skus: [], images: [] },
]