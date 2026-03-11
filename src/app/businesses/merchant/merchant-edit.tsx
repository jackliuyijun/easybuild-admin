'use client'

import * as z from "zod"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import { Button } from "@/components/ui/button"
import type { Merchant } from "@/types/merchant"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { FormField } from "@/components/custom/form/types"
import { useState, useEffect } from "react"
import { Store } from "lucide-react"

const formSchema = z.object({
    merchantName: z.string()
        .min(1, "超市名称不能为空")
        .max(50, "超市名称不能超过50个字符"),
    title: z.string().max(100, "标题不能超过100个字符").optional().or(z.literal('')),
    subTitle: z.string().max(200, "副标题不能超过200个字符").optional().or(z.literal('')),
    logo: z.string().min(1, "请上传封面图"),
    linkMan: z.string().max(50, "联系人不能超过50个字符").optional().or(z.literal('')),
    linkPhone: z.string().max(20, "联系电话不能超过20个字符").optional().or(z.literal('')),
    businessHours: z.string().max(100, "营业时间不能超过100个字符").optional().or(z.literal('')),
    addressInfo: z.string().max(200, "地址信息不能超过200个字符").optional().or(z.literal(''))
})

interface MerchantEditProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingMerchant?: Merchant
    onSubmit: (data: any) => Promise<void>
    loading?: boolean
}

export function MerchantEdit({
    open,
    onOpenChange,
    editingMerchant,
    onSubmit,
    loading: parentLoading
}: MerchantEditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)

    const loading = parentLoading || isSubmitting || isInitializing

    const fields: FormField[] = [
        {
            name: "merchantName",
            label: "超市名称",
            required: true,
            type: "text",
            placeholder: "请输入超市名称"
        },
        {
            name: "title",
            label: "标题",
            type: "text",
            placeholder: "请输入主标题"
        },
        {
            name: "subTitle",
            label: "副标题",
            type: "text",
            placeholder: "请输入副标题"
        },
        {
            name: "linkMan",
            label: "联系人",
            type: "text",
            placeholder: "请输入联系人"
        },
        {
            name: "linkPhone",
            label: "联系电话",
            type: "text",
            placeholder: "请输入联系电话"
        },
        {
            name: "businessHours",
            label: "营业时间",
            type: "text",
            placeholder: "请输入营业时间"
        },
        {
            name: "addressInfo",
            label: "地址信息",
            type: "text",
            placeholder: "请输入地址信息"
        },
        {
            name: "logo",
            label: "封面图",
            type: "upload",
            required: true,
            placeholder: "点击上传图片",
            className: "col-span-1 h-[140px]",
            uploadProps: {
                accept: "image/*",
                maxCount: 1,
                listType: "picture-card",
                showUploadList: true,
                preview: true,
                folder: "merchant"
            }
        }
    ]

    const layout = {
        className: "grid grid-cols-2 gap-x-6 gap-y-4 pt-4"
    }

    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            setIsSubmitting(true)
            await onSubmit(data)
            onOpenChange(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (open) {
            const initializeData = async () => {
                setIsInitializing(true)
                try {
                } finally {
                    setIsInitializing(false)
                }
            }
            initializeData()
        }
    }, [open])

    return (
        <CustomDialog
            open={open}
            onOpenChange={onOpenChange}
            title={editingMerchant ? "编辑超市" : "新增超市"}
            loading={loading}
            submitting={isSubmitting}
            header={
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Store className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                {editingMerchant ? "编辑超市" : "新增超市"}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                {editingMerchant ? "在这里修改超市商户信息，完成后点击确定保存。" : "请填写超市商户信息，完成后点击确定保存。"}
                            </DialogDescription>
                        </div>
                    </div>
                    <div className="h-px bg-border mt-3 -mx-6 -mb-3" />
                </div>
            }
            footer={
                <div className="flex flex-col w-full">
                    <div className="h-px bg-border/50 -mt-3 mb-4 -mx-6" />
                    <div className="flex justify-end gap-3 w-full">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="px-6 border-muted-foreground/20 hover:bg-muted"
                        >
                            取消
                        </Button>
                        <Button
                            type="submit"
                            form="merchant-edit-form"
                            disabled={loading}
                            className="px-8 shadow-sm transition-all active:scale-95"
                        >
                            {isSubmitting ? "正在提交..." : "确定"}
                        </Button>
                    </div>
                </div>
            }
            maxWidth="2xl"
            height="580px"
            className="min-h-0"
        >
            <CustomForm
                id="merchant-edit-form"
                schema={formSchema}
                fields={fields}
                layout={layout}
                mode="onChange"
                criteriaMode="firstError"
                shouldUnregister={true}
                loading={loading}
                initialData={editingMerchant ? {
                    merchantName: editingMerchant.merchantName,
                    title: editingMerchant.title,
                    subTitle: editingMerchant.subTitle,
                    logo: editingMerchant.logo,
                    linkMan: editingMerchant.linkMan,
                    linkPhone: editingMerchant.linkPhone,
                    businessHours: editingMerchant.businessHours,
                    addressInfo: editingMerchant.addressInfo
                } : undefined}
                defaultValues={{
                    merchantName: '',
                    title: '',
                    subTitle: '',
                    logo: '',
                    linkMan: '',
                    linkPhone: '',
                    businessHours: '',
                    addressInfo: ''
                }}
                onSubmit={handleSubmit}
            />
        </CustomDialog>
    )
}
