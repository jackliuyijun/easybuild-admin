import type { TokenContent } from '@/types/token'
import { menuCache } from "./menu-cache"
import { resetMenuStore } from '@/store/slices/menu-slice'

export const getToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access-token')
}

export const getUserInfo = (): TokenContent | null => {
  if (typeof window === 'undefined') return null
  const userInfo = localStorage.getItem('user-info')
  return userInfo ? JSON.parse(userInfo) : null
}

export const clearAuth = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access-token')
  localStorage.removeItem('user-info')
  resetMenuStore()
}

export const isAuthenticated = () => {
  return !!getToken()
} 