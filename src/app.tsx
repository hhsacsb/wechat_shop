import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import { wxLogin } from '@/api/auth';
// 全局样式
import './app.scss';

function App(props) {
  useEffect(() => {
    // 启动时自动登录：如果已有 token 则跳过
    const existingToken = Taro.getStorageSync('token')
    if (existingToken) {
      console.log('[Auth] 已有 token，跳过登录')
      return
    }

    // 调用 wx.login 获取临时 code
    Taro.login({
      success: (res) => {
        if (res.code) {
          // 调用后端登录接口换取 token
          wxLogin(res.code, '微信用户', '')
            .then((data) => {
              Taro.setStorageSync('token', data.token)
              console.log('[Auth] 登录成功，token 已存储')
            })
            .catch((err) => {
              console.error('[Auth] 登录失败:', err)
            })
        } else {
          console.error('[Auth] wx.login 失败:', res.errMsg)
        }
      },
      fail: (err) => {
        console.error('[Auth] wx.login 调用失败:', err)
      },
    })
  }, []);

  // 对应 onShow
  useDidShow(() => {});

  // 对应 onHide
  useDidHide(() => {});

  return props.children;
}

export default App;
