'use client'

import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react"
import * as z from "zod"
import { CustomForm } from "@/components/custom/form/custom-form"
import type { CustomFormRef, FieldType, FormField } from "@/components/custom/form/types"
import type { GoodsItem } from "@/types/goods"
import type { UseFormReturn } from "react-hook-form"
import { getBrandDropdownList } from "@/api/brand"
import { CategoryCascader, CategoryCascaderValue } from "@/components/custom/category-cascader"
import {
    SALE_TYPE_OPTIONS,
    SKU_TYPE_OPTIONS,
    DISTRIBUTION_TYPE_OPTIONS,
    FLAG_OPTIONS
} from "@/constants/goods"
import { Button } from "@/components/ui/button"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { format } from "date-fns"

// 表单验证规则
const formSchema = z.object({
    brandId: z.string().optional(),
    brandName: z.string().optional(),

    firstCategoryId: z.string().optional(),
    firstCategoryName: z.string().optional(),
    secondCategoryId: z.string().optional(),
    secondCategoryName: z.string().optional(),
    thirdCategoryId: z.string().optional(),
    thirdCategoryName: z.string().optional(),

    goodsName: z.string("商品名称格式不正确")
        .min(1, "商品名称不能为空")
        .max(100, "商品名称不能超过100个字符"),

    goodsNo: z.string().optional(),

    salePrice: z.coerce.number("请输入有效的销售价格")
        .min(0.01, "销售价格必须大于0")
        .max(999999.99, "销售价格不能超过999999.99"),

    costPrice: z.coerce.number("请输入有效的成本价格")
        .min(0.01, "成本价格必须大于0")
        .max(999999.99, "成本价格不能超过999999.99")
        .optional(),

    marketPrice: z.coerce.number("请输入有效的市场价格")
        .min(0, "市场价格不能小于0")
        .max(999999.99, "市场价格不能超过999999.99")
        .optional(),

    saleType: z.coerce.number().min(1, "请选择销售类型").default(1),
    skuType: z.coerce.number().min(1, "请选择规格类型").default(1),
    distributionType: z.coerce.number().min(0, "请选择配送方式").default(2),

    startSaleTime: z.string().optional(),
    unit: z.string().optional(),
    sort: z.coerce.number().min(0, "排序不能小于0").default(0),
    spuCode: z.string().optional(),

    coverImg: z.string({ message: "请上传封面图" }).min(1, "请上传封面图"),
    carouselImg: z.string().optional(),
    goodsTrait: z.string().optional(),

    newFlag: z.coerce.number().default(0),
    recommendFlag: z.coerce.number().default(0),
    usedFlag: z.coerce.number().default(0),

    initSaleCount: z.coerce.number().min(0, "初始销量不能小于0").optional(),

    // 添加数组类型字段的验证
    skuList: z.array(z.any()).default([]),
    spuList: z.array(z.any()).default([])
})

interface GoodsBasicInfoProps {
    initialData?: Partial<GoodsItem>
    onSubmit: (data: Partial<GoodsItem>) => Promise<void>
    loading?: boolean
}

