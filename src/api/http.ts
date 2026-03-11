import axios from 'axios'
import { API_CODE } from '@/config/constants'
import { API_BASE_URL } from '@/config/api-url'
import type { ApiResponse } from '@/types/api'
import { getToken, clearAuth } from '@/lib/auth'
import { showError } from '@/components/custom/notifications'

// 创建 axios 实例
export const http = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 请求拦截器
http.interceptors.request.use(
    (config) => {
        const token = getToken()
        if (token) {
            config.headers['Access-Token'] = token
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
http.interceptors.response.use(
    (response) => {
        const res = response.data as ApiResponse

        if (res.code === API_CODE.OK) {
            return res as any
        }

        if (res.code === API_CODE.UNLOGIN) {
            if (typeof window !== 'undefined') {
                clearAuth()
                window.location.href = '/login'
            }
            showError({
                title: "登录已过期",
                description: "请重新登录",
                icon: 'shield'
            })
            return Promise.reject(new Error('登录已过期'))
        }

        // 显示错误提示
        showError({
            title: "操作失败",
            description: res.msg || '请求失败',
            icon: 'error'
        })

        // 返回原始响应，让业务代码决定如何处理
        return Promise.reject(new Error(res.msg || '请求失败'))
    },
    (error) => {
        // 处理超时错误
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
            showError({
                title: "网络异常",
                description: "网络异常，请稍后再试！",
                icon: 'error'
            })
            return Promise.reject(new Error('网络异常，请稍后再试！'))
        }

        // 处理其他网络错误
        const errorMessage = error.response?.data?.msg || error.message || '网络请求失败'

        showError({
            title: "请求错误",
            description: errorMessage,
            icon: 'ban'
        })

        return Promise.reject(new Error(errorMessage))
    }
)

export default http 