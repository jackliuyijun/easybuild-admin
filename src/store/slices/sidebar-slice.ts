import { StateCreator } from 'zustand'

export interface SidebarSlice {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const createSidebarSlice: StateCreator<SidebarSlice, [], [], SidebarSlice> = (set, get, store) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}) 