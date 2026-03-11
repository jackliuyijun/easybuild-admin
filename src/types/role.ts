export interface Role {
  roleId: string
  roleName: string
  forbiddenFlag: number
  insertTime: string
  lastUpdateTime: string
  remark?: string
  parentId?: string
  parentName?: string
  supperStatus?: number
  type?: string
}

export interface RoleQuery {
  page: number
  limit: number
  roleName?: string
  forbiddenFlag?: number
}

export interface RoleForm {
  roleId?: string
  roleName: string
  remark?: string
} 