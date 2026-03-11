'use client'

import { cn } from "@/lib/utils"
import { Button } from "./button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./select"
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from "@/config/pagination"
import { PAGINATION_LOCALES } from "@/config/i18n/pagination"
import { useLocale } from "@/hooks/use-locale"

interface PaginationProps {
    total: number
    current: number
    pageSize?: number
    pageSizeOptions?: number[]
    onChange: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
    className?: string
}

export function Pagination({
    total,
    current,
    pageSize = DEFAULT_PAGE_SIZE,
    pageSizeOptions = PAGE_SIZE_OPTIONS,
    onChange,
    onPageSizeChange,
    className
}: PaginationProps) {
    // 使用 hook 获取系统语言
    const locale = useLocale()
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const i18n = PAGINATION_LOCALES[locale]
    
    // 生成页码数组
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        
        // 添加页码或省略号
        const addPage = (page: number) => pages.push(page)
        const addEllipsis = () => pages.push('...')
        
        // 始终显示第一页
        addPage(1)
        
        if (current > 3) {
            addEllipsis()
        }
        
        // 当前页附近的页码
        for (let i = Math.max(2, current - 1); i <= Math.min(current + 1, totalPages - 1); i++) {
            addPage(i)
        }
        
        if (current < totalPages - 2) {
            addEllipsis()
        }
        
        // 显示最后一页
        if (totalPages > 1) {
            addPage(totalPages)
        }
        
        return pages
    }

    return (
        <div className={cn(
            "flex items-center justify-between",
            className
        )}>
            <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                    {i18n.total.replace('{total}', total.toString())}
                </span>
                
                {onPageSizeChange && (
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions.map(size => (
                                <SelectItem 
                                    key={size} 
                                    value={size.toString()}
                                >
                                    {i18n.pageSizeOptions[size.toString() as keyof typeof i18n.pageSizeOptions]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
            
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(current - 1)}
                    disabled={current === 1}
                    className="px-3"
                >
                    ‹ {i18n.prevPage}
                </Button>
                
                {getPageNumbers().map((pageNum, index) => (
                    pageNum === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                            {pageNum}
                        </span>
                    ) : (
                        <Button
                            key={pageNum}
                            variant={current === pageNum ? "default" : "ghost"}
                            size="sm"
                            onClick={() => onChange(pageNum as number)}
                            className={cn(
                                "min-w-[32px] h-8 px-0",
                                current === pageNum && "bg-accent text-accent-foreground"
                            )}
                        >
                            {pageNum}
                        </Button>
                    )
                ))}
                
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(current + 1)}
                    disabled={current === totalPages}
                    className="px-3"
                >
                    {i18n.nextPage} ›
                </Button>
            </div>
        </div>
    )
} 