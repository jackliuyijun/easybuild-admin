'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import type { LoginForm } from '@/types/user'
import { cn } from '@/lib/utils'

interface LoginFormProps {
    onSubmit: (data: LoginForm) => void;
    isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        loginAccount: '',
        password: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // 如果正在提交或加载中，直接返回
        if (isSubmitting || isLoading) return

        try {
            setIsSubmitting(true)
            await onSubmit(formData)
        } finally {
            setIsSubmitting(false)
        }
    }

    // 合并加载状态
    const isDisabled = isLoading || isSubmitting

    const inputStyles = cn(
        "h-12 bg-background/50 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all duration-300 pl-11",
        isDisabled && "opacity-50 cursor-not-allowed"
    )

    const labelStyles = "block text-sm font-medium mb-2 text-foreground/80 ml-1"

    const iconStyles = "absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground transition-colors duration-300 group-focus-within:text-primary"

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
                <div className="group">
                    <label className={labelStyles}>账号</label>
                    <div className="relative">
                        <Input
                            type="text"
                            required
                            minLength={2}
                            placeholder="输入账号..."
                            value={formData.loginAccount}
                            onChange={(e) => setFormData({ ...formData, loginAccount: e.target.value })}
                            className={inputStyles}
                            disabled={isDisabled}
                            title="请填写账号（至少2位字符）"
                            onInvalid={(e: any) => {
                                if (e.target.validity.valueMissing) {
                                    e.target.setCustomValidity('哎呀，是不是忘记填写账号了？')
                                } else if (e.target.validity.tooShort) {
                                    e.target.setCustomValidity('账号至少需要2位字符哦')
                                }
                            }}
                            onInput={(e: any) => {
                                e.target.setCustomValidity('')
                            }}
                        />
                        <div className={iconStyles}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="group">
                    <label className={labelStyles}>密码</label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            required
                            minLength={6}
                            placeholder="输入密码..."
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className={cn(inputStyles, "pr-14")}
                            disabled={isDisabled}
                            title="请填写密码（至少6位字符）"
                            onInvalid={(e: any) => {
                                if (e.target.validity.valueMissing) {
                                    e.target.setCustomValidity('密码可不能忘记输入哦')
                                } else if (e.target.validity.tooShort) {
                                    e.target.setCustomValidity('密码至少需要6位字符哦')
                                }
                            }}
                            onInput={(e: any) => {
                                e.target.setCustomValidity('')
                            }}
                        />
                        <div className={iconStyles}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={cn(
                                "absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none transition-colors duration-200",
                                isDisabled && "cursor-not-allowed opacity-50 pointer-events-none"
                            )}
                            disabled={isDisabled}
                        >
                            {!showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                className={cn(
                    "w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base",
                    "transition-all duration-300 shadow-[0_4px_12px_hsl(var(--primary)/0.2)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_16px_hsl(var(--primary)/0.3)] hover:-translate-y-0.5 active:translate-y-0",
                    isDisabled && "opacity-70 cursor-not-allowed hover:transform-none shadow-none"
                )}
                disabled={isDisabled}
            >
                {isDisabled ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>验证中...</span>
                    </div>
                ) : (
                    "登 录"
                )}
            </Button>
        </form>
    )
}

