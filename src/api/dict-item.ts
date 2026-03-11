import http from './http'
import { API_URLS } from '@/config/api-url'
import type { DictItemQuery, DictItemSaveParams } from '@/types/dict-item'

// 获取字典项列表
export const getDictItemList = (params: DictItemQuery) => {
    return http.get(API_URLS.dictItem.list, { params })
}

// 新增/编辑字典项
export const saveDictItem = (data: DictItemSaveParams) => {
    return http.post(API_URLS.dictItem.save, data)
}

// 启用/禁用字典项
export const toggleDictItemForbiddenFlag = async (params: {
    ids: string;  // 字典项ID，多个用英文逗号隔开
    value: 0 | 1; // 值, 0: 启用, 1: 禁用
}) => {
    return http.post(API_URLS.dictItem.disable, params)
}

// 删除字典项
export const deleteDictItem = async (ids: string) => {
    return http.post(API_URLS.dictItem.delete, { ids })
} 