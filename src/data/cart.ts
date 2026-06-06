// 购物车 Mock 数据
import { CartItem } from '@/types'

export const mockCartItems: CartItem[] = [
  {
    id: 1,
    userId: 1,
    productId: 1,
    skuId: 1,
    quantity: 1,
    checked: true,
    productName: '春季新款连衣裙 气质优雅收腰显瘦',
    skuDesc: '白色/M',
    price: 299,
    coverImage: 'https://picsum.photos/id/103/300/300',
    stock: 100,
  },
  {
    id: 2,
    userId: 1,
    productId: 3,
    skuId: 7,
    quantity: 2,
    checked: true,
    productName: '大牌口红礼盒 丝绒哑光不掉色',
    skuDesc: '经典红',
    price: 189,
    coverImage: 'https://picsum.photos/id/250/300/300',
    stock: 50,
  },
  {
    id: 3,
    userId: 1,
    productId: 5,
    skuId: 13,
    quantity: 1,
    checked: false,
    productName: '蓝牙无线降噪耳机 超长续航',
    skuDesc: '星空黑',
    price: 699,
    coverImage: 'https://picsum.photos/id/1/300/300',
    stock: 30,
  },
]