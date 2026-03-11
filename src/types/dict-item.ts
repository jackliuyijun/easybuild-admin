// 字典项实体类型
export interface DictItem {
    dictItemId: string
    dictId: string
    dictKey: string
    dictValue: string
    forbiddenFlag: number
}

// 字典项查询参数
export interface DictItemQuery {
    page: number
    limit: number
    dictId: string
    dictKey?: string
    forbiddenFlag?: number
}

// 字典项保存参数
export interface DictItemSaveParams {
    dictItemId?: string
    dictId: string
    dictKey: string
    dictValue: string
} 