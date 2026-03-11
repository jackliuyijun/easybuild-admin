'use client'

import * as z from "zod"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import { Button } from "@/components/ui/button"
import type { Tag } from "@/types/tag"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { FormField } from "@/components/custom/form/types"
import { useState, useEffect } from "react"
import { Tags } from "lucide-react"
import { getCategoryDropdownList } from "@/api/category"

// 定义表单验证schema
const formSchema = z.object({
    tagName: z.string().min(2, "标签名称不能少于2个字符").max(20, "标签名称不能超过20个字符")
        .regex(/^[^<>]+$/, "标签名称不能包含特殊字符"),
    tagCode: z.string().regex(/^[A-Za-z0-9_-]+$/, "编码只能包含字母、数字、下划线和横线"),
    categoryCode: z.string().min(1, "请选择分类"),
    categoryName: z.string().optional(),
    subName: z.string().optional(),
    tagDescribe: z.string().max(100, "描述不能超过100个字符").optional()
})

interface TagEditProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingTag?: Tag
    onSubmit: (data: any) => Promise<void>
    loading?: boolean
}

export function TagEdit({
    open,
    onOpenChange,
    editingTag,
    onSubmit,
    loading: parentLoading
}: TagEditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)
    const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string; }[]>([])

    // 合并loading状态
    const loading = parentLoading || isSubmitting || isInitializing

    // 加载分类选项
    const loadCategories = async (keyword: string = '') => {
        try {
            setIsInitializing(true)
            const options = await getCategoryDropdownList({
                categoryName: keyword,
                groupId: 'tag'
            })
            setCategoryOptions(options)
        } catch (error) {
            console.error('Failed to load categories:', error)
        } finally {
            setIsInitializing(false)
        }
    }

    // 初始化数据
    useEffect(() => {
        if (open) {
            loadCategories()
        }
    }, [open])

    // 表单字段配置
    const fields: FormField[] = [
        {
            name: "tagName",
            label: "标签名称",
            required: true,
            type: "text",
            placeholder: "请输入标签名称"
        },
        {
            name: "tagCode",
            label: "编码",
            required: true,
            type: "text",
            placeholder: "请输入编码"
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
                    groupId: 'tag'
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
            searchDebounce: 800,
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
            name: "subName",
            label: "副标题名称",
            type: "text",
            placeholder: "请输入副标题名称"
        },
        {
            name: "tagDescribe",
            label: "描述",
            type: "textarea",
            placeholder: "请输入标签描述",
            className: "col-span-2",
            textareaProps: {
                className: "min-h-[100px]"
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
                            <Tags className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                {editingTag ? "编辑标签" : "新增标签"}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                {editingTag ? "在这里修改标签信息，完成后点击确定保存。" : "请填写标签信息，完成后点击确定保存。"}
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
                            form="tag-edit-form"
                            disabled={loading}
                            className="px-8 shadow-sm transition-all active:scale-95"
                        >
                            {isSubmitting ? "正在提交..." : "确定"}
                        </Button>
                    </div>
                </div>
            }
            maxWidth="2xl"
            className="min-h-[60vh] max-h-[85vh]"
        >
            <CustomForm
                id="tag-edit-form"
                schema={formSchema}
                fields={fields}
                layout={layout}
                mode="onTouched"
                criteriaMode="firstError"
                shouldUnregister={true}
                loading={loading}
                initialData={editingTag ? {
                    tagName: editingTag.tagName,
                    tagCode: editingTag.tagCode,
                    categoryCode: editingTag.categoryCode,
                    categoryName: editingTag.categoryName,
                    subName: editingTag.subName,
                    tagDescribe: editingTag.tagDescribe
                } : undefined}
                defaultValues={{
                    tagName: '',
                    tagCode: '',
                    categoryCode: '',
                    categoryName: '',
                    subName: '',
                    tagDescribe: ''
                }}
                onSubmit={handleSubmit}
                onError={(error) => {
                    console.error('Form error:', error)
                }}
            />
        </CustomDialog>
    )
} 