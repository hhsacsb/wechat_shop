// 商品分类
export interface Category {
  id: number
  parentId: number
  name: string
  icon: string
  sort: number
  status: number
}

// 商品
export interface Product {
  id: number
  categoryId: number
  name: string
  subtitle: string
  coverImage: string
  content: string
  price: number
  originalPrice: number
  salesCount: number
  status: number
  skus: Sku[]
  images: string[]
}

// 商品SKU
export interface Sku {
  id: number
  productId: number
  skuCode: string
  specValue: string
  price: number
  stock: number
  image: string
}

// 购物车项
export interface CartItem {
  id: number
  userId: number
  productId: number
  skuId: number
  quantity: number
  checked: boolean
  productName: string
  skuDesc: string
  price: number
  coverImage: string
  stock: number
}

// 收货地址
export interface Address {
  id: number
  userId: number
  consignee: string
  mobile: string
  province: string
  city: string
  district: string
  detailAddress: string
  isDefault: boolean
}

// 订单
export interface Order {
  id: number
  orderNo: string
  userId: number
  totalAmount: number
  discountAmount: number
  payAmount: number
  payStatus: number
  orderStatus: number
  addressSnapshot: string
  remark: string
  items: OrderItem[]
  createdAt: string
}

// 订单明细
export interface OrderItem {
  id: number
  orderId: number
  productId: number
  skuId: number
  productName: string
  skuDesc: string
  price: number
  quantity: number
  amount: number
  coverImage: string
}

// 优惠券
export interface Coupon {
  id: number
  name: string
  type: number
  amount: number
  minAmount: number
  startTime: string
  endTime: string
  description: string
  status: number
}

// 用户信息
export interface UserInfo {
  id: number
  nickname: string
  avatar: string
  mobile: string
}

// 轮播图
export interface Banner {
  id: number
  image: string
  url: string
  title: string
  sort: number
}

// 售后申请
export interface AfterSale {
  id: number
  orderId: number
  orderNo: string
  productName: string
  skuDesc: string
  amount: number
  reason: string
  status: number
  createdAt: string
}

// API通用响应
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 分页响应
export interface PageResponse<T> {
  list: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}