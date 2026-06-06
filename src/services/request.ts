import Taro from '@tarojs/taro'

const BASE_URL = 'https://dev-api.xxx.com'

const request = <T>(url: string, options?: Taro.request.Option): Promise<T> => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}${url}`,
      header: {
        'Content-Type': 'application/json',
      },
      ...options,
      success: (res) => {
        const data = res.data as any
        if (data.code === 0) {
          resolve(data.data)
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