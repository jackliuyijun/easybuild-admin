export interface Tag {
  id?: string
  tagId: string
  tagName: string
  tagCode: string
  subName?: string
  categoryCode: string
  categoryName: string
  tagDescribe?: string
  createTime?: string
  updateTime?: string
  insertTime?: string
  forbiddenFlag: number
}

export interface TagFormData {
  tagName: string
  tagCode: string
  subName?: string
  categoryCode: string
  categoryName: string
  tagDescribe?: string
}

export interface TagQueryParams {
  page: number
  limit: number
  tagName?: string
  forbiddenFlag?: number
  categoryCode?: string
  searchKeyWord?: string
}

export interface TagSaveParams {
  tagId?: string
  tagName: string
  subName: string
  tagCode: string
  tagDescribe: string
  categoryCode: string
  categoryName: string
}