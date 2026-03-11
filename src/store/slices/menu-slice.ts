import { create } from 'zustand'
import { RouteConfig, routes, convertMenuToRoutes } from '@/config/routes'
import { menuCache } from '@/lib/menu-cache'
import http from '@/api/http'
import { API_URLS } from '@/config/api-url'
import { showError } from '@/components/custom/notifications'

interface MenuState {
  menuItems: RouteConfig[]
  loading: boolean
  initialized: boolean
  allMenusExpanded: boolean
  expandedMenus: Set<string>
  fetchMenus: () => Promise<void>
  toggleAllMenus: () => void
  toggleMenu: (href: string) => void
  setMenuExpanded: (href: string, expanded: boolean) => void
  reset: () => void
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menuItems: routes,
  loading: false,
  initialized: false,
  allMenusExpanded: false,
  expandedMenus: new Set<string>(),
  fetchMenus: async () => {
    // 如果已经初始化过，直接返回
    if (get().initialized) return

    try {
      set({ loading: true })

      // 尝试从缓存获取菜单数据
      const cachedMenu = menuCache.get()
      if (cachedMenu) {
        const dynamicRoutes = convertMenuToRoutes(cachedMenu)
        if (dynamicRoutes && dynamicRoutes.length > 0) {
          const allRoutes = [...routes, ...dynamicRoutes]
          set({
            menuItems: allRoutes,
            expandedMenus: new Set<string>(),
            initialized: true
          })
          return
        }
      }

      // 从服务器获取数据
      const response = await http.get(API_URLS.auth.resources)
      const menuData = response.data
      const dynamicRoutes = convertMenuToRoutes(menuData)

      if (dynamicRoutes && dynamicRoutes.length > 0) {
        const allRoutes = [...routes, ...dynamicRoutes]
        set({ 
          menuItems: allRoutes,
          expandedMenus: new Set<string>()
        })
        // 缓存新的菜单数据
        menuCache.set(menuData)
      }
    } catch (error: any) {
      showError({
        title: "获取菜单失败",
        description: error.message || "请刷新页面重试"
      })
    } finally {
      set({ loading: false, initialized: true })
    }
  },
  toggleAllMenus: () => {
    const { menuItems, allMenusExpanded } = get()
    if (allMenusExpanded) {
      // 全部折叠
      set({ 
        expandedMenus: new Set<string>(),
        allMenusExpanded: false 
      })
    } else {
      // 全部展开
      const allExpanded = new Set<string>()
      menuItems.forEach(item => {
        if (item.children && item.children.length > 0) {
          allExpanded.add(item.href)
        }
      })
      set({ 
        expandedMenus: allExpanded,
        allMenusExpanded: true 
      })
    }
  },
  toggleMenu: (href: string) => {
    const { expandedMenus } = get()
    const newExpanded = new Set(expandedMenus)
    if (newExpanded.has(href)) {
      newExpanded.delete(href)
    } else {
      newExpanded.add(href)
    }
    set({ expandedMenus: newExpanded })
  },
  setMenuExpanded: (href: string, expanded: boolean) => {
    const { expandedMenus } = get()
    const newExpanded = new Set(expandedMenus)
    if (expanded) {
      newExpanded.add(href)
    } else {
      newExpanded.delete(href)
    }
    set({ expandedMenus: newExpanded })
  },
  reset: () => {
    // 重置状态到初始值
    set({
      menuItems: routes,
      loading: false,
      initialized: false,
      allMenusExpanded: false,
      expandedMenus: new Set<string>()
    })
  }
}))

// 导出一个独立的重置函数
export const resetMenuStore = () => {
  menuCache.clear()  // 清除缓存
  useMenuStore.getState().reset()  // 重置状态
}
