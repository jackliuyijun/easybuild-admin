import http from './http'
import { API_URLS } from '@/config/api-url'
import type { 
  TagQueryParams,
  TagSaveParams,
} from '@/types/tag'

// 获取标签列表
export const getTagList = (params: TagQueryParams) => {
  return http.get(API_URLS.tag.list, { params })
}

// 新增/编辑标签
export const saveTag = (data: TagSaveParams) => {
  return http.post(API_URLS.tag.save, data)
}

// 切换标签状态
export const toggleTagForbiddenFlag = async (params: {
  ids: string;  // 标签ID，多个用英文逗号隔开
  value: 0 | 1; // 值, 0: 启用, 1: 禁用
}) => {
  const res = await http.post(API_URLS.tag.disable, params);
  return res;
}

// 删除标签
export const deleteTag = async (ids: string) => {
  return http.post(API_URLS.tag.delete, { ids });
} 