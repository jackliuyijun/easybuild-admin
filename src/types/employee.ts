export interface Employee {
  employeeId: string | number
  loginName: string
  employeeName: string
  mobile?: string
  email?: string
  departmentName?: string
  departmentId?: string | number
  position?: string
  forbiddenFlag?: number
  roles?: string
  rolesName?: string
  orgName?: string
  saasName?: string
  manageArea?: string
  workArea?: string
  bizType?: string
  employeeCode?: string
}

export interface EmployeeQueryParams {
  page: number
  limit: number
  searchKeyword?: string
  forbiddenFlag?: number
  departmentId?: string
  roles?: string
}

export interface EmployeeSaveParams {
  employeeId?: string
  loginName: string
  employeeName: string
  mobile: string
  email: string
  departmentId: string
  departmentName: string
  position: string
  roles: string
  rolesName: string
  employeeCode: string
}