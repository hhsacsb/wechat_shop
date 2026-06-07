import { api } from '@/services/request'

/** 微信登录 */
export const wxLogin = (code: string, nickname?: string, avatar?: string) =>
  api.post<{
    token: string
    user_id: number
    openid: string
    is_new_user: boolean
  }>('/api/user/wx-login', { code, nickname, avatar })