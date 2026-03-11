import http from './http'
import { API_URLS } from '@/config/api-url'
import type {
    QueryParams,
    SaveParams,
} from '@/types/user'

// 获取列表
export const getList = (params: QueryParams) => {
    return http.get(API_URLS.user.list, { params })
}

// 新增或编辑
export const save = (data: SaveParams) => {
    return http.post(API_URLS.user.save, data)
}

// 禁用/启用
export const toggleForbiddenFlag = async (params: {
    ids: string;  // ID，多个用英文逗号隔开
    value: 0 | 1; // 值, 0: 启用, 1: 禁用
}) => {
    const res = await http.post(API_URLS.user.disable, params);
    return res;
};

// 删除 - 将方法名从 delete 改为 remove
export const remove = async (ids: string) => {
    return http.post(API_URLS.user.delete, { ids });
}; 