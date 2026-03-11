import type { AppSlice } from './slices/app-slice'
import type { SidebarSlice } from './slices/sidebar-slice'

export interface StoreState extends AppSlice, SidebarSlice {} 