import http from './http'
import { API_URLS } from '@/config/api-url'

// 获取列表
export const getList = (params: any) => {
    return http.get(API_URLS.spuConfig.list, { params })
}

// 新增或编辑
export const save = (data: any) => {
    return http.post(API_URLS.spuConfig.save, data)
}

// 删除
export const remove = async (ids: string) => {
    return http.post(API_URLS.spuConfig.delete, { ids });
}

// 获取规格组下拉列表
export const getSpuDropdownList = async (params?: {
    spuName?: string;
    firstCategoryId?: string;
    secondCategoryId?: string;
    thirdCategoryId?: string;
}) => {
    const res = await http.get(API_URLS.spuConfig.dropdownList, { params })
    return (res.data || []).map((item: any) => ({
        value: item.spuValue,
        label: item.spuName,
    }))
}