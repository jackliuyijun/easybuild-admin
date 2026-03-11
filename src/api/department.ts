import http from './http'
import { API_URLS } from '@/config/api-url'
import type {
  DepartmentQueryParams,
  DepartmentSaveParams,
} from '@/types/department'

// 获取部门列表
export const getDepartmentList = (params: DepartmentQueryParams) => {
  return http.get(API_URLS.department.list, { params })
}

// 新增或编辑部门
export const saveDepartment = (data: DepartmentSaveParams) => {
  return http.post(API_URLS.department.save, data)
}

// 添加禁用/启用部门的方法
export const toggleDepartmentForbiddenFlag = async (params: {
  ids: string;  // 部门ID，多个用英文逗号隔开
  value: 0 | 1; // 值, 0: 启用, 1: 禁用
}) => {
  const res = await http.post(API_URLS.department.disable, params);
  return res;
};

// 删除部门
export const deleteDepartment = async (ids: string) => {
  return http.post(API_URLS.department.delete, { ids });
};

// 获取部门下拉列表
export async function getDepartmentSelectList(params?: { name?: string }) {
  const res = await http.get(API_URLS.department.dropdownList, { params })
  return (res.data || []).map((item: any) => ({
    value: item.departmentId,
    label: item.departmentName
  }))
} 