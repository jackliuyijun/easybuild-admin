import * as React from "react"
import { cn } from "@/lib/utils"
import type { ErrorConfig } from './types'

interface ErrorProps extends ErrorConfig {
  message?: string
}

export function Error({
  message,
  position = 'bottom',
  offset,
  className,
  render
}: ErrorProps) {
  if (!message) return null
  
  if (render) {
    return render(message)
  }
  
  const getPositionStyle = () => {
    const style: React.CSSProperties = {}
    
    switch (position) {
      case 'bottom':
        style.bottom = offset?.y ?? -20
        style.left = offset?.x ?? 0
        break
      case 'right':
        style.top = offset?.y ?? '50%'
        style.right = offset?.x ?? -8
        style.transform = 'translateY(-50%)'
        break
      case 'top':
        style.top = offset?.y ?? -20
        style.left = offset?.x ?? 0
        break
    }
    
    return style
  }

  return (
    <div
      className={cn(
        "text-xs text-destructive",
        position === 'custom' ? 'static' : 'absolute',
        className
      )}
      style={getPositionStyle()}
    >
      {message}
    </div>
  )
}