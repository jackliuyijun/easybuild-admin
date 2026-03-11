"use client"

import React, { useEffect, useState, useCallback, memo } from "react"
import { useTheme } from "next-themes"
import {
  Languages,
  Bell,
  Palette,
  Moon,
  Sun,
  Check,
  Settings,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { themeColors, themeColorOptions, type ThemeColor } from "@/config/theme-colors"

export const HeaderActions = memo(function HeaderActions() {
  const { theme, setTheme } = useTheme()
  const [themeColor, setThemeColor] = useState<ThemeColor>("original-cyan")
  const [mounted, setMounted] = useState(false)

  // 确保组件已挂载（避免 hydration 错误）
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme-color") as ThemeColor
    if (saved && themeColors[saved]) {
      setThemeColor(saved)
      applyThemeColor(saved)
    }
  }, [])

  // 当深浅模式切换时，重新应用主题颜色
  useEffect(() => {
    if (mounted) {
      applyThemeColor(themeColor)
    }
  }, [theme, themeColor, mounted])

  const applyThemeColor = useCallback((color: ThemeColor) => {
    const root = document.documentElement
    const colors = themeColors[color]
    const isDark = theme === "dark"
    const colorSet = isDark ? colors.dark : colors.light

    Object.entries(colorSet).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
  }, [theme])

  const handleColorChange = useCallback((color: ThemeColor) => {
    setThemeColor(color)
    applyThemeColor(color)
    localStorage.setItem("theme-color", color)
  }, [applyThemeColor])

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  return (
    <div className="flex items-center gap-1">
      <TooltipProvider delayDuration={0}>
        {/* 语言切换 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => console.log("切换语言")}
            >
              <Languages className="h-4 w-4 text-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>语言切换</TooltipContent>
        </Tooltip>

        {/* 通知中心 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => console.log("通知")}
            >
              <Bell className="h-4 w-4 text-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>通知中心</TooltipContent>
        </Tooltip>

        {/* 深浅主题切换 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleTheme}
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-4 w-4 text-primary" />
              ) : (
                <Moon className="h-4 w-4 text-primary" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {mounted && theme === "dark" ? "浅色模式" : "深色模式"}
          </TooltipContent>
        </Tooltip>

        {/* 主题颜色 */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Palette className="h-4 w-4 text-primary" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>主题颜色</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-[280px] p-4 rounded-2xl shadow-2xl border-border/40 backdrop-blur-md bg-background/95">
            <DropdownMenuLabel className="px-1 pb-4 text-[13px] font-bold text-muted-foreground/90 tracking-widest uppercase flex items-center gap-2">
              <div className="size-1 rounded-full bg-primary animate-pulse" />
              主题色彩中心
            </DropdownMenuLabel>
            <div className="grid grid-cols-5 gap-3">
              {mounted &&
                themeColorOptions.map((option) => (
                  <Tooltip key={option.value}>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => handleColorChange(option.value)}
                        className={`
                          group relative flex size-9 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200
                          hover:scale-110 hover:shadow-md active:scale-95
                          ${themeColor === option.value ? 'border-primary ring-2 ring-primary/20 bg-accent/30' : 'border-border/40 bg-transparent hover:bg-accent/20'}
                        `}
                      >
                        <div
                          className="size-6 rounded-full shadow-inner border border-black/5"
                          style={{
                            backgroundColor: `hsl(${themeColors[option.value].light.primary})`,
                          }}
                        />
                        {themeColor === option.value && (
                          <div className="absolute -right-1 -top-1 size-3.5 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-background">
                            <Check className="size-2 text-primary-foreground stroke-[4px]" />
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[11px] px-2 py-1">
                      {option.label}
                    </TooltipContent>
                  </Tooltip>
                ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    </div>
  )
})
