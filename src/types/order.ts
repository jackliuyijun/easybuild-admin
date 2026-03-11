export interface AmountInfo {
  source: string
  parsedValue: number
}

// 订单信息接口
export interface OrderInfo {
  orderId: string
  orderNo: string
  userId: string
  userThirdAccount: string
  userPhone: string
  goodsName: string
  goodsSkuName: string
  goodsPic: string
  goodsCount: number
  totalAmount: number | AmountInfo
  actualAmount: number | AmountInfo
  actualPayAmount?: number | AmountInfo
  orderType: number // 0：线上，1：线下
  dispatchType: number // 0 自提 1 快递 2 虚拟商品
  invoiceFlag: number // 0未开发票，1已开票
  refundFlag: number // 0：未申请，1：已申请
  refundStatus: number // 0：未退款，1：全部退款，2：部分退款
  refundAmount: number | AmountInfo
  userRemark: string
  orderSource: number // 0 线上商城 1 线下 2 淘宝 3 京东 4 拼多多 5 抖店
  tagRemark: string
  orderStatus: number // 0：待支付，1：已取消，2：待发货，3：待收货，4：已收货，5：退货中，6：退款中，7：已退款
  orderChannel: number
  clientType: number // 0 小程序 1 APP 2 PC
  pushFlag: number // 0：未推送，1：已推送
  orderRemark: string
  statisticsFlag: number // 0未处理 1已处理
  merchantId: string
  merchantName: string
  merchantRemark: string
  userName?: string
  containerId?: string
  containerName?: string
  orderDate: string
  orderTime: string
  createTime?: string
  updateTime?: string
}

// 订单商品接口
export interface OrderGoods {
  orderGoodsId: string
  orderId: string
  goodsId: string
  goodsName: string
  goodsNo: string
  goodsSkuId: string
  goodsSkuNo: string
  goodsSkuName: string
  goodsPicUrl: string
  goodsCount: number
  goodsPrice: number | AmountInfo
}

// 查询参数接口
export interface OrderQueryParams {
  page: number
  limit: number
  searchKeyWord?: string
  orderStatus?: number
  orderType?: number
  orderSource?: number
  dispatchType?: number
  refundFlag?: number
  refundStatus?: number
  invoiceFlag?: number
  pushFlag?: number
  statisticsFlag?: number
  startDate?: string
  endDate?: string
  containerId?: string
  merchantId?: string
}

// 订单详情参数接口
export interface OrderDetailParams {
  id: string
}

// 订单状态选项
export const ORDER_STATUS_OPTIONS = [
  { value: 0, label: '待支付', color: 'orange' },
  { value: 1, label: '已取消', color: 'gray' },
  { value: 2, label: '待发货', color: 'blue' },
  { value: 3, label: '待收货', color: 'purple' },
  { value: 4, label: '已收货', color: 'green' },
  { value: 5, label: '退货中', color: 'yellow' },
  { value: 6, label: '退款中', color: 'red' },
  { value: 7, label: '已退款', color: 'gray' }
] as const

// 订单类型选项
export const ORDER_TYPE_OPTIONS = [
  { value: 0, label: '线上' },
  { value: 1, label: '线下' }
] as const

// 配送方式选项
export const DISPATCH_TYPE_OPTIONS = [
  { value: 0, label: '自提' },
  { value: 1, label: '快递' },
  { value: 2, label: '虚拟商品' }
] as const

// 订单来源选项
export const ORDER_SOURCE_OPTIONS = [
  { value: 0, label: '线上商城' },
  { value: 1, label: '线下' },
  { value: 2, label: '淘宝' },
  { value: 3, label: '京东' },
  { value: 4, label: '拼多多' },
  { value: 5, label: '抖店' }
] as const

// 客户端类型选项
export const CLIENT_TYPE_OPTIONS = [
  { value: 0, label: '小程序' },
  { value: 1, label: 'APP' },
  { value: 2, label: 'PC' }
] as const

// 退款状态选项
export const REFUND_STATUS_OPTIONS = [
  { value: 0, label: '未退款' },
  { value: 1, label: '全部退款' },
  { value: 2, label: '部分退款' }
] as const

// 是否选项（通用）
export const YES_NO_OPTIONS = [
  { value: 0, label: '否' },
  { value: 1, label: '是' }
] as const

// 获取订单状态配置
export const getOrderStatusConfig = (status: number) => {
  return ORDER_STATUS_OPTIONS.find(item => item.value === status) || ORDER_STATUS_OPTIONS[0]
}

// 获取订单类型配置
export const getOrderTypeConfig = (type: number) => {
  return ORDER_TYPE_OPTIONS.find(item => item.value === type) || ORDER_TYPE_OPTIONS[0]
}

