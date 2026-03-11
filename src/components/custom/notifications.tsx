import * as React from "react"
import { toast } from "@/hooks/use-toast"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Info,
  Bell,
  AlertTriangle,
  Ban,
  ShieldAlert,
  ShieldCheck,
  CheckCheck
} from "lucide-react"

interface NotificationOptions {
  title: string
  description?: string
  duration?: number
  icon?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'alert' | 'ban' | 'shield' | 'check'
}

const commonStyles = "max-w-[360px] p-3 rounded-lg"
const topCenterStyles = "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 shadow-lg animate-slide-in-from-top-full"

// 图标映射配置
const IconMap = {
  default: CheckCircle2,
  success: CheckCheck,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  alert: Bell,
  ban: Ban,
  shield: ShieldAlert,
  check: ShieldCheck
}

const ToastContent = ({
  icon,
  title,
  description,
  iconColor
}: {
  icon: React.ElementType,
  title: string,
  description?: string,
  iconColor: string
}) => {
  const Icon = icon
  return (
    <div className="flex gap-3">
      <div className={`mt-[2px] ${iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <div className="font-medium">{title}</div>
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
      </div>
    </div>
  )
}

/**
 * 显示成功消息提示
 */
export const showMessage = ({
  title,
  description = "",
  duration = 3000,
  icon = 'success'
}: NotificationOptions) => {
  const Icon = IconMap[icon] || IconMap.success
  toast({
    title: <ToastContent
      icon={Icon}
      title={title}
      description={description}
      iconColor="text-green-500"
    /> as any,
    className: `${commonStyles} bg-background border-green-100 dark:border-green-900/50`,
    duration,
  })
}

/**
 * 显示错误消息提示 - 顶部居中掉落
 */
export const showError = ({
  title,
  description = "",
  duration = 3000,
  icon = 'error'
}: NotificationOptions) => {
  const Icon = IconMap[icon] || IconMap.error
  toast({
    title: <ToastContent
      icon={Icon}
      title={title}
      description={description}
      iconColor="text-red-500"
    /> as any,
    className: `${commonStyles} ${topCenterStyles} bg-background/95 backdrop-blur-sm border-red-100 dark:border-red-900/50`,
    duration,
  })
}

/**
 * 显示警告消息提示 - 顶部居中掉落
 */
export const showWarning = ({
  title,
  description = "",
  duration = 3000,
  icon = 'warning'
}: NotificationOptions) => {
  const Icon = IconMap[icon] || IconMap.warning
  toast({
    title: <ToastContent
      icon={Icon}
      title={title}
      description={description}
      iconColor="text-yellow-500"
    /> as any,
    className: `${commonStyles} ${topCenterStyles} bg-background/95 backdrop-blur-sm border-yellow-100 dark:border-yellow-900/50`,
    duration,
  })
}

/**
 * 显示加载中消息提示
 */
export const showLoading = ({
  title,
  description = "",
  duration = 0
}: NotificationOptions) => {
  return toast({
    title: <ToastContent
      icon={Loader2}
      title={title}
      description={description}
      iconColor="text-blue-500"
    /> as any,
    className: `${commonStyles} bg-background border-blue-100 dark:border-blue-900/50`,
    duration,
  })
} 