'use client'

import * as z from "zod"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import { Button } from "@/components/ui/button"
import type { Brand } from "@/types/brand"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { FormField } from "@/components/custom/form/types"
import { useState, useEffect } from "react"
import { Briefcase } from "lucide-react"
import { getCategoryDropdownList } from "@/api/category"

// 定义表单验证schema
const formSchema = z.object({
    brandName: z.string().min(1, "品牌名称不能为空"),
    categoryCode: z.string().min(1, "请选择分类"),
    categoryName: z.string().optional(),
    logo: z.string().min(1, "请上传品牌Logo"),
    sort: z.number().optional(),
    brandDescribe: z.string().max(100, "描述不能超过100个字符").optional()
})

interface BrandEditProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingBrand?: Brand
    onSubmit: (data: any) => Promise<void>
    loading?: boolean
}

export function BrandEdit({
    open,
    onOpenChange,
    editingBrand,
    onSubmit,
    loading: parentLoading
}: BrandEditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)
    const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([])

    // 合并loading状态
    const loading = parentLoading || isSubmitting || isInitializing

    // 加载分类数据
    const loadCategories = async (keyword: string = '') => {
        try {
            setIsInitializing(true)
            const options = await getCategoryDropdownList({
                categoryName: keyword,
                groupId: 'goods',
                level: 1
            })
            setCategoryOptions(options)
        } catch (error) {
            console.error('Failed to load categories:', error)
        } finally {
            setIsInitializing(false)
        }
    }

    // 表单字段配置
    const fields: FormField[] = [
        {
            name: "brandName",
            label: "品牌名称",
            required: true,
            type: "text",
            placeholder: "请输入品牌名称"
        },
        {
            name: "categoryCode",
            label: "所属分类",
            required: true,
            type: "multiSelect",
            placeholder: "请选择分类",
            options: categoryOptions,
            multiple: false,
            onSearch: async (keyword) => {
                const data = await getCategoryDropdownList({
                    categoryName: keyword,
                    groupId: 'goods',
                    level: 1
                })
                setCategoryOptions(prev => {
                    const merged = [...prev]
                    data.forEach((item: { value: string; label: string }) => {
                        if (!merged.some(existing => existing.value === item.value)) {
                            merged.push(item)
                        }
                    })
                    return merged
                })
                return data
            },
            searchDebounce: 400,
            popoverProps: {
                align: 'start',
                className: 'w-full'
            },
            onChange: (value, form) => {
                const category = categoryOptions.find(opt => opt.value === value)
                form.setValue('categoryName', category?.label || '')
            }
        },
        {
            name: "sort",
            label: "排序",
            type: "number",
            placeholder: "请输入排序号",
            inputProps: {
                min: 0,
                step: 1
            }
        },
        {
            name: "logo",
            label: "Logo",
            required: true,
            type: "upload",
            placeholder: "点击或拖拽上传Logo图片",
            className: "h-[120px]",
            uploadProps: {
                accept: "image/*",
                maxSize: 2 * 1024 * 1024,
                preview: true,
                folder: "brand",
                hideError: true
            }
        },
        {
            name: "brandDescribe",
            label: "描述",
            type: "textarea",
            placeholder: "请输入品牌描述",
            className: "col-span-2",
            textareaProps: {
                className: "min-h-[100px]",
                maxLength: 100
            }
        }
    ]

    // 表单布局配置
    const layout = {
        className: "grid grid-cols-2 gap-x-8 gap-y-6 pt-4"
    }

    // 处理表单提交
    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            setIsSubmitting(true)
            await onSubmit(data)
        } finally {
            setIsSubmitting(false)
        }
    }

    // 初始化数据
    useEffect(() => {
        if (open) {
            loadCategories()
        }
    }, [open])

    return (
        <CustomDialog
            open={open}
            onOpenChange={onOpenChange}
            loading={loading}
            submitting={isSubmitting}
            header={
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                {editingBrand ? "编辑品牌" : "新增品牌"}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                {editingBrand ? "在这里修改品牌信息，完成后点击确定保存。" : "请填写品牌信息，完成后点击确定保存。"}
                            </DialogDescription>
                        </div>
                    </div>
                    <div className="h-px bg-border mt-3 -mx-6 -mb-3" />
                </div>
            }
            footer={
                <div className="flex flex-col w-full">
                    <div className="h-px bg-border -mt-3 mb-4 -mx-6" />
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
                            form="brand-edit-form"
                            disabled={loading}
                            className="px-8 shadow-sm transition-all active:scale-95"
                        >
                            {isSubmitting ? "正在提交..." : "确定"}
                        </Button>
                    </div>
                </div>
            }
            maxWidth="2xl"
            className="min-h-[70vh] max-h-[85vh]"
        >
            <CustomForm
                id="brand-edit-form"
                schema={formSchema}
                fields={fields}
                layout={layout}
                mode="onTouched"
                criteriaMode="firstError"
                shouldUnregister={true}
                loading={loading}
                initialData={editingBrand ? {
                    brandName: editingBrand.brandName,
                    categoryCode: editingBrand.categoryId,
                    categoryName: editingBrand.categoryName,
                    logo: editingBrand.logo,
                    sort: typeof editingBrand.sort === 'string'
                        ? parseInt(editingBrand.sort)
                        : editingBrand.sort || 0,
                    brandDescribe: editingBrand.describe
                } : undefined}
                defaultValues={{
                    brandName: '',
                    categoryCode: '',
                    categoryName: '',
                    logo: '',
                    sort: 0,
                    brandDescribe: ''
                }}
                onSubmit={handleSubmit}
                onError={(error) => {
                    console.error('Form error:', error)
                }}
            />
        </CustomDialog>
    )
} 