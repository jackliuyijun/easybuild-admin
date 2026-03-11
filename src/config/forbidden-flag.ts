// 定义状态类型
export type ForbiddenFlagType = 'enable' | 'disable'

// 状态配置
export const FORBIDDEN_FLAG_CONFIG = {
  enable: {
    value: 0,
    label: "启用",
    className: "bg-green-500/20 text-green-500 hover:bg-green-500/30",
    actionClassName: "text-yellow-500 hover:text-yellow-500",
    actionText: "禁用",
    confirmType: "warning",
    confirmTitle: "禁用确认",
    confirmText: "确认禁用"
  },
  disable: {
    value: 1,
    label: "禁用",
    className: "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30",
    actionClassName: "text-green-500 hover:text-green-500",
    actionText: "启用",
    confirmType: "success",
    confirmTitle: "启用确认",
    confirmText: "确认启用"
  }
} as const

// 状态选项
export const FORBIDDEN_FLAG_OPTIONS = [
  { label: '全部', value: undefined },
  { label: FORBIDDEN_FLAG_CONFIG.enable.label, value: FORBIDDEN_FLAG_CONFIG.enable.value },
  { label: FORBIDDEN_FLAG_CONFIG.disable.label, value: FORBIDDEN_FLAG_CONFIG.disable.value }
] as const

// 获取状态配置的辅助函数
export function getForbiddenFlagConfig(forbiddenFlag: number | undefined) {
  return forbiddenFlag === FORBIDDEN_FLAG_CONFIG.disable.value 
    ? FORBIDDEN_FLAG_CONFIG.disable 
    : FORBIDDEN_FLAG_CONFIG.enable
} 