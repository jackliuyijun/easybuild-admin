export interface Group {
  groupId: string
  groupName: string
  groupDescribe?: string
  forbiddenFlag: number
  insertTime: string
  groupCode: string
}

export interface GroupQueryParams {
  page: number
  limit: number
  groupName?: string
  forbiddenFlag?: number
  searchKeyWord?: string
}

export interface GroupSaveParams {
  groupId?: string
  groupName: string
  groupType: number
  groupDescribe: string
}