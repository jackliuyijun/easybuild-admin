import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // 设置一个定时器，在delay毫秒后更新值
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 在下一次effect运行前或组件卸载时清除定时器
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
} 