export const GoodsBasicInfo = forwardRef<CustomFormRef, GoodsBasicInfoProps>(({
    initialData,
    onSubmit,
    loading
}, ref) => {
    // 状态定义

    const [brandOptions, setBrandOptions] = useState<{ value: string; label: string }[]>([])
    const formRef = useRef<CustomFormRef>(null)

    // 暴露表单实例
    useImperativeHandle(ref, () => ({
        form: formRef.current?.form!,
        reset: () => formRef.current?.reset()
    }))

    // 处理品牌选择
    const handleBrandChange = (values: string[]) => {
        const selectedValue = values[0] || ''
        const brand = brandOptions.find(opt => opt.value === selectedValue)
        if (brand) {
            formRef.current?.form.setValue('brandId', brand.value)
            formRef.current?.form.setValue('brandName', brand.label)
        } else {
            formRef.current?.form.setValue('brandId', '')
            formRef.current?.form.setValue('brandName', '')
        }
    }


    // 加载品牌数据
    useEffect(() => {
        const loadBrands = async () => {
            try {
                const options = await getBrandDropdownList({})
                setBrandOptions(options)
            } catch (error) {
                console.error('Failed to load brands:', error)
            }
        }
        loadBrands()
    }, [])


    // 字段配置
    const fields: FormField[] = [
        // 品牌一级分类
        {
            name: "brandId",
            label: "品牌",
            type: "multiSelect",
            placeholder: "请选择品牌",
            required: false,
            multiple: false,
            className: "col-span-2",
            options: brandOptions,
            onSearch: async (keyword: string) => {
                const options = await getBrandDropdownList({ name: keyword })
                setBrandOptions(prev => {
                    const merged = [...prev]
                    options.forEach((item: { value: string; label: string }) => {
                        if (!merged.some(existing => existing.value === item.value)) {
                            merged.push(item)
                        }
                    })
                    return merged
                })
                return options
            },
            searchDebounce: 800,
            popoverProps: {
                align: 'start',
                className: 'w-full'
            },
            onChange: (value: string, form: UseFormReturn) => {
                const brand = brandOptions.find(opt => opt.value === value)
                form.setValue('brandName', brand?.label || '')
            },
            defaultValue: initialData?.brandId ? [initialData.brandId] : []
        },
        {
            name: "categories",
            label: "商品分类",
            type: "custom" as FieldType,
            render: (_field, form: UseFormReturn) => {
                const categoryValue: CategoryCascaderValue = {
                    firstCategoryId: form.watch('firstCategoryId'),
                    secondCategoryId: form.watch('secondCategoryId'),
                    thirdCategoryId: form.watch('thirdCategoryId'),
                    firstCategoryName: form.watch('firstCategoryName'),
                    secondCategoryName: form.watch('secondCategoryName'),
                    thirdCategoryName: form.watch('thirdCategoryName'),
                }
                return (
                    <CategoryCascader
                        value={categoryValue}
                        onChange={(val: CategoryCascaderValue) => {
                            form.setValue('firstCategoryId', val.firstCategoryId || '', { shouldValidate: true })
                            form.setValue('firstCategoryName', val.firstCategoryName || '')
                            form.setValue('secondCategoryId', val.secondCategoryId || '', { shouldValidate: true })
                            form.setValue('secondCategoryName', val.secondCategoryName || '')
                            form.setValue('thirdCategoryId', val.thirdCategoryId || '', { shouldValidate: true })
                            form.setValue('thirdCategoryName', val.thirdCategoryName || '')
                        }}
                        groupId="goods"
                        placeholder="请选择商品分类"
                        maxLevel={3}
                        width="100%"
                    />
                )
            },
            className: "col-span-2"
        },

        // 商品名称和编码
        {
            name: "goodsName",
            label: "商品名称",
            type: "text",
            placeholder: "请输入商品名称",
            required: true,
            className: "col-span-2"
        },
        {
            name: "goodsNo",
            label: "商品编码",
            type: "text",
            placeholder: "请输入商品编码",
            required: false,
            className: "col-span-2"
        },

        // 价格相关
        {
            name: "salePrice",
            label: "销售价格",
            type: "number",
            placeholder: "请输入销售价格",
            required: true,
            className: "col-span-2",
            inputProps: {
                min: 0.01,
                max: 999999.99,
                step: 0.01
            }
        },
        {
            name: "costPrice",
            type: "hidden",
        },

        // 市场价格和销售模式
        {
            name: "marketPrice",
            label: "市场价格",
            type: "number",
            placeholder: "请输入市场价格",
            className: "col-span-2",
            inputProps: {
                min: 0,
                max: 999999.99,
                step: 0.01
            }
        },
        {
            name: "saleType",
            type: "hidden",
            defaultValue: initialData?.saleType ?? 1
        },

        // 开售时间和数量单位
        {
            name: "startSaleTime",
            label: "开售时间",
            type: "custom" as FieldType,
            className: "col-span-2",
            render: ({ value, onChange }: { value: string; onChange: (date: string | undefined) => void }) => (
                <DateTimePicker
                    value={value}
                    onChange={onChange}
                />
            )
        },
        {
            name: "unit",
            label: "数量单位",
            type: "text",
            placeholder: "请输入数量单位",
            className: "col-span-2"
        },

        // 规格类型和配送方式
        {
            name: "skuType",
            label: "规格类型",
            type: "select",
            required: true,
            className: "col-span-2",
            options: SKU_TYPE_OPTIONS as any,
            defaultValue: initialData?.skuType ?? 2
        },
        {
            name: "distributionType",
            type: "hidden",
            defaultValue: initialData?.distributionType ?? 2
        },

        // 排序和SPU编码
        {
            name: "sort",
            label: "排序",
            type: "number",
            placeholder: "请输入排序",
            defaultValue: initialData?.sort ?? 0,
            className: "col-span-2",
            inputProps: {
                min: 0,
                step: 1
            }
        },
        {
            name: "spuCode",
            type: "hidden",
        },

        // 跨列字段
        {
            name: "coverImg",
            label: "封面图",
            type: "upload",
            required: true,
            className: "col-span-1 h-[120px] mb-7",
            error: {
                position: 'bottom',
                offset: {
                    y: -43
                }
            },
            uploadProps: {
                accept: "image/*",
                maxCount: 1,
                listType: "picture-card",
                showUploadList: true,
                children: "上传图片",
                preview: true,
                folder: "goods",
                hideError: true,
                onProgress: () => { }
            }
        },
        {
            name: "carouselImg",
            label: "轮播图(最多5张)",
            type: "upload",
            required: false,
            className: "col-span-3 h-[120px] mb-7",
            error: {
                position: 'bottom',
                offset: {
                    y: -43
                }
            },
            uploadProps: {
                accept: "image/*",
                maxCount: 5,
                listType: "picture-card",
                showUploadList: true,
                children: "上传图片",
                preview: true,
                folder: "goods",
                hideError: true,
                multiple: true,
                multipleRender: true,
                onProgress: () => { }
            }
        },
        {
            name: "goodsTrait",
            label: "商品特点",
            type: "textarea",
            placeholder: "请输入商品特点",
            className: "col-span-4 mb-5",
        },

        // 标识相关
        {
            name: "newFlag",
            label: "新品标识",
            type: "select",
            className: "col-span-2",
            options: FLAG_OPTIONS as any,
            defaultValue: initialData?.newFlag ?? 0
        },
        {
            name: "recommendFlag",
            label: "推荐标识",
            type: "select",
            className: "col-span-2",
            options: FLAG_OPTIONS as any,
            defaultValue: initialData?.recommendFlag ?? 0
        },

        {
            name: "usedFlag",
            type: "hidden",
            defaultValue: initialData?.usedFlag ?? 0
        },
        {
            name: "initSaleCount",
            type: "hidden",
        },

        // 隐藏字段
        {
            name: "brandName",
            type: "hidden",
        },
        {
            name: "firstCategoryName",
            type: "hidden",
        },
        {
            name: "secondCategoryName",
            type: "hidden",
        },
        {
            name: "thirdCategoryName",
            type: "hidden",
        }
    ]

    return (
        <div>
            <CustomForm
                ref={formRef}
                id="custom-form"
                schema={formSchema}
                fields={fields}
                layout={{
                    className: "grid grid-cols-4 gap-x-2 gap-y-6"
                }}
                loading={loading}
                initialData={initialData || {
                    saleType: 1,
                    skuType: 1,
                    distributionType: 2,
                    newFlag: 0,
                    recommendFlag: 0,
                    usedFlag: 0,
                    sort: 0
                }}
                onSubmit={async (data) => {
                    // 处理数组类型的字段
                    const processedData = {
                        ...data,
                        skuList: Array.isArray(data.skuList) ? data.skuList : [],
                        spuList: Array.isArray(data.spuList) ? data.spuList : []
                    }
                    await onSubmit(processedData)
                }}
                mode="onChange"
                criteriaMode="firstError"
            />
            {/* <div className="flex justify-end space-x-2 mt-8">
                <Button variant="outline" type="button">
                    取消
                </Button>
                <Button type="submit" disabled={loading} form="custom-form">
                    {loading ? "保存中..." : "保存"}
                </Button>
            </div> */}
        </div>
    )
})

GoodsBasicInfo.displayName = 'GoodsBasicInfo' 