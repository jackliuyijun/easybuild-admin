"use client"

import * as React from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Option {
  label: string
  value: string | number
}

interface MultiSelectProps {
  options: Option[]
  value?: string[] | string | number
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  popoverProps?: any
  onSearch?: (keyword: string) => Promise<Option[]>
  searchDebounce?: number
  multiple?: boolean
  disabled?: boolean
}

export function MultiSelect({
  options: initialOptions,
  value = '',
  onChange,
  placeholder = "请选择...",
  className,
  popoverProps,
  onSearch,
  searchDebounce = 800,
  multiple = true,
  disabled = false
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [options, setOptions] = React.useState(initialOptions)
  const lastSearchRef = React.useRef("")
  const isHandlingSelectRef = React.useRef(false)

  const debouncedSearch = React.useCallback(
    debounce(async (value: string) => {
      if (!onSearch || value === lastSearchRef.current) return
      lastSearchRef.current = value
      setLoading(true)
      try {
        const results = await onSearch(value)
        setOptions(results)
      } finally {
        setLoading(false)
      }
    }, searchDebounce),
    [onSearch, searchDebounce]
  )

  const normalizedValue = React.useMemo(() => {
    if (!value) return []
    if (Array.isArray(value)) return value.map(String)
    return multiple ? String(value).split(',').filter(Boolean) : [String(value)]
  }, [value, multiple])

  const selectedOptions = React.useMemo(() =>
    options.filter(option =>
      normalizedValue.includes(String(option.value))
    ), [options, normalizedValue]
  )

  // 更新选项列表
  React.useEffect(() => {
    setOptions(initialOptions)
  }, [initialOptions])

  const handleSelect = React.useCallback((currentValue: string) => {
    const isSelected = normalizedValue.includes(currentValue)

    if (multiple) {
      const newValues = isSelected
        ? normalizedValue.filter(v => v !== currentValue)
        : [...normalizedValue, currentValue]
      onChange(newValues.join(','))
    } else {
      // 如果值没有变化，不触发 onChange
      if (value === currentValue) {
        setOpen(false)
        return
      }

      // 直接触发 onChange，不使用 requestAnimationFrame
      onChange(currentValue)
      setOpen(false)
    }
  }, [normalizedValue, onChange, multiple, value])

  const handleRemove = React.useCallback((optionValue: Option['value'], e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!multiple) {
      onChange('')
      return
    }

    const newValues = normalizedValue.filter(v => v !== String(optionValue))
    onChange(newValues.join(','))
  }, [multiple, normalizedValue, onChange])

  // 处理弹窗状态变化
  const handleOpenChange = React.useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
  }, [])

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex h-[40px] w-full rounded-md border border-input bg-transparent text-sm transition-colors",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "justify-between items-center px-3",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 justify-start items-center flex-1 -ml-0.5">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className={cn(
                    "mr-1 flex items-center h-[28px]",
                    "!font-normal !text-[13px]"
                  )}
                >
                  {option.label}
                  <span
                    className="ml-1 rounded-full outline-none cursor-pointer"
                    onClick={(e) => handleRemove(option.value, e)}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground ml-2">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("p-0", popoverProps?.className)} {...popoverProps}>
        <div className="flex flex-col">
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <input
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value
                setSearchQuery(value)
                debouncedSearch(value)
              }}
              placeholder={`搜索${placeholder}`}
              className="flex h-10 w-full rounded-md bg-transparent py-3 pl-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div
            className="max-h-[300px] overflow-auto scrollbar-custom"
            onWheel={(e) => {
              e.stopPropagation();
              const target = e.currentTarget;
              if (target) {
                target.scrollTop += e.deltaY;
              }
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : options.length === 0 ? (
              <div className="relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-muted-foreground">
                未找到选项
              </div>
            ) : (
              options.map((option) => {
                const isSelected = normalizedValue.includes(String(option.value))
                return (
                  <div
                    key={option.value}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    onClick={() => handleSelect(String(option.value))}
                  >
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm mr-2",
                      multiple ? "border border-primary" : "rounded-full border border-primary",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50"
                    )}>
                      {isSelected && (
                        multiple ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        )
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
} 