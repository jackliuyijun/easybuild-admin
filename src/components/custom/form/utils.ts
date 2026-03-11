import type { FormField } from './types'

// 使用 WeakMap 缓存格式化结果
const formatCache = new WeakMap()

// 格式化表单数据
export function formatFormData(data: Record<string, any>, fields: FormField[]) {
  // 检查缓存
  const cacheKey = { data, fields }
  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey)
  }

  const result = Object.entries(data).reduce((acc, [key, value]) => {
    const field = fields.find(f => f.name === key)

    if (field?.transform?.input) {
      acc[key] = field.transform.input(value)
    } else {
      acc[key] = formatValue(value)
    }

    return acc
  }, {} as Record<string, any>)

  // 缓存结果
  formatCache.set(cacheKey, result)
  return result
}

// 优化值格式化
function formatValue(value: any): any {
  if (typeof value === 'string' && !isNaN(Number(value))) {
    return Number(value)
  }

  if (Array.isArray(value)) {
    return value.map(formatValue)
  }

  return value
}

// 处理表单提交数据
export function formatSubmitData(data: Record<string, any>, fields: FormField[]) {
  return Object.entries(data).reduce((acc, [key, value]) => {
    const field = fields.find(f => f.name === key)

    if (field?.transform?.output) {
      acc[key] = field.transform.output(value)
    } else {
      acc[key] = value
    }

    return acc
  }, {} as Record<string, any>)
}

// 处理数字值
export function formatNumberValue(
  value: string | number,
  options?: {
    min?: number
    max?: number
    precision?: number
    step?: number
  }
) {
  if (!options) return value

  const { min, max, precision = 0 } = options
  let numValue = Number(value)

  if (isNaN(numValue)) return ''

  if (min !== undefined) numValue = Math.max(min, numValue)
  if (max !== undefined) numValue = Math.min(max, numValue)
  if (precision >= 0) {
    numValue = Number(numValue.toFixed(precision))
  }

  return numValue
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      fn(...args)
      lastCall = now
    }
  }
}

// 批量更新
export function batchUpdate(callback: () => void) {
  Promise.resolve().then(callback)
}
