import { MenuResource } from "@/config/routes"

const MENU_CACHE_KEY = 'admin_menu_cache'
const MENU_CACHE_EXPIRE_KEY = 'admin_menu_cache_expire'
const CACHE_DURATION = 30 * 60 * 1000 // 30分钟缓存时间

export const menuCache = {
  // 设置菜单缓存
  set: (menuData: MenuResource[]) => {
    try {
      localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(menuData))
      localStorage.setItem(MENU_CACHE_EXPIRE_KEY, String(Date.now() + CACHE_DURATION))
    } catch (error) {
      console.error('Failed to cache menu data:', error)
    }
  },

  // 获取菜单缓存
  get: (): MenuResource[] | null => {
    try {
      const expireTime = Number(localStorage.getItem(MENU_CACHE_EXPIRE_KEY))
      if (expireTime && Date.now() < expireTime) {
        const cachedData = localStorage.getItem(MENU_CACHE_KEY)
        return cachedData ? JSON.parse(cachedData) : null
      }
      // 缓存过期，清除缓存
      menuCache.clear()
      return null
    } catch (error) {
      console.error('Failed to get menu cache:', error)
      return null
    }
  },

  // 清除菜单缓存
  clear: () => {
    try {
      localStorage.removeItem(MENU_CACHE_KEY)
      localStorage.removeItem(MENU_CACHE_EXPIRE_KEY)
    } catch (error) {
      console.error('Failed to clear menu cache:', error)
    }
  },

  // 检查缓存是否有效
  isValid: (): boolean => {
    try {
      const expireTime = Number(localStorage.getItem(MENU_CACHE_EXPIRE_KEY))
      return expireTime ? Date.now() < expireTime : false
    } catch {
      return false
    }
  }
} 