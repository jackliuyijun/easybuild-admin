import * as React from "react"
import { cn } from "@/lib/utils"

interface LayoutProps {
  className?: string
  children: React.ReactNode
}

export function Layout({ className, children }: LayoutProps) {
  return (
    <div className={cn(
      "grid gap-x-8 gap-y-4",
      className
    )}>
      {children}
    </div>
  )
}
