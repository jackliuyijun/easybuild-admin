import http from './http'
import { API_URLS } from '@/config/api-url'
import type {
  EmployeeQueryParams,
  EmployeeSaveParams,
} from '@/types/employee'

// 获取员工列表
export const getEmployeeList = (params: EmployeeQueryParams) => {
  return http.get(API_URLS.employee.list, { params })
}

// 新增或编辑员工
export const saveEmployee = (data: EmployeeSaveParams) => {
  return http.post(API_URLS.employee.save, data)
}

// 切换员工状态
export const toggleEmployeeForbiddenFlag = async (params: {
  ids: string;  // 员工ID，多个用英文逗号隔开
  value: 0 | 1; // 值, 0: 启用, 1: 禁用
}) => {
  return http.post(API_URLS.employee.disable, params);
}

// 删除员工
export const deleteEmployee = async (ids: string) => {
  return http.post(API_URLS.employee.delete, { ids });
}

// 修改密码接口参数类型
export function updateEmployeePassword(params: {
  employeeId: string | number;
  password: string;  // 加密后的新密码
}) {
  return http.post(API_URLS.employee.save, params)
}