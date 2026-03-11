"use client"

import React, { useEffect, useMemo, memo } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useMenuStore } from "@/store/slices/menu-slice"
import { cn } from "@/lib/utils"
import type { RouteConfig } from "@/config/routes"

// 单个菜单项组件 - 无子菜单
const SingleMenuItem = memo(function SingleMenuItem({
  item,
  isActive,
}: {
  item: RouteConfig
  isActive: boolean
}) {
  const IconComponent = item.icon
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.href}>
          {IconComponent && (
            <IconComponent className={cn("size-4 transition-colors duration-200", isActive ? "text-primary" : "opacity-70")} />
          )}
          <span className={cn(
            "text-sm tracking-tight transition-colors duration-200",
            isActive ? "font-medium text-primary" : "text-sidebar-foreground/70"
          )}>
            {item.label}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
})

// 子菜单项组件
const SubMenuItem = memo(function SubMenuItem({
  subItem,
  isActive,
}: {
  subItem: RouteConfig
  isActive: boolean
}) {
  const IconComponent = subItem.icon
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={isActive}>
        <Link href={subItem.href}>
          {IconComponent && (
            <IconComponent className={cn("size-4 transition-colors duration-200", isActive ? "text-primary" : "opacity-70")} />
          )}
          <span className={cn(
            "text-sm tracking-tight transition-colors duration-200",
            isActive ? "font-medium text-primary" : "text-sidebar-foreground/70"
          )}>
            {subItem.label}
          </span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
})

// 子菜单列表组件 - 避免在父组件中做 map
const SubMenuList = memo(function SubMenuList({
  children,
  pathname,
}: {
  children: RouteConfig[]
  pathname: string
}) {
  return (
    <SidebarMenuSub>
      {children.map((subItem) => (
        <SubMenuItem
          key={subItem.href}
          subItem={subItem}
          isActive={pathname === subItem.href}
        />
      ))}
    </SidebarMenuSub>
  )
})

// 可折叠菜单项组件 - 带子菜单
const CollapsibleMenuItem = memo(function CollapsibleMenuItem({
  item,
  isParentActive,
  pathname,
  isExpanded,
  onToggle,
}: {
  item: RouteConfig
  isParentActive: boolean
  pathname: string
  isExpanded: boolean
  onToggle: () => void
}) {
  const IconComponent = item.icon

  return (
    <Collapsible
      asChild
      open={isExpanded}
      onOpenChange={onToggle}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="cursor-pointer">
            {IconComponent && (
              <IconComponent
                className={cn("size-4 transition-colors duration-200", isParentActive ? "text-primary" : "opacity-70")}
              />
            )}
            <span className={cn(
              "text-sm tracking-tight transition-colors duration-200",
              isParentActive ? "font-medium text-primary" : "text-sidebar-foreground/70"
            )}>
              {item.label}
            </span>
            <ChevronRight className="ml-auto size-4 opacity-50 transition-transform duration-150 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {item.children && (
            <SubMenuList children={item.children} pathname={pathname} />
          )}
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
})

// 主导航组件
export const NavMain = memo(function NavMain() {
  const pathname = usePathname()
  const menuItems = useMenuStore((state) => state.menuItems)
  const loading = useMenuStore((state) => state.loading)
  const fetchMenus = useMenuStore((state) => state.fetchMenus)
  const expandedMenus = useMenuStore((state) => state.expandedMenus)
  const toggleMenu = useMenuStore((state) => state.toggleMenu)
  const setMenuExpanded = useMenuStore((state) => state.setMenuExpanded)

  // 获取菜单数据
  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  // 当路径变化时，自动展开对应的父菜单
  useEffect(() => {
    if (menuItems.length === 0) return

    for (const item of menuItems) {
      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          if (pathname === child.href || pathname.startsWith(child.href + "/")) {
            // 找到匹配的子菜单，展开其父菜单
            setMenuExpanded(item.href, true)
            return
          }
        }
      }
    }
  }, [pathname, menuItems, setMenuExpanded])

  // 缓存活跃状态的计算
  const activeStates = useMemo(() => {
    const states = new Map<string, { isActive: boolean; hasActiveChild: boolean }>()

    for (const item of menuItems) {
      const isActive = pathname === item.href
      let hasActiveChild = false

      if (item.children) {
        for (const child of item.children) {
          if (pathname === child.href || pathname.startsWith(child.href + "/")) {
            hasActiveChild = true
            break
          }
        }
      }

      states.set(item.href, { isActive, hasActiveChild })
    }

    return states
  }, [menuItems, pathname])

  // 加载状态
  if (loading) {
    return (
      <SidebarGroup>
        <SidebarMenu>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {menuItems.map((item) => {
          const state = activeStates.get(item.href)
          const isActive = state?.isActive ?? false
          const hasActiveChild = state?.hasActiveChild ?? false

          if (item.children && item.children.length > 0) {
            return (
              <CollapsibleMenuItem
                key={item.href}
                item={item}
                isParentActive={hasActiveChild}
                pathname={pathname}
                isExpanded={expandedMenus.has(item.href)}
                onToggle={() => toggleMenu(item.href)}
              />
            )
          }

          return (
            <SingleMenuItem
              key={item.href}
              item={item}
              isActive={isActive}
            />
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
})
