export interface Merchant {
    merchantId: string
    merchantName: string
    title: string
    subTitle: string
    logo: string
    merchantCode: string
    linkMan: string
    linkPhone: string
    businessHours: string
    addressInfo: string
    forbiddenFlag: number
    insertTime: string
    lastUpdateTime: string
}

export interface MerchantQueryParams {
    page: number
    limit: number
    merchantName?: string
    forbiddenFlag?: number
}

export interface MerchantSaveParams {
    merchantId?: string
    merchantName: string
    title?: string
    subTitle?: string
    logo?: string
    merchantCode?: string
    linkMan?: string
    linkPhone?: string
    businessHours?: string
    addressInfo?: string
}
