import { http } from './http'
import { API_URLS } from '@/config/api-url'

interface BannerQuery {
  page: number
  limit: number
  bannerTitle?: string
  forbiddenFlag?: number
}

interface BannerSaveParams {
  bannerId?: string
  targetId: string
  targetType: string
  targetName: string
  jumpUrl: string
  jumpMinAppId: string
  mediaType: number
  mediaUrl: string
  jumpType: number
  bannerLocation: string
  pageType: string
  clientType: number
  bgColor: string
  bannerTitle: string
  bannerDescription: string
  shareFlag: number
  sort: number
}

// 获取banner列表
export const getBannerList = (params: BannerQuery) => {
  return http.get(API_URLS.banner.list, { params })
}

// 新增/编辑banner
export const saveBanner = (params: BannerSaveParams) => {
  return http.post(API_URLS.banner.save, params)
}

// 切换banner状态
export const toggleBannerForbiddenFlag = (params: { ids: string, value: number }) => {
  return http.post(API_URLS.banner.disable, params)
}

// 删除banner
export const deleteBanner = (ids: string) => {
  return http.post(API_URLS.banner.delete, { ids })
} 