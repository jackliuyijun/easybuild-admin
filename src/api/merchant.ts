import http from './http'
import { API_URLS } from '@/config/api-url'
import type {
    MerchantQueryParams,
    MerchantSaveParams,
} from '@/types/merchant'

// 获取超市列表
export const getMerchantList = (params: MerchantQueryParams) => {
    return http.get(API_URLS.merchant.list, { params })
}

// 新增或编辑超市
export const saveMerchant = (data: MerchantSaveParams) => {
    return http.post(API_URLS.merchant.save, data)
}

// 禁用/启用超市
export const toggleMerchantForbiddenFlag = async (params: {
    ids: string;
    value: 0 | 1;
}) => {
    const res = await http.post(API_URLS.merchant.disable, params);
    return res;
};

// 删除超市
export const deleteMerchant = async (ids: string) => {
    return http.post(API_URLS.merchant.delete, { ids });
};

// 获取超市下拉列表
export const getMerchantDropdownList = async (params?: {
    name?: string;
}) => {
    const res = await http.get(API_URLS.merchant.dropdownList, { params })
    return (res.data || []).map((item: any) => ({
        value: item.merchantId,
        label: item.merchantName,
    }))
}
