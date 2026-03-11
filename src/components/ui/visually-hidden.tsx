import { cn } from "@/lib/utils"
import { HTMLAttributes } from "react"

export function VisuallyHidden({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden clip-[rect(0,0,0,0)] border-0",
        className
      )}
      {...props}
    />
  )
} 