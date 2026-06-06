import { api } from '@/services/request'
import { PageResponse } from '@/types'

// 首页数据
export interface HomeData {
  banners: Array<{ id: number; image: string; link_type: string; link_value: string }>
  hot_products: Array<{ id: number; name: string; price: number; cover_image: string }>
  new_products: Array<{ id: number; name: string; price: number; cover_image: string }>
}

// 商品列表查询参数
export interface ProductListParams {
  category_id?: number
  keyword?: string
  sort?: 'price_asc' | 'price_desc' | 'sales'
  page?: number
  page_size?: number
}

/** 获取首页数据 */
export const getHomeData = () => api.get<HomeData>('/api/product/home-list')

/** 获取商品列表 */
export const getProductList = (params: ProductListParams) =>
  api.get<PageResponse<any>>('/api/product/list', params)

/** 获取商品详情 */
export const getProductDetail = (id: number) =>
  api.get<any>(`/api/product/detail`, { id })

/** 搜索商品 */
export const searchProducts = (keyword: string, page = 1, pageSize = 10) =>
  api.get<PageResponse<any>>('/api/product/search', { keyword, page, page_size: pageSize })
