export interface Category {
  categoryId: string
  categoryName: string
  categoryCode: string
  categoryDescribe: string
  parentName: string
  level: number
  sort: number
  forbiddenFlag: number
  insertTime: string
  lastUpdateTime: string
  parentId: string
  groupId?: string
}

export interface CategoryQueryParams {
  page: number
  limit: number
  categoryName?: string
  forbiddenFlag?: number
  searchKeyWord?: string
  groupId?: string
  level?: number
}

export interface CategorySaveParams {
  categoryId?: string
  categoryName: string
  categoryDescribe: string
  parentId: string
  parentName: string
  level: number
  sort: number
  groupId?: string
}