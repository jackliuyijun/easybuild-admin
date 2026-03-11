import http from './http'
import { API_URLS } from '@/config/api-url'
import type {
    ContainerQueryParams,
    ContainerSaveParams,
} from '@/types/container'

// 获取货柜列表
export const getContainerList = (params: ContainerQueryParams) => {
    return http.get(API_URLS.container.list, { params })
}

// 新增或编辑货柜
export const saveContainer = (data: ContainerSaveParams) => {
    return http.post(API_URLS.container.save, data)
}

// 禁用/启用货柜
export const toggleContainerForbiddenFlag = async (params: {
    ids: string;
    value: 0 | 1;
}) => {
    const res = await http.post(API_URLS.container.disable, params);
    return res;
};

// 删除货柜
export const deleteContainer = async (ids: string) => {
    return http.post(API_URLS.container.delete, { ids });
};

// 获取货柜下拉列表
export const getContainerDropdownList = async (params?: {
    name?: string;
}) => {
    const res = await http.get(API_URLS.container.dropdownList, { params })
    return (res.data || []).map((item: any) => ({
        value: item.containerId,
        label: item.containerName,
    }))
}
