'use client'

import * as React from "react"
import { Dialog, DialogContent, DialogClose, DialogTitle } from "../ui/dialog"
import { VisuallyHidden } from "../ui/visually-hidden"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { LoadingSpinner } from "../ui/loading-spinner"

interface CustomDialogProps extends React.HTMLAttributes<HTMLDivElement> {
    open: boolean
    onOpenChange: (open: boolean) => void
    header: React.ReactNode
    footer: React.ReactNode
    title?: string
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | string
    width?: string
    height?: string
    headerHeight?: string
    footerHeight?: string
    children?: React.ReactNode
    loading?: boolean
    submitting?: boolean
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
}

export function CustomDialog({
    open,
    onOpenChange,
    header,
    footer,
    title = "对话框",
    maxWidth = '3xl',
    width,
    height,
    headerHeight,
    footerHeight,
    children,
    className,
    loading,
    submitting,
    ...props
}: CustomDialogProps) {
    const widthClass = maxWidthClasses[maxWidth as keyof typeof maxWidthClasses] || ''
    const [isMaximized, setIsMaximized] = React.useState(false)

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            modal={true}
        >
            <DialogContent
                className={cn(
                    !width && !isMaximized && widthClass,
                    "flex flex-col p-0 gap-1",
                    "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                    !width && !isMaximized && typeof maxWidth === 'string' && !maxWidthClasses[maxWidth as keyof typeof maxWidthClasses]
                        ? 'w-[1400px]'
                        : !width && !isMaximized ? 'w-[90vw]' : '',
                    isMaximized && "w-screen h-screen max-w-none rounded-none",
                    className && !isMaximized ? className : '',
                )}
                style={{
                    maxHeight: isMaximized ? 'none' : height ? 'none' : '90vh',
                    height: isMaximized ? '100vh' : height,
                    width: isMaximized ? '100vw' : width,
                    maxWidth: isMaximized ? 'none' : undefined,
                }}
                {...props}
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {/* 隐藏的标题用于屏幕阅读器 */}
                <VisuallyHidden>
                    <DialogTitle>{title}</DialogTitle>
                </VisuallyHidden>

                {/* 最大化按钮 */}
                <button
                    onClick={() => setIsMaximized(prev => !prev)}
                    className="absolute right-11 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    title={isMaximized ? "还原" : "最大化"}
                >
                    <div className="h-4 w-4 flex items-center justify-center">
                        {isMaximized ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                                <path d="M9 9h6v6H9z" />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                            </svg>
                        )}
                    </div>
                </button>

                {/* 加载状态 */}
                {(loading || submitting) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px] z-50 rounded-lg">
                        <div className="flex flex-col items-center gap-2">
                            <LoadingSpinner className="w-8 h-8" />
                            <span className="text-sm text-muted-foreground">
                                {submitting ? '提交中...' : '数据加载中...'}
                            </span>
                        </div>
                    </div>
                )}

                {/* 头部 */}
                <div
                    className="flex-shrink-0"
                    style={headerHeight ? { minHeight: headerHeight } : undefined}
                >
                    <div className="px-6 flex items-center py-3">
                        {header}
                    </div>
                </div>

                {/* 可滚动的内容区域 */}
                <div className="flex-1 overflow-y-auto px-6 pt-0 pb-2">
                    {children}
                </div>

                {/* 底部 */}
                <div
                    className="flex-shrink-0"
                    style={footerHeight ? { minHeight: footerHeight } : undefined}
                >
                    <div className="px-6 flex items-center py-3">
                        {footer}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
