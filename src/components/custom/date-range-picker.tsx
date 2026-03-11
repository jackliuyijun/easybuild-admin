'use client'

import * as React from 'react'
import { format, addMonths, setHours, setMinutes, setSeconds, startOfDay, endOfDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, X, ChevronRight } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

interface DateRangePickerProps {
    className?: string
    startDate?: Date
    endDate?: Date
    onRangeChange: (start?: Date, end?: Date) => void
    placeholder?: string
}

export function DateRangePicker({
    className,
    startDate,
    endDate,
    onRangeChange,
    showTime = false,
    placeholder = '请选择日期范围'
}: DateRangePickerProps & { showTime?: boolean }) {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: startDate,
        to: endDate
    })
    const [isOpen, setIsOpen] = React.useState(false)

    // 时间状态
    const [startTime, setStartTime] = React.useState('00:00:00')
    const [endTime, setEndTime] = React.useState('23:59:59')

    const [leftMonth, setLeftMonth] = React.useState<Date>(startOfDay(startDate || new Date()))
    const [rightMonth, setRightMonth] = React.useState<Date>(addMonths(startOfDay(startDate || new Date()), 1))

    // 同步外部属性
    React.useEffect(() => {
        const from = startDate || new Date()
        const to = endDate || addMonths(from, 1)
        setDate({ from: startDate, to: endDate })
        setLeftMonth(startOfDay(from))
        setRightMonth(startOfDay(to > from ? to : addMonths(from, 1)))

        if (startDate) setStartTime(format(startDate, 'HH:mm:ss'))
        if (endDate) setEndTime(format(endDate, 'HH:mm:ss'))
    }, [startDate, endDate])

    const handleSelect = (range: DateRange | undefined) => {
        setDate(range)
    }

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDate(undefined)
        onRangeChange(undefined, undefined)
    }

    const applyTimeToDate = (date: Date, timeStr: string) => {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number)
        let newDate = setHours(date, hours || 0)
        newDate = setMinutes(newDate, minutes || 0)
        newDate = setSeconds(newDate, seconds || 0)
        return newDate
    }

    const handleTimeChange = (val: string, setter: (v: string) => void) => {
        // 只允许数字和冒号
        const cleaned = val.replace(/[^\d:]/g, '').slice(0, 8)
        setter(cleaned)
    }

    const isValidTime = (timeStr: string) => {
        const regex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/
        return regex.test(timeStr)
    }

    const handleConfirm = () => {
        if (date?.from) {
            if (showTime) {
                if (!isValidTime(startTime) || !isValidTime(endTime)) {
                    alert('请输入有效的时间格式 (HH:mm:ss)，例如 06:00:00')
                    return
                }
            }

            let start = startOfDay(date.from)
            let end = date.to ? startOfDay(date.to) : startOfDay(date.from)

            if (showTime) {
                start = applyTimeToDate(start, startTime)
                end = applyTimeToDate(end, endTime)
            } else {
                end = endOfDay(end)
            }

            onRangeChange(start, end)
        } else {
            onRangeChange(undefined, undefined)
        }
        setIsOpen(false)
    }

    const handleReset = () => {
        setDate(undefined)
        setStartTime('00:00:00')
        setEndTime('23:59:59')
    }

    const formatDisplayDate = (d?: Date, overrideTime?: string) => {
        if (!d) return ''
        const datePart = format(d, 'yyyy-MM-dd')
        if (showTime && overrideTime) {
            return `${datePart} ${overrideTime}`
        }
        return format(d, showTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd')
    }

    const displayText = React.useMemo(() => {
        if (!date?.from) return placeholder
        
        const startValid = !showTime || isValidTime(startTime)
        const endValid = !showTime || isValidTime(endTime)
        
        if (!startValid || !endValid) {
            return (
                <span className="text-red-500 font-medium">
                    {format(date.from, 'yyyy-MM-dd')} [时间格式错误]
                </span>
            )
        }

        return `${formatDisplayDate(date.from, startTime)} 至 ${formatDisplayDate(date.to || date.from, endTime)}`
    }, [date, startTime, endTime, showTime, placeholder])

    const commonCalendarProps = {
        mode: "range" as const,
        selected: date,
        onSelect: handleSelect,
        locale: zhCN,
        className: "p-1",
        formatters: {
            formatCaption: (date: Date) => format(date, 'yyyy 年 M 月', { locale: zhCN }),
        },
        classNames: {
            month: "space-y-1 p-1",
            caption: "flex justify-center pt-0 relative items-center mb-1 h-6",
            caption_label: "text-xs font-medium text-foreground",
            nav: "absolute inset-x-0 top-1 flex items-center justify-between px-2 w-full z-10",
            nav_button: cn(
                "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 text-muted-foreground"
            ),
            table: "w-full border-collapse space-y-0.5",
            head_row: "flex mb-0.5",
            head_cell: "text-muted-foreground rounded-md w-8 font-medium text-[10px] text-center",
            row: "flex w-full mt-0.5",
            cell: cn(
                "relative p-0 text-center text-xs focus-within:relative focus-within:z-20",
                "[&:has([aria-selected])]:bg-accent/50"
            ),
            day: cn(
                "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-full transition-all flex items-center justify-center text-[11px]"
            ),
            day_range_start: "day-range-start !bg-primary !text-primary-foreground !rounded-full",
            day_range_end: "day-range-end !bg-primary !text-primary-foreground !rounded-full",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "border border-primary/30 text-primary",
            day_outside: "text-muted-foreground opacity-20",
            day_disabled: "text-muted-foreground opacity-20",
            day_range_middle: "aria-selected:!bg-accent/50 aria-selected:!text-foreground !rounded-none",
            day_hidden: "invisible",
        }
    }

    return (
        <div className={cn('grid gap-2', className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={cn(
                            'w-full justify-start text-left font-normal h-9 bg-background border-input hover:bg-accent hover:text-accent-foreground group relative text-xs',
                            !date?.from && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary" />
                        <span className="flex-1 truncate pr-7">
                            {displayText}
                        </span>
                        {date?.from && (
                            <div
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent/80 transition-all z-20 cursor-pointer group/clear"
                                onClick={handleClear}
                            >
                                <X className="h-3.5 w-3.5 opacity-50 group-hover/clear:opacity-100 transition-opacity" />
                            </div>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border shadow-2xl" align="start">
                    <div className="flex flex-col">
                        {/* Body: Two Calendars */}
                        <div className="flex divide-x divide-border bg-popover">
                            {/* Left Calendar */}
                            <div className="relative">
                                <Calendar
                                    {...commonCalendarProps}
                                    month={leftMonth}
                                    onMonthChange={(m) => {
                                        if (m < rightMonth) setLeftMonth(m)
                                    }}
                                />
                            </div>
                            {/* Right Calendar */}
                            <div className="relative">
                                <Calendar
                                    {...commonCalendarProps}
                                    month={rightMonth}
                                    onMonthChange={(m) => {
                                        if (m > leftMonth) setRightMonth(m)
                                    }}
                                />
                            </div>
                        </div>

                        {/* Footer: Actions */}
                        <div className="flex items-center justify-between p-1.5 px-3 border-t border-border">
                            {showTime && (
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-2 h-7 bg-background border rounded-md group/time transition-all",
                                        !isValidTime(startTime) 
                                            ? "border-red-500 ring-1 ring-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.2)]" 
                                            : "border-border focus-within:ring-1 focus-within:ring-primary focus-within:border-primary"
                                    )}>
                                        <Clock className={cn(
                                            "h-3 w-3",
                                            !isValidTime(startTime) ? "text-red-400" : "text-muted-foreground group-focus-within/time:text-primary"
                                        )} />
                                        <input
                                            type="text"
                                            value={startTime}
                                            onChange={(e) => handleTimeChange(e.target.value, setStartTime)}
                                            className="w-16 h-full bg-transparent border-none outline-none text-[11px] font-mono text-foreground placeholder:text-muted-foreground"
                                            placeholder="00:00:00"
                                        />
                                    </div>
                                    <span className="text-muted-foreground text-[10px]">-</span>
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-2 h-7 bg-background border rounded-md group/time transition-all",
                                        !isValidTime(endTime) 
                                            ? "border-red-500 ring-1 ring-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.2)]" 
                                            : "border-border focus-within:ring-1 focus-within:ring-primary focus-within:border-primary"
                                    )}>
                                        <Clock className={cn(
                                            "h-3 w-3",
                                            !isValidTime(endTime) ? "text-red-400" : "text-muted-foreground group-focus-within/time:text-primary"
                                        )} />
                                        <input
                                            type="text"
                                            value={endTime}
                                            onChange={(e) => handleTimeChange(e.target.value, setEndTime)}
                                            className="w-16 h-full bg-transparent border-none outline-none text-[11px] font-mono text-foreground placeholder:text-muted-foreground"
                                            placeholder="23:59:59"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="ml-auto flex items-center gap-3">
                                <button
                                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={handleReset}
                                >
                                    清空
                                </button>
                                <Button
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-7 text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleConfirm}
                                    disabled={showTime && (!isValidTime(startTime) || !isValidTime(endTime))}
                                >
                                    确定
                                </Button>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
