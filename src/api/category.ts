import http from './http'
import { API_URLS } from '@/config/api-url'
import type {
    CategoryQueryParams,
    CategorySaveParams,
} from '@/types/category'

// 获取分类列表
export const getCategoryList = (params: CategoryQueryParams) => {
    return http.get(API_URLS.category.list, { params })
}

// 新增/编辑分类
export const saveCategory = (data: CategorySaveParams) => {
    return http.post(API_URLS.category.save, data)
}

// 切换分类状态
export const toggleCategoryForbiddenFlag = async (params: {
    ids: string;  // 分类ID，多个用英文逗号隔开
    value: 0 | 1; // 值, 0: 启用, 1: 禁用
}) => {
    const res = await http.post(API_URLS.category.disable, params);
    return res;
}

// 删除分类
export const deleteCategory = async (ids: string) => {
    return http.post(API_URLS.category.delete, { ids });
}

// 获取分类下拉列表
export const getCategoryDropdownList = async (params?: {
    categoryName?: string;
    groupId?: string;
    level?: number;
    parentId?: string;
}) => {
    // 构建请求参数，移除分页相关参数
    const requestParams: any = {}

    if (params?.categoryName) {
        requestParams.categoryName = params.categoryName
    }
    if (params?.groupId) {
        requestParams.groupId = params.groupId
    }
    if (params?.level) {
        requestParams.level = params.level
    }
    // 从二级分类开始，需要传递父级编码
    if (params?.parentId) {
        requestParams.parentId = params.parentId
    }

    const res = await http.get(API_URLS.category.dropdownList, {
        params: requestParams
    })
    return (res.data || []).map((item: any) => ({
        value: item.categoryId,
        label: item.categoryName,
    }))
}