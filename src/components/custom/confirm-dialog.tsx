'use client'

import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog"

const DIALOG_TYPES = {
    DANGER: 'danger',
    WARNING: 'warning',
    SUCCESS: 'success'
} as const

type DialogType = typeof DIALOG_TYPES[keyof typeof DIALOG_TYPES]

export interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void | Promise<void>
    type?: DialogType
    showWarning?: boolean
    warningText?: string
}

const commonStyles = {
    warningBg: "bg-yellow-50 dark:bg-yellow-900/20",
    warningBorder: "border-yellow-200 dark:border-yellow-900/50",
    warningText: "text-yellow-600 dark:text-yellow-400",
} as const

const typeStyles = {
    [DIALOG_TYPES.DANGER]: {
        icon: "text-red-500",
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "border-red-200 dark:border-red-900/50",
        button: "bg-red-500 hover:bg-red-600",
        title: "text-red-500",
        ...commonStyles
    },
    [DIALOG_TYPES.WARNING]: {
        icon: "text-yellow-500",
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        border: "border-yellow-200 dark:border-yellow-900/50", 
        button: "bg-yellow-500 hover:bg-yellow-600",
        title: "text-yellow-500",
        ...commonStyles
    },
    [DIALOG_TYPES.SUCCESS]: {
        icon: "text-green-500",
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-900/50",
        button: "bg-green-500 hover:bg-green-600", 
        title: "text-green-500",
        ...commonStyles
    }
} as const

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = "确认",
    cancelText = "取消",
    onConfirm,
    type = DIALOG_TYPES.DANGER,
    showWarning = false,
    warningText = "此操作不可恢复！"
}: ConfirmDialogProps) {
    const styles = typeStyles[type]

    const handleOpenChange = (open: boolean) => {
        onOpenChange(open)
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent 
                className={cn(
                    "sm:max-w-[425px] p-0",
                    "fixed top-[80px] left-1/2 -translate-x-1/2 translate-y-0",
                    "bg-custom-elementBg border border-border",
                    "shadow-lg rounded-lg overflow-hidden",
                    "transition-all duration-200 ease-out",
                    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
                    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                )}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/20">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-full",
                            styles.bg,
                            "transition-colors duration-200"
                        )}>
                            <AlertCircle className={cn("h-4.5 w-4.5", styles.icon)} />
                        </div>
                        <AlertDialogTitle className={cn(
                            "text-base font-medium leading-none",
                            styles.title
                        )}>
                            {title}
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="sr-only">
                        {title}确认对话框
                    </AlertDialogDescription>
                </div>

                <div className="px-6 py-5">
                    <div className="text-base text-muted-foreground">
                        <div className="space-y-4">
                            <p className="leading-relaxed">{description}</p>
                            {showWarning && (
                                <div className={cn(
                                    "flex items-center gap-3 p-3.5 rounded-lg",
                                    styles.warningBg,
                                    "border border-opacity-50",
                                    styles.warningBorder,
                                    "transition-colors duration-200"
                                )}>
                                    <AlertCircle className={cn(
                                        "h-4.5 w-4.5 flex-shrink-0",
                                        styles.warningText
                                    )} />
                                    <span className={cn(
                                        "text-sm font-medium leading-tight",
                                        styles.warningText
                                    )}>
                                        {warningText}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-border/20">
                    <AlertDialogCancel 
                        onClick={() => handleOpenChange(false)}
                        className={cn(
                            "min-w-[84px] h-8",
                            "hover:bg-muted/80 transition-colors duration-200"
                        )}
                    >
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        className={cn(
                            "min-w-[84px] h-8",
                            styles.button,
                            "text-white dark:text-white/90",
                            "transition-all duration-200",
                            "hover:opacity-90 active:scale-[0.98]"
                        )}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
} 