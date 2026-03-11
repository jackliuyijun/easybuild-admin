import { StateCreator } from 'zustand'

export interface AppSlice {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  pageTitle: string
  setPageTitle: (title: string) => void
  isSearchCollapsed: boolean
  setIsSearchCollapsed: (collapsed: boolean) => void
  hasSearchArea: boolean
  setHasSearchArea: (has: boolean) => void
}

export const createAppSlice: StateCreator<AppSlice, [], [], AppSlice> = (set, get, store) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  pageTitle: '',
  setPageTitle: (title) => set({ pageTitle: title }),
  isSearchCollapsed: false,
  setIsSearchCollapsed: (collapsed) => set({ isSearchCollapsed: collapsed }),
  hasSearchArea: false,
  setHasSearchArea: (has) => set({ hasSearchArea: has }),
}) 