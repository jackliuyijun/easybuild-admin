import { http } from './http'
import { API_URLS } from '@/config/api-url'

interface BrandQuery {
  page: number
  limit: number
  brandName?: string
  forbiddenFlag?: number
  categoryCode?: string
}

interface BrandSaveParams {
  brandId?: string
  brandName: string
  categoryId: string
  categoryName: string
  icon: string
  logo: string
  describe: string
  sort: number
}

// 获取品牌列表
export const getBrandList = (params: BrandQuery) => {
  return http.get(API_URLS.brand.list, { params })
}

// 新增/编辑品牌
export const saveBrand = (params: BrandSaveParams) => {
  return http.post(API_URLS.brand.save, params)
}

// 切换品牌状态
export const toggleBrandForbiddenFlag = (params: { ids: string, value: number }) => {
  return http.post(API_URLS.brand.disable, params)
}

// 删除品牌
export const deleteBrand = (ids: string) => {
  return http.post(API_URLS.brand.delete, { ids })
}

// 获取品牌下拉列表
export const getBrandDropdownList = async (params?: {
  name?: string;
}) => {
  const res = await http.get(API_URLS.brand.dropdownList, { params })
  return (res.data || []).map((item: any) => ({
    value: item.brandId,
    label: item.brandName,
  }))
}