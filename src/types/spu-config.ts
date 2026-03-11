export interface SpuConfig {
    id: string
    goodsSpuConfigId: string 
    firstCategoryId: string
    secondCategoryId: string
    thirdCategoryId: string
    firstCategoryName: string
    secondCategoryName: string
    thirdCategoryName: string
    spuName: string
    spuValue: string
    createTime: string
    updateTime: string
}

export interface SpuConfigForm {
    goodsSpuConfigId?: string
    firstCategoryId: string
    secondCategoryId: string
    thirdCategoryId: string
    firstCategoryName: string
    secondCategoryName: string
    thirdCategoryName: string
    spuName: string
    spuValue: string
} 