'use client'

import { useMemo } from 'react'
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination } from "@/components/ui/pagination"
import type { TableProps, TableColumn } from "./custom-table.types"
import { DEFAULT_HEIGHTS, TABLE_STYLES } from "./table-config"
import { CheckedState } from "@radix-ui/react-checkbox"

const CustomTable = <T extends Record<string, any>>({
    data,
    columns,
    config,
    loading,
    rowKey = 'id',
    className,
    selection,
    bordered = false,
    pagination,
    border = 'bottom',
    onHeaderClick,
    onRowClick,
    onRowDoubleClick,
    onRowContextMenu,
    onRowMouseEnter,
    onRowMouseLeave,
    onCellClick,
    emptyText,
}: TableProps<T>) => {
    // 合并默认配置
    const tableConfig = useMemo(() => ({
        headerHeight: config?.headerHeight,
        rowHeight: config?.rowHeight,
        footerHeight: config?.footerHeight,
        ...config
    }), [config])

    // 行键处理
    const getRowKey = useMemo(() => {
        return (record: T, index: number): string => {
            if (typeof rowKey === 'function') {
                return rowKey(record)
            }
            return (record as any)[rowKey]?.toString() || index.toString()
        }
    }, [rowKey])

    // 计算固定列的位置
    const getFixedStyle = (column: TableColumn<T>, columnIndex: number) => {
        if (!column.fixed) return {}

        let offset = 0
        if (column.fixed === 'left') {
            // 计算左侧固定列的偏移
            // 如果有选择框，需要加上选择框的宽度
            if (selection) {
                offset += TABLE_STYLES.CHECKBOX_WIDTH
            }
            // 计算之前所有左固定列的宽度
            for (let i = 0; i < columnIndex; i++) {
                const col = columns[i]
                if (col.fixed === 'left') {
                    offset += Number(col.width || 0)
                }
            }
        } else {
            // 计算右侧固定列的偏移
            for (let i = columns.length - 1; i > columnIndex; i--) {
                const col = columns[i]
                if (col.fixed === 'right') {
                    offset += Number(col.width || 0)
                }
            }
        }

        return {
            [column.fixed]: `${offset}px`
        }
    }

    // 获取边框样式
    const getBorderStyle = (isLastRow?: boolean) => {
        if (border === 'none') return ''
        if (border === 'all') return TABLE_STYLES.BORDERS.ALL
        if (border === 'top') return TABLE_STYLES.BORDERS.TOP
        // 下边框且不是最后一行
        if (border === 'bottom' && !isLastRow) return TABLE_STYLES.BORDERS.BOTTOM
        return ''
    }

    // 使用 getHeightClass 替代 HEIGHT_STYLES
    const getHeightClass = (height: number) => {
        if (height === DEFAULT_HEIGHTS.HEADER) return 'h-16'
        if (height === DEFAULT_HEIGHTS.ROW) return 'h-16'
        if (height === DEFAULT_HEIGHTS.FOOTER) return 'h-16'
        return ''
    }

    return (
        <div className={cn(
            "relative w-full h-full flex flex-col overflow-hidden",
            className
        )}>
            <div className="flex-1 relative">
                <div
                    className={cn(
                        "absolute top-0 left-0 right-0 bg-sidebar z-10",
                        !tableConfig.headerHeight && getHeightClass(DEFAULT_HEIGHTS.HEADER),
                        getBorderStyle()
                    )}
                    style={tableConfig.headerHeight ? { height: tableConfig.headerHeight } : undefined}
                />

                <div className="absolute inset-0 overflow-auto scrollbar-table">
                    <div className="min-w-full inline-block align-middle relative">
                        <table className="w-full border-collapse text-sm table-fixed">
                            {/* 列宽定义 */}
                            <colgroup>
                                {selection && (
                                    <col style={{ width: TABLE_STYLES.CHECKBOX_WIDTH, minWidth: TABLE_STYLES.CHECKBOX_WIDTH }} />
                                )}
                                {columns.map(column => (
                                    <col
                                        key={column.key}
                                        style={{
                                            width: column.width,
                                            minWidth: column.width,
                                            maxWidth: column.width
                                        }}
                                    />
                                ))}
                            </colgroup>

                            {/* 表头 */}
                            <thead>
                                <tr
                                    className={cn(
                                        "sticky top-0 z-20 bg-sidebar",
                                        !tableConfig.headerHeight && getHeightClass(DEFAULT_HEIGHTS.HEADER),
                                        getBorderStyle(false)
                                    )}
                                    style={tableConfig.headerHeight ? { height: tableConfig.headerHeight } : undefined}
                                >
                                    {/* 选择列表头 */}
                                    {selection && (
                                        <th className={cn(
                                            TABLE_STYLES.CELL.CHECKBOX,
                                            "h-12 align-middle font-bold text-muted-foreground",
                                            "sticky left-0 bg-sidebar z-30"
                                        )}>
                                            <div className="flex justify-center items-center w-full">
                                                <Checkbox
                                                    checked={
                                                        selection.selectedRowKeys.length > 0 &&
                                                            selection.selectedRowKeys.length < data.length
                                                            ? "indeterminate"
                                                            : data.length > 0 && selection.selectedRowKeys.length === data.length
                                                    }
                                                    onCheckedChange={(checked: CheckedState) => {
                                                        const newKeys = checked === true
                                                            ? data.map((_, index) => getRowKey(data[index], index))
                                                            : []
                                                        selection.onChange(newKeys)
                                                    }}
                                                />
                                            </div>
                                        </th>
                                    )}

                                    {/* 数据列表头 */}
                                    {columns.map((column, columnIndex) => (
                                        <th
                                            key={column.key}
                                            className={cn(
                                                "h-12 px-4 align-middle font-bold text-muted-foreground",
                                                // 第一列始终左对齐，保持一致的左边距
                                                columnIndex === 0 ? "text-left" : (
                                                    column.align === 'center' && "text-center"
                                                ),
                                                columnIndex !== 0 && column.align === 'right' && "text-right",
                                                // 固定列样式
                                                column.fixed === 'left' && "sticky left-0 bg-sidebar z-30",
                                                column.fixed === 'right' && "sticky right-0 bg-sidebar z-30"
                                            )}
                                            style={{
                                                width: column.width,
                                                minWidth: column.width,
                                                maxWidth: column.width,
                                                ...(column.fixed ? getFixedStyle(column, columnIndex) : undefined)
                                            }}
                                            onClick={(e) => onHeaderClick?.(column, e)}
                                        >
                                            <div className={cn(
                                                "flex items-center h-full",
                                                // 第一列始终左对齐
                                                columnIndex === 0 ? "justify-start" : (
                                                    column.align === 'center' && "justify-center"
                                                ),
                                                columnIndex !== 0 && column.align === 'right' && "justify-end",
                                                columnIndex !== 0 && (!column.align || column.align === 'left') && "justify-start"
                                            )}>
                                                {column.title}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* 表体 */}
                            <tbody className="relative">
                                {data.length === 0 && !loading ? (
                                    <tr>
                                        <td
                                            colSpan={selection ? columns.length + 1 : columns.length}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            {emptyText || "暂无数据"}
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((record, index) => (
                                        <tr
                                            key={getRowKey(record, index)}
                                            className={cn(
                                                DEFAULT_HEIGHTS.ROW,
                                                "group transition-colors hover:bg-muted/50",
                                                getBorderStyle(index === data.length - 1),
                                                !tableConfig.rowHeight && getHeightClass(DEFAULT_HEIGHTS.ROW)
                                            )}
                                            onClick={(e) => onRowClick?.(record, index, e)}
                                            onDoubleClick={(e) => onRowDoubleClick?.(record, index, e)}
                                            onContextMenu={(e) => onRowContextMenu?.(record, index, e)}
                                            onMouseEnter={(e) => onRowMouseEnter?.(record, index, e)}
                                            onMouseLeave={(e) => onRowMouseLeave?.(record, index, e)}
                                            style={tableConfig.rowHeight ? { height: tableConfig.rowHeight } : undefined}
                                        >
                                            {/* 内容省略...保持原本的渲染逻辑 */}
                                            {/* 选择列 */}
                                            {selection && (
                                                <td className={cn(
                                                    TABLE_STYLES.CELL.CHECKBOX,
                                                    "align-middle",
                                                    "sticky left-0 z-10 bg-background dark:bg-[#121215] group-hover:bg-muted/50 transition-colors"
                                                )}>
                                                    <div className="flex justify-center items-center w-full">
                                                        <Checkbox
                                                            checked={selection.selectedRowKeys.includes(getRowKey(record, index))}
                                                            onCheckedChange={(checked: CheckedState) => {
                                                                const key = getRowKey(record, index)
                                                                const newKeys = checked === true
                                                                    ? [...selection.selectedRowKeys, key]
                                                                    : selection.selectedRowKeys.filter(k => k !== key)
                                                                selection.onChange(newKeys)
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            )}

                                            {/* 数据列 */}
                                            {columns.map((column, columnIndex) => (
                                                <td
                                                    key={column.key}
                                                    className={cn(
                                                        column.className || "p-4",
                                                        "align-middle",
                                                        "overflow-hidden",
                                                        // 第一列始终左对齐，保持一致的左边距
                                                        columnIndex === 0 ? "text-left" : (
                                                            column.align === 'center' && "text-center"
                                                        ),
                                                        columnIndex !== 0 && column.align === 'right' && "text-right",
                                                        column.fixed === 'left' && "sticky left-0 z-10 bg-background dark:bg-[#121215] group-hover:bg-muted/50 transition-colors",
                                                        column.fixed === 'right' && "sticky right-0 z-10 bg-background dark:bg-[#121215] group-hover:bg-muted/50 transition-colors"
                                                    )}
                                                    style={column.fixed ? getFixedStyle(column, columnIndex) : undefined}
                                                    onClick={(e) => onCellClick?.((record as any)[column.key], record, column, e)}
                                                >
                                                    <div className="truncate text-sm flex items-center h-full">
                                                        <div className={cn(
                                                            "flex items-center w-full",
                                                            // 第一列始终左对齐
                                                            columnIndex === 0 ? "justify-start" : (
                                                                column.align === 'center' && "justify-center"
                                                            ),
                                                            columnIndex !== 0 && column.align === 'right' && "justify-end",
                                                            columnIndex !== 0 && (!column.align || column.align === 'left') && "justify-start"
                                                        )}>
                                                            {column.render
                                                                ? column.render((record as any)[column.key], record, index)
                                                                : (record as any)[column.key]
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* 加载状态遮罩 - 移出 table，使用绝对定位 */}
                        {loading && (
                            <div className="absolute inset-0 bg-background/50 z-40 flex items-center justify-center transition-opacity">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <span className="text-xs text-muted-foreground">加载中...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 分页 */}
            {pagination && (
                <div
                    className={cn(
                        "flex-none px-6 border-t border-border/50",
                        !tableConfig.footerHeight && getHeightClass(DEFAULT_HEIGHTS.FOOTER)
                    )}
                    style={tableConfig.footerHeight ? { height: tableConfig.footerHeight } : undefined}
                >
                    <Pagination {...pagination} className="w-full h-full" />
                </div>
            )}
        </div>
    )
}

export default CustomTable 