import http from './http'
import { API_URLS } from '@/config/api-url'
import type { GoodsQueryParams, GoodsListResponse, GoodsItem } from '@/types/goods'

// 获取列表
export const getList = (params: GoodsQueryParams): Promise<GoodsListResponse> => {
    return http.get(API_URLS.goods.list, { params })
}

// 新增或编辑
export const save = (data: GoodsItem) => {
    return http.post(API_URLS.goods.save, data)
}

// 获取商品详情
export const getDetail = (goodsId: string): Promise<GoodsItem> => {
    return http.get(API_URLS.goods.detail, { params: { goodsId } })
}

// 编辑基本信息
export const editBasic = (data: Partial<GoodsItem>): Promise<GoodsItem> => {
    // 确保图片数据存在
    const submitData = {
        ...data,
        coverImg: data.coverImg || '',
        carouselImg: data.carouselImg || ''
    }
    return http.post(API_URLS.goods.editBasic, submitData)
}

// 编辑SPU
export const editSpu = (data: Partial<GoodsItem>) => {
    return http.post(API_URLS.goods.editSpu, data)
}

// 编辑SKU
export const editSku = (data: Partial<GoodsItem>) => {
    return http.post(API_URLS.goods.editSku, data)
}

// 编辑商品说明
export const editExplain = (data: Partial<GoodsItem>) => {
    return http.post(API_URLS.goods.editExplain, data)
}

// 编辑商品详情
export const editDetail = (data: Partial<GoodsItem>) => {
    return http.post(API_URLS.goods.editDetail, data)
}

// 上架/下架
export const toggleSaleFlag = async (params: {
    ids: string;  // ID，多个用英文逗号隔开
    value: 0 | 1; // 值, 0: 下架, 1: 上架
}) => {
    const res = await http.post(API_URLS.goods.saleFlag, params)
    return res
}

// 删除
export const remove = async (ids: string) => {
    return http.post(API_URLS.goods.delete, { ids })
} 