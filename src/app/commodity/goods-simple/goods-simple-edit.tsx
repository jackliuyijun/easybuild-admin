'use client'

import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react"
import * as z from "zod"
import { CustomForm } from "@/components/custom/form/custom-form"
import type { CustomFormRef, FieldType, FormField } from "@/components/custom/form/types"
import type { GoodsItem } from "@/types/goods"
import { getMerchantDropdownList } from "@/api/merchant"
import { CategoryCascader, type CategoryCascaderValue } from "@/components/custom/category-cascader"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import { save } from "@/api/goods"

// 表单验证规则
const formSchema = z.object({
    merchantId: z.string().min(1, "请选择所属超市"),
    merchantName: z.string().optional(),

    firstCategoryId: z.string().optional(),
    firstCategoryName: z.string().optional(),
    secondCategoryId: z.string().optional(),
    secondCategoryName: z.string().optional(),

    goodsName: z.string("商品名称格式不正确")
        .min(1, "商品名称不能为空")
        .max(100, "商品名称不能超过100个字符"),

    goodsNo: z.string().optional(),

    salePrice: z.coerce.number("请输入有效的销售价格")
        .min(0, "销售价格不能小于0")
        .max(999999.99, "销售价格不能超过999999.99")
        .default(0),

    surplusStock: z.coerce.number("请输入有效的库存数量")
        .min(0, "库存不能小于0")
        .default(0),

    coverImg: z.string({ message: "请上传封面图" }).min(1, "请上传封面图"),
})

interface GoodsSimpleEditProps {
    open: boolean
    onClose: () => void
    initialData?: GoodsItem
    onComplete?: () => void
}

export const GoodsSimpleEdit = ({
    open,
    onClose,
    initialData,
    onComplete
}: GoodsSimpleEditProps) => {
    const [merchantOptions, setMerchantOptions] = useState<{ value: string; label: string }[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const formRef = useRef<CustomFormRef>(null)

    // 加载超市列表
    useEffect(() => {
        const loadMerchants = async () => {
            try {
                const res = await getMerchantDropdownList()
                setMerchantOptions(res || [])
            } catch (error) {
                console.error("Failed to load merchants:", error)
            }
        }
        if (open) {
            loadMerchants()
        }
    }, [open])

    // 分类由 CategorySelector 组件处理，内部会自动加载


    const fields: FormField[] = [
        {
            name: "merchantId",
            label: "所属超市",
            type: "select",
            placeholder: "请选择超市",
            required: true,
            options: merchantOptions,
            onChange: (value: string, form: UseFormReturn) => {
                const merchant = merchantOptions.find(opt => opt.value === value)
                form.setValue('merchantName', merchant?.label || '')
            }
        },
        {
            name: "firstCategoryId",
            label: "商品分类",
            type: "custom",
            render: (field, form) => (
                <CategoryCascader
                    value={{
                        firstCategoryId: form.watch('firstCategoryId'),
                        firstCategoryName: form.watch('firstCategoryName'),
                        secondCategoryId: form.watch('secondCategoryId'),
                        secondCategoryName: form.watch('secondCategoryName'),
                    }}
                    onChange={(val: CategoryCascaderValue) => {
                        form.setValue('firstCategoryId', val.firstCategoryId || '')
                        form.setValue('firstCategoryName', val.firstCategoryName || '')
                        form.setValue('secondCategoryId', val.secondCategoryId || '')
                        form.setValue('secondCategoryName', val.secondCategoryName || '')
                    }}
                    maxLevel={1}
                    width="100%"
                />
            )
        },
        {
            name: "goodsName",
            label: "商品名称",
            type: "text",
            placeholder: "请输入商品名称",
            required: true
        },
        {
            name: "goodsNo",
            label: "商品编码",
            type: "text",
            placeholder: "请输入商品编码"
        },
        {
            name: "salePrice",
            label: "销售价格",
            type: "number",
            placeholder: "请输入价格",
            inputProps: { min: 0, step: 0.01 }
        },
        {
            name: "surplusStock",
            label: "商品库存",
            type: "number",
            placeholder: "请输入库存",
            inputProps: { min: 0, step: 1 }
        },
        {
            name: "coverImg",
            label: "封面图",
            type: "upload",
            required: true,
            uploadProps: {
                accept: "image/*",
                maxCount: 1,
                listType: "picture-card",
                showUploadList: true,
                preview: true,
                folder: "goods"
            }
        }
    ]

    const handleSubmit = async (data: any) => {
        try {
            setSubmitting(true)
            // 补充一些默认字段以满足后端可能的校验
            const submitData = {
                ...initialData,
                ...data,
                skuType: 1, // 简易版默认为单规格
                saleType: 1, // 现货
                distributionType: 2, // 都可以
                saleFlag: initialData?.saleFlag ?? 0, // 初始待上架
            }

            // 如果是单规格，可能需要构造一个默认 SKU
            if (!submitData.skuList || submitData.skuList.length === 0) {
                submitData.skuList = [{
                    goodsSkuName: data.goodsName,
                    salePrice: data.salePrice,
                    surplusStock: data.surplusStock,
                    coverImg: data.coverImg
                }]
            } else {
                // 如果已有 SKU，更新第一个 SKU 的基本信息
                submitData.skuList[0] = {
                    ...submitData.skuList[0],
                    salePrice: data.salePrice,
                    surplusStock: data.surplusStock,
                    coverImg: data.coverImg
                }
            }

            await save(submitData)

            onComplete?.()
            onClose()
        } catch (error) {
            console.error("Failed to save goods:", error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <CustomDialog
            open={open}
            onOpenChange={(isOpen) => !submitting && onClose()}
            maxWidth="2xl"
            height="580px"
            loading={loading}
            submitting={submitting}
            header={
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                商品{initialData ? '编辑' : '新增'}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                {initialData ? "在这里修改商品基本信息，完成后点击确定保存。" : "请填写商品基本信息，完成后点击确定保存。"}
                            </DialogDescription>
                        </div>
                    </div>
                    <div className="h-px bg-border/50 mt-3 -mx-6 -mb-3" />
                </div>
            }
            footer={
                <div className="flex flex-col w-full">
                    <div className="h-px bg-border/50 -mt-3 mb-4 -mx-6" />
                    <div className="flex justify-end gap-3 w-full">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-6 border-muted-foreground/20 hover:bg-muted"
                        >
                            取消
                        </Button>
                        <Button
                            type="submit"
                            form="simple-goods-form"
                            disabled={submitting}
                            className="px-8 shadow-sm transition-all active:scale-95"
                        >
                            {submitting ? "正在保存..." : "提交保存"}
                        </Button>
                    </div>
                </div>
            }
        >
            <CustomForm
                ref={formRef}
                id="simple-goods-form"
                schema={formSchema}
                fields={fields}
                initialData={initialData}
                onSubmit={handleSubmit}
                layout={{
                    className: "grid grid-cols-2 gap-4 pt-4"
                }}
            />
        </CustomDialog>
    )
}
