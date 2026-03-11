import http from './http'
import { API_URLS } from '@/config/api-url'
import type {
  GroupQueryParams,
  GroupSaveParams,
} from '@/types/group'

// 获取分类组列表
export const getGroupList = (params: GroupQueryParams) => {
  return http.get(API_URLS.group.list, { params })
}

// 新增/编辑分类组
export const saveGroup = (data: GroupSaveParams) => {
  return http.post(API_URLS.group.save, data)
}

// 切换分类组状态
export const toggleGroupForbiddenFlag = async (params: {
  ids: string;  // 分类组ID，多个用英文逗号隔开
  value: 0 | 1; // 值, 0: 启用, 1: 禁用
}) => {
  const res = await http.post(API_URLS.group.disable, params);
  return res;
}

// 删除分类组
export const deleteGroup = async (ids: string) => {
  return http.post(API_URLS.group.delete, { ids });
}

// 获取分组下拉列表
export const getGroupDropdownList = async (params?: { name?: string }) => {
  const res = await http.get(API_URLS.group.dropdownList, { params })
  return (res.data || []).map((item: any) => ({
    value: item.groupCode,
    label: item.groupName
  }))
} 