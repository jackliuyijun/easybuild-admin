'use client'

import { useRouter } from 'next/navigation'
import { LoginForm } from './login-form'
import { loginConfig } from '@/config/login/login-config'
import { API_URLS } from '@/config/api-url'
import type { LoginForm as LoginFormType } from '@/types/user'
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { http } from '@/api/http'
import { useState, useEffect } from 'react'
import CryptoJS from 'crypto-js'
import { showMessage, showError } from '@/components/custom/notifications'
import { Loader2, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TokenContent, TokenData } from '@/types/token'
import { themeColors, type ThemeColor } from '@/config/theme-colors'

const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))

        const tokenData = JSON.parse(jsonPayload) as TokenData
        const content = JSON.parse(tokenData.content) as TokenContent
        return content
    } catch (error) {
        console.error('Token parsing failed:', error)
        return null
    }
}

export default function Login() {
    const router = useRouter()
    const { toast } = useToast()
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setMounted(true)
        // 应用保存的主题颜色
        const saved = localStorage.getItem('theme-color') as ThemeColor
        if (saved && themeColors[saved]) {
            applyThemeColor(saved)
        }
    }, [])

    // 当深浅模式切换时，重新应用主题颜色
    useEffect(() => {
        if (mounted) {
            const saved = localStorage.getItem('theme-color') as ThemeColor
            if (saved && themeColors[saved]) {
                applyThemeColor(saved)
            }
        }
    }, [resolvedTheme, mounted])

    const applyThemeColor = (color: ThemeColor) => {
        const root = document.documentElement
        const colors = themeColors[color]
        const isDark = resolvedTheme === 'dark'
        const colorSet = isDark ? colors.dark : colors.light

        Object.entries(colorSet).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value)
        })
    }

    const handleSubmit = async (data: LoginFormType) => {
        try {
            setIsLoading(true)
            const encryptedData = {
                ...data,
                password: CryptoJS.MD5(data.password).toString(),
                type: 'account'
            }
            const response = await http.post(API_URLS.auth.login, encryptedData)
            const res = response.data;
            // 存储 token
            localStorage.setItem('access-token', res.accessToken)

            // 解析并存储用户信息
            const userInfo = parseJwt(res.accessToken)
            if (userInfo) {
                localStorage.setItem('user-info', JSON.stringify(userInfo))
            }

            showMessage({
                title: "登录成功",
                description: "欢迎回来！"
            })

            router.push('/')
        } catch (error: any) {
            showError({
                title: "登录失败",
                description: error.message
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
            {/* 静态高级背景装饰 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-[0.08] dark:opacity-[0.12] blur-[100px]"
                    style={{ backgroundColor: 'hsl(var(--primary))' }}
                />
                <div
                    className="absolute -bottom-[15%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-[0.08] dark:opacity-[0.12] blur-[100px]"
                    style={{ backgroundColor: 'hsl(var(--primary))' }}
                />
            </div>

            {/* 精细背景网格 - 降低不透明度使其更柔和 */}
            <div
                className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.04]"
                style={{
                    backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                    color: 'hsl(var(--foreground))'
                }}
            />

            {/* 登录容器 - 强化磨砂质感，移除入场缩放动画 */}
            <div className={cn(
                "relative z-10 w-full max-w-[440px] px-6 py-12 sm:px-12",
                "bg-card/40 backdrop-blur-2xl rounded-[2rem] border border-border/40 shadow-2xl",
                "animate-in fade-in duration-1000 ease-in-out",
                isLoading && "opacity-90 pointer-events-none"
            )}>
                {/* 顶部微光线条 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                {/* 加载遮罩 - 移除 ping 动画，保持简约旋转 */}
                {isLoading && (
                    <div className="absolute inset-0 bg-background/40 backdrop-blur-md rounded-[2rem] flex items-center justify-center z-50">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary/80" />
                            <span className="text-sm font-medium text-foreground/70 tracking-wide">安全验证中</span>
                        </div>
                    </div>
                )}

                <div className="text-center space-y-3 mb-10">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-2 ring-1 ring-primary/20 shadow-sm transition-all duration-300">
                        <div className="w-10 h-10 flex items-center justify-center bg-primary rounded-xl shadow-md">
                            <span className="text-[16px] font-black text-primary-foreground">EB</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {loginConfig.name}
                    </h1>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">
                            {loginConfig.description}
                        </p>
                        <p className="text-xs text-muted-foreground/60 leading-relaxed">
                            {loginConfig.subDescription}
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
                </div>

                {/* 底部版权或链接 */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground/40">
                        &copy; {new Date().getFullYear()} {loginConfig.name}. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}

