export interface LoginForm {
  loginAccount: string
  password: string
}

export interface User {
  userId: string
  userNo: string
  phone: string
  email: string
  name: string
  avatar: string
  gender: string
  signature: string
  realStatus: number // 0: 未认证, 1: 已认证
  vipLevel: number
  vipName: string
  referrerId: string
  referrerName: string
  forbiddenFlag: number // 0: 启用, 1: 禁用
  flag: string
  extFlag: string
  remark: string
  channelId: string
  channelName: string
  createTime?: string
  updateTime?: string
}

export interface QueryParams {
  page: number
  limit: number
  searchKeyWord?: string
  forbiddenFlag?: number
}

export interface SaveParams {
  userId?: string
  userNo?: string
  phone: string
  email: string
  name: string
  avatar?: string
  gender?: string
  signature?: string
  realStatus?: number
  vipLevel?: number
  vipName?: string
  referrerId?: string
  referrerName?: string
  flag?: string
  extFlag?: string
  remark?: string
  channelId?: string
  channelName?: string
}