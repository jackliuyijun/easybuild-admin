"use client"

import React, { useMemo, memo } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { HeaderActions } from "@/components/layout/header-actions"
import { NavUser } from "@/components/layout/nav-user"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useMenuStore } from "@/store/slices/menu-slice"
import { useSearchCollapse, useSearchArea } from "@/store"
import { Search, ChevronUp, ChevronDown } from "lucide-react"
import type { RouteConfig } from "@/config/routes"

interface LayoutProps {
  children: React.ReactNode
}

// 根据路径查找菜单项
function findMenuByPath(
  menuItems: RouteConfig[],
  path: string
): { parent?: RouteConfig; current?: RouteConfig } {
  for (const item of menuItems) {
    if (item.href === path) {
      return { current: item }
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.href === path) {
          return { parent: item, current: child }
        }
      }
    }
  }
  return {}
}

// 面包屑组件
const BreadcrumbNav = memo(function BreadcrumbNav({
  parent,
  current,
}: {
  parent?: RouteConfig
  current?: RouteConfig
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {parent && (
          <>
            <BreadcrumbItem className="hidden md:block">
              <span>{parent.label}</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage>{current?.label || "首页"}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
})

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const menuItems = useMenuStore((state) => state.menuItems)
  const { isSearchCollapsed, setIsSearchCollapsed } = useSearchCollapse()
  const { hasSearchArea } = useSearchArea()

  // 使用 useMemo 缓存菜单查找结果
  const { parent, current } = useMemo(
    () => findMenuByPath(menuItems, pathname),
    [menuItems, pathname]
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen">
        {/* 顶部 Header */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background shadow-sm dark:shadow-none dark:border-border/10 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <BreadcrumbNav parent={parent} current={current} />
          </div>
          <div className="flex items-center gap-4 px-4">
            <HeaderActions />
            <NavUser />
          </div>
        </header>

        {/* 主内容区 */}
        <div className="flex flex-1 flex-col min-h-0 bg-muted/40 dark:bg-background relative p-1">
          {/* 搜索区折叠开关按钮 - 紧凑地悬浮在业务按钮后方 */}
          {hasSearchArea && (
            <div className="absolute top-[22px] right-5 z-30 pointer-events-none">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchCollapsed(!isSearchCollapsed)}
                className={cn(
                  "pointer-events-auto h-7 px-1.5 flex items-center gap-1 transition-all duration-300",
                  "text-muted-foreground hover:text-primary hover:bg-transparent group"
                )}
                title={isSearchCollapsed ? "展开搜索" : "收起搜索"}
              >
                <span className="text-xs font-medium select-none">
                  {isSearchCollapsed ? "展开" : "收起"}
                </span>
                <div className={cn(
                  "flex items-center justify-center transition-transform duration-500",
                  isSearchCollapsed ? "rotate-180" : "rotate-0"
                )}>
                  <ChevronUp className="h-3.5 w-3.5" />
                </div>
              </Button>
            </div>
          )}
          <div className="flex-1 rounded-xl overflow-hidden min-h-0 bg-background dark:bg-white/[0.03] shadow-sm ring-1 ring-border/5 dark:ring-white/5">
            <div className="h-full overflow-auto">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