// 获取配送方式配置
export const getDispatchTypeConfig = (type: number) => {
  return DISPATCH_TYPE_OPTIONS.find(item => item.value === type) || DISPATCH_TYPE_OPTIONS[0]
}

// 获取订单来源配置
export const getOrderSourceConfig = (source: number) => {
  return ORDER_SOURCE_OPTIONS.find(item => item.value === source) || ORDER_SOURCE_OPTIONS[0]
}

// 获取客户端类型配置
export const getClientTypeConfig = (type: number) => {
  return CLIENT_TYPE_OPTIONS.find(item => item.value === type) || CLIENT_TYPE_OPTIONS[0]
}

// 获取退款状态配置
export const getRefundStatusConfig = (status: number) => {
  return REFUND_STATUS_OPTIONS.find(item => item.value === status) || REFUND_STATUS_OPTIONS[0]
}

// ==================== 订单退款相关类型 ====================

// 订单退款信息接口
export interface OrderRefund {
  orderRefundId: string
  orderRefundNo: string
  orderId: string
  orderNo: string
  orderPayId: string
  userId: string
  userPhone: string
  refundType: number // 0 仅退款 1 退货退款
  refundSource: number // 0 用户申请 1 商家发起 2 系统发起
  refundStatus: number // 0 待审核 1 审核拒绝 2 待退货 3 待收货 4 退款中 5 已退款 6 已关闭
  refundChannel: number // 0 原路退回 1 退至余额 2 线下打款
  refundReasonType: number
  refundReason: string
  applyRemark: string
  auditRemark: string
  handleRemark: string
  refundAmount: number
  refundFreightAmount: number
  refundCreditAmount: number
  refundCouponAmount: number
  refundEvidencePics: string
  returnExpressCompany: string
  returnExpressNo: string
  auditorId: string
  auditorName: string
  auditTime: string
  handlerId: string
  handlerName: string
  handleTime: string
  refundTradeNo: string
  refundCompleteTime: string
  receiveConfirmTime: string
  contactPhone: string
  contactName: string
  createTime?: string
  updateTime?: string
}

// 退款查询参数接口
export interface OrderRefundQueryParams {
  page: number
  limit: number
  searchKeyWord?: string
  refundStatus?: number
  refundType?: number
  refundSource?: number
  refundChannel?: number
  startTime?: string
  endTime?: string
}

// 退款详情参数接口
export interface OrderRefundDetailParams {
  id: string
}

// 退款类型选项
export const REFUND_TYPE_OPTIONS = [
  { value: 0, label: '仅退款', color: 'blue' },
  { value: 1, label: '退货退款', color: 'orange' }
] as const

// 退款来源选项
export const REFUND_SOURCE_OPTIONS = [
  { value: 0, label: '用户申请', color: 'blue' },
  { value: 1, label: '商家发起', color: 'purple' },
  { value: 2, label: '系统发起', color: 'gray' }
] as const

// 退款状态选项（订单退款）
export const ORDER_REFUND_STATUS_OPTIONS = [
  { value: 0, label: '待审核', color: 'orange' },
  { value: 1, label: '审核拒绝', color: 'red' },
  { value: 2, label: '待退货', color: 'blue' },
  { value: 3, label: '待收货', color: 'purple' },
  { value: 4, label: '退款中', color: 'yellow' },
  { value: 5, label: '已退款', color: 'green' },
  { value: 6, label: '已关闭', color: 'gray' }
] as const

// 退款渠道选项
export const REFUND_CHANNEL_OPTIONS = [
  { value: 0, label: '原路退回' },
  { value: 1, label: '退至余额' },
  { value: 2, label: '线下打款' }
] as const

// 获取退款类型配置
export const getRefundTypeConfig = (type: number) => {
  return REFUND_TYPE_OPTIONS.find(item => item.value === type) || REFUND_TYPE_OPTIONS[0]
}

// 获取退款来源配置
export const getRefundSourceConfig = (source: number) => {
  return REFUND_SOURCE_OPTIONS.find(item => item.value === source) || REFUND_SOURCE_OPTIONS[0]
}

// 获取订单退款状态配置
export const getOrderRefundStatusConfig = (status: number) => {
  return ORDER_REFUND_STATUS_OPTIONS.find(item => item.value === status) || ORDER_REFUND_STATUS_OPTIONS[0]
}

// 获取退款渠道配置
export const getRefundChannelConfig = (channel: number) => {
  return REFUND_CHANNEL_OPTIONS.find(item => item.value === channel) || REFUND_CHANNEL_OPTIONS[0]
}
