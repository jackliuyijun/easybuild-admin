import http from './http'
import { API_URLS } from '@/config/api-url'
import type { 
    DictQueryParams,
    DictSaveParams,
} from '@/types/dict'

// 获取字典列表
export const getDictList = (params: DictQueryParams) => {
    return http.get(API_URLS.dict.list, { params })
}

// 新增或编辑字典
export const saveDict = (data: DictSaveParams) => {
    return http.post(API_URLS.dict.save, data)
}

// 禁用/启用字典
export const toggleDictForbiddenFlag = async (params: {
    ids: string;  // 字典ID，多个用英文逗号隔开
    value: 0 | 1; // 值, 0: 启用, 1: 禁用
}) => {
    const res = await http.post(API_URLS.dict.disable, params);
    return res;
};

// 删除字典
export const deleteDict = async (ids: string) => {
    return http.post(API_URLS.dict.delete, { ids });
}; 