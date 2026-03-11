"use client"

import * as React from "react"

import { NavMain } from "@/components/layout/nav-main"
import { SidebarHeader as SidebarHeaderMenu } from "@/components/layout/sidebar-header"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export const AppSidebar = React.memo(function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarHeaderMenu />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
})
