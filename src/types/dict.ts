export interface Dict {
    dictId: string
    dictName: string
    dictCode: string
    dictDescribe: string
    moduleName: string
    forbiddenFlag: number
    insertTime: string
    lastUpdateTime: string
}

export interface DictQueryParams {
    page: number
    limit: number
    dictName?: string
    forbiddenFlag?: number
}

export interface DictSaveParams {
    dictId?: string
    dictName: string
    dictCode: string
    dictDescribe: string
    moduleName: string
} 