import type { ReactNode, CSSProperties } from 'react'
import type { BorderType, HoverType, TableConfig } from './table-config'

// 选择配置接口
export interface TableSelection {
    selectedRowKeys: string[]
    onChange: (selectedRowKeys: string[]) => void
    getCheckboxProps?: (record: any) => { disabled?: boolean }
}

// 列配置接口
export type TableColumn<T, K extends keyof T = keyof T> = K extends any ? {
    key: K extends string ? K : string           // 列标识必须是 T 的键
    title: string                                // 列标题
    width?: number | string                      // 列宽度
    fixed?: 'left' | 'right'                    // 固定列
    align?: 'left' | 'center' | 'right'         // 对齐方式
    className?: string                          // 自定义类名
    render?: (value: T[K], record: T, index: number) => ReactNode  // 更严格的渲染函数类型
    sortable?: boolean                          // 是否可排序
    filterable?: boolean                        // 是否可筛选
} : never;

// 分页配置接口
export interface TablePagination {
    current: number
    total: number
    pageSize?: number
    onChange: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
}

// 表格事件处理接口
export interface TableEvents<T> {
    onRowClick?: (record: T, index: number, event: React.MouseEvent) => void
    onRowDoubleClick?: (record: T, index: number, event: React.MouseEvent) => void
    onRowContextMenu?: (record: T, index: number, event: React.MouseEvent) => void
    onRowMouseEnter?: (record: T, index: number, event: React.MouseEvent) => void
    onRowMouseLeave?: (record: T, index: number, event: React.MouseEvent) => void
    onCellClick?: (value: any, record: T, column: TableColumn<T>, event: React.MouseEvent) => void
    onHeaderClick?: (column: TableColumn<T>, event: React.MouseEvent) => void
}

// 表格属性接口
export interface TableProps<T extends Record<string, any> = Record<string, any>> extends TableEvents<T> {
    data: T[]                     // 数据源
    columns: TableColumn<T>[]     // 列配置
    loading?: boolean             // 加载状态
    rowKey?: string | ((record: T) => string)  // 行键
    scroll?: {                    // 滚动配置
        x?: number | string | boolean
        y?: number | string
    }
    className?: string           // 自定义类名
    style?: CSSProperties       // 自定义样式
    emptyText?: string         // 空状态文本
    selection?: TableSelection  // 选择配置
    bordered?: boolean         // 是否显示外边框，默认 false
    pagination?: TablePagination  // 分页配置
    rowHover?: HoverType         // 行悬停效果
    striped?: boolean            // 是否启用斑马纹
    cellBorder?: boolean         // 单元格边框
    border?: BorderType  // 统一的边框配置，默认 'bottom'
    config?: TableConfig;  // 添加配置参数
    headerActions?: ReactNode; // 新增：表头右侧自定义操作区
}

// 表格头部属性接口
export interface TableHeaderProps<T extends Record<string, any> = Record<string, any>> {
    columns: TableColumn<T>[]
    className?: string
    selection?: TableSelection
    data: T[]                  // 用于全选功能
    rowKey?: string | ((record: T) => string)
}

// 表格内容属性接口
export interface TableBodyProps<T extends Record<string, any> = Record<string, any>> {
    data: T[]
    columns: TableColumn<T>[]
    rowKey?: string | ((record: T) => string)
    className?: string
    selection?: TableSelection
    rowHover?: HoverType
    striped?: boolean
    cellBorder?: boolean
} 