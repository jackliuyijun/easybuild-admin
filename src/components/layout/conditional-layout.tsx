"use client"

import React, { memo } from "react"
import { usePathname } from "next/navigation"
import { Layout } from "./layout"

// 不需要布局的路径
const NO_LAYOUT_PATHS = ["/login"]

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export const ConditionalLayout = memo(function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname()

  // 检查当前路径是否需要布局
  const needsLayout = !NO_LAYOUT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )

  if (!needsLayout) {
    return <>{children}</>
  }

  return <Layout>{children}</Layout>
})
