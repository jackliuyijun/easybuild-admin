"use client"

import React, { memo } from "react"
import { useRouter } from "next/navigation"
import { ChevronsUpDown, Store } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useMenuStore } from "@/store/slices/menu-slice"

export const SidebarHeader = memo(function SidebarHeader() {
  const router = useRouter()
  const toggleAllMenus = useMenuStore((state) => state.toggleAllMenus)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          onClick={toggleAllMenus}
          className="cursor-pointer hover:bg-sidebar-accent transition-all duration-200"
        >
          <div
            className="flex aspect-square size-8 items-center justify-center rounded-xl bg-primary shadow-sm transition-all hover:scale-105 active:scale-95 group-hover:shadow-md"
            onClick={(e) => {
              e.stopPropagation()
              router.push("/")
            }}
          >
            <span className="text-[14px] font-black text-primary-foreground tracking-tight">EB</span>
          </div>
          <div className="grid flex-1 text-left leading-tight ml-1">
            <span className="truncate font-bold text-[15px] tracking-tight text-sidebar-foreground">
              EasyBuild Admin
            </span>
            <span className="truncate text-[11px] font-bold text-primary tracking-[0.2em] uppercase opacity-90">
              易构 · BMS
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-3.5 text-muted-foreground/40" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
})
