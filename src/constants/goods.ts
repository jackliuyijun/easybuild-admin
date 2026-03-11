export const SALE_TYPE_OPTIONS = [
    { value: 1, label: "现货销售" },
    { value: 2, label: "预售模式" }
] as const

export const SKU_TYPE_OPTIONS = [
    { value: 1, label: "单规格" },
    { value: 2, label: "多规格" }
] as const

export const DISTRIBUTION_TYPE_OPTIONS = [
    { value: 0, label: "自提" },
    { value: 1, label: "快递" },
    { value: 2, label: "都可以" }
] as const

export const FLAG_OPTIONS = [
    { value: 0, label: "否" },
    { value: 1, label: "是" }
] as const

// 转换函数
export const getSaleTypeText = (value?: number) => {
    return SALE_TYPE_OPTIONS.find(item => item.value === value)?.label || '-'
}

export const getSkuTypeText = (value?: number) => {
    return SKU_TYPE_OPTIONS.find(item => item.value === value)?.label || '-'
}

export const getDistributionTypeText = (value?: number) => {
    return DISTRIBUTION_TYPE_OPTIONS.find(item => item.value === value)?.label || '-'
}

export const getFlagText = (value?: number) => {
    return FLAG_OPTIONS.find(item => item.value === value)?.label || '-'
} 