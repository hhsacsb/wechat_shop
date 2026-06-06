import { api } from '@/services/request'

/** 获取分类树（小程序端使用） */
export const getCategoryTree = () => api.get<any[]>('/api/category/tree')

/** 获取分类列表（后台管理用） */
export const getCategoryList = (params?: { status?: number }) =>
  api.get<any[]>('/api/category/list', params)
