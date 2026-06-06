// 订单 Mock 数据
import { Order, Address, Coupon } from '@/types'

export const mockAddresses: Address[] = [
  {
    id: 1,
    userId: 1,
    consignee: '张三',
    mobile: '138****8888',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detailAddress: '科技园南区A栋101室',
    isDefault: true,
  },
  {
    id: 2,
    userId: 1,
    consignee: '张三',
    mobile: '138****8888',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    detailAddress: '珠江新城B座202室',
    isDefault: false,
  },
]

export const mockOrders: Order[] = [
  {
    id: 1,
    orderNo: 'ORD20250101001',
    userId: 1,
    totalAmount: 488,
    discountAmount: 50,
    payAmount: 438,
    payStatus: 1,
    orderStatus: 3,
    addressSnapshot: JSON.stringify(mockAddresses[0]),
    remark: '请尽快发货',
    items: [
      { id: 1, orderId: 1, productId: 1, skuId: 1, productName: '春季新款连衣裙', skuDesc: '白色/M', price: 299, quantity: 1, amount: 299, coverImage: 'https://picsum.photos/id/103/300/300' },
      { id: 2, orderId: 1, productId: 3, skuId: 7, productName: '大牌口红礼盒', skuDesc: '经典红', price: 189, quantity: 1, amount: 189, coverImage: 'https://picsum.photos/id/250/300/300' },
    ],
    createdAt: '2025-01-01 10:30:00',
  },
  {
    id: 2,
    orderNo: 'ORD20250102002',
    userId: 1,
    totalAmount: 699,
    discountAmount: 0,
    payAmount: 699,
    payStatus: 1,
    orderStatus: 1,
    addressSnapshot: JSON.stringify(mockAddresses[0]),
    remark: '',
    items: [
      { id: 3, orderId: 2, productId: 5, skuId: 13, productName: '蓝牙无线降噪耳机', skuDesc: '星空黑', price: 699, quantity: 1, amount: 699, coverImage: 'https://picsum.photos/id/1/300/300' },
    ],
    createdAt: '2025-01-02 14:20:00',
  },
  {
    id: 3,
    orderNo: 'ORD20250103003',
    userId: 1,
    totalAmount: 459,
    discountAmount: 30,
    payAmount: 429,
    payStatus: 1,
    orderStatus: 4,
    addressSnapshot: JSON.stringify(mockAddresses[1]),
    remark: '',
    items: [
      { id: 4, orderId: 3, productId: 2, skuId: 4, productName: '男士商务休闲夹克', skuDesc: '藏青色/L', price: 459, quantity: 1, amount: 459, coverImage: 'https://picsum.photos/id/119/300/300' },
    ],
    createdAt: '2025-01-03 09:15:00',
  },
]

export const mockCoupons: Coupon[] = [
  { id: 1, name: '新人专享券', type: 1, amount: 50, minAmount: 200, startTime: '2025-01-01', endTime: '2025-12-31', description: '满200元可用', status: 1 },
  { id: 2, name: '满减优惠券', type: 1, amount: 100, minAmount: 500, startTime: '2025-01-01', endTime: '2025-06-30', description: '满500元可用', status: 1 },
  { id: 3, name: '运费券', type: 2, amount: 10, minAmount: 0, startTime: '2025-01-01', endTime: '2025-12-31', description: '免运费', status: 1 },
]