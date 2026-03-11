export interface Department {
  departmentId: string
  departmentName: string
  forbiddenFlag: number
  type: string
  insertTime: string
  lastUpdateTime: string
}

export interface DepartmentQueryParams {
  page: number
  limit: number
  departmentName?: string
  forbiddenFlag?: number
}

export interface DepartmentSaveParams {
  departmentId?: string
  departmentName: string
}