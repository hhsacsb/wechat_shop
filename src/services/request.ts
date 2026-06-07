import Taro from '@tarojs/taro'

const BASE_URL = 'http://localhost:3000'

const request = <T>(url: string, options?: Taro.request.Option): Promise<T> => {
  // 从缓存中读取 token
  const token = Taro.getStorageSync('token')

  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}${url}`,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
      success: (res) => {
        const data = res.data as any
        if (data.code === 0) {
          resolve(data.data)
        } else if (res.statusCode === 401) {
          // token 无效或过期，清除并提示重新登录
          Taro.removeStorageSync('token')
          Taro.showToast({ title: data.message || '登录已过期，请重新进入', icon: 'none' })
          reject(new Error(data.message))
        } else {
          Taro.showToast({ title: data.message || '请求失败', icon: 'none' })
          reject(new Error(data.message))
        }
      },
      fail: (err) => {
        console.error(`[API] ${url} error:`, err)
        Taro.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
        reject(err)
      },
    })
  })
}

export const api = {
  get: <T>(url: string, data?: Record<string, any>) =>
    request<T>(url, { method: 'GET', data }),
  post: <T>(url: string, data?: Record<string, any>) =>
    request<T>(url, { method: 'POST', data }),
  put: <T>(url: string, data?: Record<string, any>) =>
    request<T>(url, { method: 'PUT', data }),
  delete: <T>(url: string, data?: Record<string, any>) =>
    request<T>(url, { method: 'DELETE', data }),
}