import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist } from 'zustand/middleware'
import { createAppSlice } from './slices/app-slice'
import { createSidebarSlice } from './slices/sidebar-slice'
import { StoreState } from './types'

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (set, get, store) => ({
        ...createAppSlice(set, get, store),
        ...createSidebarSlice(set, get, store),
      }),
      {
        name: 'app-storage',
      }
    )
  )
)

// 导出选择器
export const useSidebarState = () => {
  const isSidebarOpen = useStore((state: any) => state.isSidebarOpen)
  const toggleSidebar = useStore((state: any) => state.toggleSidebar)
  return { isSidebarOpen, toggleSidebar }
}

// 新增：页面标题相关钩子
export const usePageTitle = () => {
  const pageTitle = useStore((state: any) => state.pageTitle)
  const setPageTitle = useStore((state: any) => state.setPageTitle)
  return { pageTitle, setPageTitle }
}

// 新增：页面搜索折叠相关钩子
export const useSearchCollapse = () => {
  const isSearchCollapsed = useStore((state: any) => state.isSearchCollapsed)
  const setIsSearchCollapsed = useStore((state: any) => state.setIsSearchCollapsed)
  return { isSearchCollapsed, setIsSearchCollapsed }
}

// 新增：搜索区域存在状态相关钩子
export const useSearchArea = () => {
  const hasSearchArea = useStore((state: any) => state.hasSearchArea)
  const setHasSearchArea = useStore((state: any) => state.setHasSearchArea)
  return { hasSearchArea, setHasSearchArea }
}