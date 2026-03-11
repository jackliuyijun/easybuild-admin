import { http } from './http'
import { API_URLS } from '@/config/api-url'
import type {
  OrderInfo,
  OrderGoods,
  OrderQueryParams,
  OrderDetailParams,
  OrderRefund,
  OrderRefundQueryParams,
  OrderRefundDetailParams
} from '@/types/order'

// ==================== 订单相关 API ====================

// 获取订单列表
export const getList = (params: OrderQueryParams) => {
  return http.get<{
    records: OrderInfo[]
    total: number
    size: number
    current: number
    pages: number
  }>(API_URLS.order.list, { params })
}

// 获取订单详情
export const getDetail = (params: OrderDetailParams) => {
  return http.get<OrderInfo>(API_URLS.order.detail, { params })
}

// 获取订单商品列表
export const getOrderGoods = (params: { orderId: string }) => {
  return http.get<OrderGoods[]>(API_URLS.order.orderGoods, { params })
}

// ==================== 订单退款相关 API ====================

// 获取退款列表
export const getRefundList = (params: OrderRefundQueryParams) => {
  return http.get<{
    records: OrderRefund[]
    total: number
    size: number
    current: number
    pages: number
  }>(API_URLS.orderRefund.list, { params })
}

// 获取退款详情
export const getRefundDetail = (params: OrderRefundDetailParams) => {
  return http.post<OrderRefund>(API_URLS.orderRefund.detail, params)
}
