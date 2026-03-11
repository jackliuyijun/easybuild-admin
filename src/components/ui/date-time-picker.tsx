"use client"

import * as React from "react"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import type { Locale } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { zhCN } from "date-fns/locale"

interface DateTimePickerProps {
  value?: Date | string | undefined
  onChange: (date: string | undefined) => void
  locale?: Locale
  placeholder?: string
}

export function DateTimePicker({
  value,
  onChange,
  locale = zhCN,
  placeholder = "选择日期和时间"
}: DateTimePickerProps) {
  // 将输入的value转换为Date对象
  const parseDate = (value: Date | string | undefined): Date | undefined => {
    if (!value) return undefined
    if (value instanceof Date) return value
    try {
      const date = new Date(value)
      return isNaN(date.getTime()) ? undefined : date
    } catch {
      return undefined
    }
  }

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(parseDate(value))

  // 更新时间部分
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedDate) return

    const [hours, minutes] = e.target.value.split(':')
    const newDate = new Date(selectedDate)
    newDate.setHours(parseInt(hours, 10))
    newDate.setMinutes(parseInt(minutes, 10))
    newDate.setSeconds(0) // 设置秒数为0
    setSelectedDate(newDate)
    onChange(format(newDate, 'yyyy-MM-dd HH:mm:ss'))
  }

  // 更新日期部分
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined)
      onChange(undefined)
      return
    }

    const newDate = new Date(date)
    // 如果已有选中时间，保留时间部分
    if (selectedDate) {
      newDate.setHours(selectedDate.getHours())
      newDate.setMinutes(selectedDate.getMinutes())
    } else {
      // 默认设置时间为 00:00
      newDate.setHours(0)
      newDate.setMinutes(0)
    }
    newDate.setSeconds(0)

    setSelectedDate(newDate)
    onChange(format(newDate, 'yyyy-MM-dd HH:mm:ss'))
  }

  // 同步外部value变化
  React.useEffect(() => {
    const parsedDate = parseDate(value)
    if (parsedDate?.getTime() !== selectedDate?.getTime()) {
      setSelectedDate(parsedDate)
    }
  }, [value])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "yyyy-MM-dd HH:mm:ss", { locale })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={locale}
            initialFocus
          />
          <div className="flex items-center gap-2 px-1 border-t pt-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              onChange={handleTimeChange}
              value={selectedDate ? format(selectedDate, 'HH:mm') : ''}
              className="w-[120px] border-0 p-0 focus-visible:ring-0"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 