import { group } from "console"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
export const UPLOAD_API_URL = process.env.NEXT_PUBLIC_UPLOAD_API_URL || 'http://192.168.100.250:9008'

export const API_URLS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    resetPwd: '/auth/editPwd',
    resources: '/auth/resource/employeeAuthResources',
  },
  department: {
    list: '/auth/department/queryPage',
    save: '/auth/department/addOrEdit',
    disable: '/auth/department/disable',
    delete: '/auth/department/delete',
    dropdownList: '/auth/department/selectList',   // 下拉列表
  },
  role: {
    list: '/auth/role/queryPage',
    save: '/auth/role/addOrEdit',
    disable: '/auth/role/disable',
    delete: '/auth/role/delete',         // 更新用户信息
    dropdownList: '/auth/role/selectList',   // 下拉列表
    roleResource: '/auth/role/parentResourceByRoleId', // 角色权限
    saveRoleResource: '/auth/role/grant', // 保存角色权限
  },
  employee: {
    list: '/auth/employee/queryPage',
    save: '/auth/employee/addOrEdit',
    disable: '/auth/employee/disable',
    delete: '/auth/employee/delete',
  },
  brand: {
    list: '/bms/base/brand/queryPage',
    save: '/bms/base/brand/addOrEdit',
    disable: '/bms/base/brand/disable',
    delete: '/bms/base/brand/delete',
    dropdownList: '/bms/base/brand/selectList',
  },
  banner: {
    list: '/bms/operation/banner/queryPage',
    save: '/bms/operation/banner/addOrEdit',
    disable: '/bms/operation/banner/disable',
    delete: '/bms/operation/banner/delete',
  },
  category: {
    list: '/bms/base/category/queryPage',
    save: '/bms/base/category/addOrEdit',
    disable: '/bms/base/category/disable',
    delete: '/bms/base/category/delete',
    dropdownList: '/bms/base/category/selectList',
  },
  group: {
    list: '/bms/base/group/queryPage',
    save: '/bms/base/group/addOrEdit',
    disable: '/bms/base/group/disable',
    delete: '/bms/base/group/delete',
    dropdownList: '/bms/base/group/selectList',
  },
  tag: {
    list: '/bms/base/tag/queryPage',
    save: '/bms/base/tag/addOrEdit',
    disable: '/bms/base/tag/disable',
    delete: '/bms/base/tag/delete',
    dropdownList: '/bms/base/tag/selectList',
  },
  dict: {
    list: '/bms/system/dict/queryPage',
    save: '/bms/system/dict/addOrEdit',
    disable: '/bms/system/dict/disable',
    delete: '/bms/system/dict/delete',
  },
  dictItem: {
    list: '/bms/system/dictItem/queryPage',
    save: '/bms/system/dictItem/addOrEdit',
    disable: '/bms/system/dictItem/disable',
    delete: '/bms/system/dictItem/delete',
  },

  user: {
    list: '/bms/customer/user/queryPage',
    save: '/bms/customer/user/addOrEdit',
    disable: '/bms/customer/user/disable',
    delete: '/bms/customer/user/delete',
  },
  spuConfig: {
    list: '/bms/commodity/spu/queryPage',
    save: '/bms/commodity/spu/addOrEdit',
    delete: '/bms/commodity/spu/delete',
    dropdownList: '/bms/commodity/spu/selectList',
  },
  goods: {
    list: '/bms/commodity/goods/queryPage',
    saleFlag: '/bms/commodity/goods/saleFlag',
    save: '/bms/commodity/goods/addOrEdit',
    delete: '/bms/commodity/goodsInfo/delete',
    editBasic: '/bms/commodity/goods/editBasic', //编辑基本信息
    editSku: '/bms/commodity/goods/editSku', //编辑sku
    editDetail: '/bms/commodity/goods/editDetail', //编辑详情
    editExplain: '/bms/commodity/goods/editExplain', //编辑说明
    detail: '/bms/commodity/goods/detail', //详情
  },
  order: {
    list: '/bms/order/info/queryPage', // 订单列表查询
    detail: '/bms/order/info/detail', // 订单详情
    orderGoods: '/bms/order/info/orderGoods', // 订单商品列表
  },
  orderRefund: {
    list: '/bms/order/refund/queryPage', // 退款列表查询
    detail: '/bms/order/refund/detail', // 退款详情
  },


  container: {
    list: '/bms/storage/container/queryPage',
    save: '/bms/storage/container/addOrEdit',
    disable: '/bms/storage/container/disable',
    delete: '/bms/storage/container/delete',
    dropdownList: '/bms/storage/container/selectList',
  },
  merchant: {
    list: '/bms/businesses/merchant/queryPage',
    save: '/bms/businesses/merchant/addOrEdit',
    disable: '/bms/businesses/merchant/disable',
    delete: '/bms/businesses/merchant/delete',
    dropdownList: '/bms/businesses/merchant/selectList',
  },
} as const

export const createApiUrl = (path: string) => `${API_BASE_URL}${path}`
