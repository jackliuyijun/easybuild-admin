/**
 * 商品信息类型定义
 */
export interface GoodsItem {
  goodsId: string;           // 商品ID
  goodsNo: string;           // 商品编号
  goodsName: string;         // 商品名称
  goodsTrait: string;        // 商品特点
  salePrice: number;         // 销售价格
  marketPrice: number;       // 市场价格
  costPrice: number;         // 成本价格
  skuType: number;           // 规格类型 1单一规格 2多规格
  usedFlag: number;          // 二手标签 0否 1是
  saleType: number;          // 销售模式 1现货销售 2预售模式
  distributionType: number;  // 配送方式 0: 自提, 1: 快递, 2: 都可以
  creditFlag: number;        // 是否支持积分支付 (0: 否, 1: 是)
  balanceFlag: number;       // 是否支持余额支付 (0: 否, 1: 是)
  surplusStock: number;      // 剩余库存
  goodsTag: string;          // 商品标签
  weight: number;            // 重量(kg)
  volume: number;            // 体积(m3)
  merchantCode: string;      // 商家编码
  spuCode: string;          // spu编码
  firstCategoryId: string; // 一级分类ID  
  secondCategoryId: string;// 二级分类ID
  thirdCategoryId: string; // 三级分类ID
  firstCategoryName: string; // 一级分类名称
  secondCategoryName: string;// 二级分类名称
  thirdCategoryName: string; // 三级分类名称
  postageTemplateId: string; // 运费模板ID
  initSaleCount: number;     // 初始销量
  saleCount: number;         // 销售总量
  evaluateCount: number;     // 评价总数
  goodEvaluateCount: number; // 好评次数
  startSaleTime: string;     // 预售开售时间
  unit: string;             // 商品数量单位
  saleFlag: number;         // 在售标签 0待上架, 1在售
  sort: number;             // 排序,数字越大,越靠前
  maxCount: number;         // 单次最大购买数（0: 表示不限制）
  limitCount: number;       // 限购次数, 0表示不限制
  merchantId: string;       // 所属商家ID
  merchantName: string;     // 商家名称
  qrUrl: string;           // 二维码地址
  taxId: string;           // 税率ID
  taxName: string;         // 税率名称
  collectCount: number;     // 收藏数
  newFlag: number;         // 新品标识 0否 1是
  recommendFlag: number;    // 推荐标识 0否 1是
  brandId: string;         // 品牌ID
  brandName: string;       // 品牌名称
  createTime?: string;     // 创建时间
  skuList: GoodsSku[]
  explainList: GoodsExplanation[]
  coverImg?: string;
  carouselImg?: string;
}

/**
 * 商品列表查询参数
 */
export interface GoodsQueryParams {
  page: number;
  limit: number;
  searchKeyWord?: string;
  firstCategoryId?: string;
  secondCategoryId?: string;
  thirdCategoryId?: string;
  saleFlag?: number;
  merchantId?: string;
}

/**
 * 商品列表响应
 */
export interface GoodsListResponse {
  data: GoodsItem[];
  count: number;
}

export interface GoodsSku {
  goodsSkuId: string
  goodsId: string
  goodsName: string
  goodsNo: string
  goodsSkuName: string
  goodsSkuNo: string
  salePrice: number
  marketPrice: number
  costPrice: number
  surplusStock: number
  skuHash: string
  coverImg?: string
}

export interface GoodsExplanation {
  goodsExplainId?: string;  // 添加 ID 字段
  explainName: string;
  explainContent: string;
  sort: number;  // 添加排序字段
} 