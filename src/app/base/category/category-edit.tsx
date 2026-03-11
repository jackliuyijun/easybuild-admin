'use client'

import * as z from "zod"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import { Button } from "@/components/ui/button"
import type { Category } from "@/types/category"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { FormField } from "@/components/custom/form/types"
import { useState, useEffect } from "react"
import { FolderOpen } from "lucide-react"
import { getCategoryDropdownList } from "@/api/category"

// 定义表单验证schema
const formSchema = z.object({
    level: z.string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val >= 1 && val <= 3, "级别必须是1、2或3"),
    categoryName: z.string()
        .min(2, "分类名称不能少于2个字符")
        .max(20, "分类名称不能超过20个字符")
        .regex(/^[^<>]+$/, "分类名称不能包含特殊字符"),

    parentId: z.string().optional(),
    parentName: z.string().optional(),
    sort: z.coerce.number().min(0, "排序号必须大于或等于0").optional(),
    categoryDescribe: z.string()
        .max(200, "描述不能超过200个字符")
        .optional()
})

interface CategoryEditProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingCategory?: Category
    onSubmit: (data: any) => Promise<void>
    loading?: boolean
}

export function CategoryEdit({
    open,
    onOpenChange,
    editingCategory,
    onSubmit,
    loading: parentLoading
}: CategoryEditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)
    const [parentOptions, setParentOptions] = useState<{ value: string; label: string }[]>([])

    // 合并loading状态
    const loading = parentLoading || isSubmitting || isInitializing

    // 表单字段配置
    const fields: FormField[] = [
        {
            name: "level",
            label: "级别",
            required: true,
            type: "select",
            placeholder: "请选择分类级别",
            options: [
                { value: "1", label: "1级" },
                { value: "2", label: "2级" },
                { value: "3", label: "3级" }
            ],
            onChange: async (value, form) => {
                const newLevel = parseInt(value, 10)

                // 1级分类没有上级，清空上级选择
                if (newLevel === 1) {
                    form.setValue('parentId', '')
                    form.setValue('parentName', '')
                    setParentOptions([])
                } else {
                    // 2级和3级需要重新加载对应的上级分类
                    const currentParentId = form.getValues('parentId')
                    // 清空当前选择的上级（因为等级变了，原来的上级可能不适用）
                    form.setValue('prentId', '')
                    form.setValue('parentName', '')
                    // 加载新等级对应的上级分类选项（使用 silent 模式避免触发整个表单刷新）
                    await loadParentCategories('', newLevel, true)
                }
            }
        },
        {
            name: "categoryName",
            label: "分类名称",
            required: true,
            type: "text",
            placeholder: "请输入分类名称"
        },

        {
            name: "parentId",
            label: "上级分类",
            type: "multiSelect",
            placeholder: "请选择上级分类",
            options: parentOptions,
            multiple: false,
            onSearch: async (keyword, form) => {
                const currentLevel = form?.getValues('level')

                // 如果是1级分类，不需要上级分类
                if (!currentLevel || parseInt(currentLevel, 10) === 1) {
                    return []
                }

                const searchParams: any = { name: keyword }
                const levelNum = parseInt(currentLevel, 10)

                // 根据当前等级查询上级分类（当前等级-1）
                if (levelNum > 1) {
                    searchParams.level = levelNum - 1
                }

                const data = await getCategoryDropdownList(searchParams)

                // 合并到现有选项中，避免重复
                setParentOptions(prev => {
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
                const parent = parentOptions.find(opt => opt.value === value)
                form.setValue('parentName', parent?.label || '')
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
            name: "categoryDescribe",
            label: "描述",
            type: "textarea",
            placeholder: "请输入分类描述",
            className: "col-span-2",
            textareaProps: {
                className: "min-h-[100px]",
                maxLength: 200
            }
        }
    ]

    // 表单布局配置
    const layout = {
        className: "grid grid-cols-2 gap-x-8 gap-y-6 pt-4"
    }

    // 加载上级分类数据
    const loadParentCategories = async (keyword: string = '', level?: number, silent: boolean = false) => {
        try {
            // silent 模式下不设置 loading 状态，避免触发整个表单重新渲染
            if (!silent) {
                setIsInitializing(true)
            }
            const searchParams: any = { categoryName: keyword }
            if (level && level > 1) {
                searchParams.level = level - 1
            }
            const options = await getCategoryDropdownList(searchParams)
            setParentOptions(options)
        } catch (error) {
            console.error('Failed to load parent categories:', error)
        } finally {
            if (!silent) {
                setIsInitializing(false)
            }
        }
    }


    // 处理表单提交
    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            setIsSubmitting(true)
            await onSubmit({
                ...data,
                level: data.level,
                sort: data.sort ?? 0
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // 初始化数据
    useEffect(() => {
        if (open) {

            // 按需加载上级分类数据：只有当编辑模式且有上级分类时才预加载
            if (editingCategory && editingCategory.level > 1 && editingCategory.parentId && editingCategory.parentName) {
                // 有上级分类，先设置当前上级到选项中，然后加载完整列表
                setParentOptions([{
                    value: editingCategory.parentId,
                    label: editingCategory.parentName
                }])
                // 静默加载完整的上级分类列表
                loadParentCategories('', editingCategory.level, true)
            } else {
                // 清空上级分类选项（新建或1级分类）
                setParentOptions([])
            }
        }
    }, [open, editingCategory])

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
                            <FolderOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                {editingCategory ? "编辑分类" : "新增分类"}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                {editingCategory ? "在这里修改分类信息，完成后点击确定保存。" : "请填写分类信息，完成后点击确定保存。"}
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
                            form="category-edit-form"
                            disabled={loading}
                            className="px-8 shadow-sm transition-all active:scale-95"
                        >
                            {isSubmitting ? "正在提交..." : "确定"}
                        </Button>
                    </div>
                </div>
            }
            className="max-w-2xl min-h-[65vh] max-h-[85vh]"
        >
            <CustomForm
                id="category-edit-form"
                schema={formSchema}
                fields={fields}
                layout={layout}
                mode="onTouched"
                criteriaMode="firstError"
                shouldUnregister={true}
                loading={loading}
                initialData={editingCategory ? {
                    level: editingCategory.level.toString(),
                    categoryName: editingCategory.categoryName,
                    parentId: editingCategory.parentId,
                    parentName: editingCategory.parentName,
                    sort: editingCategory.sort,
                    categoryDescribe: editingCategory.categoryDescribe
                } : undefined}
                defaultValues={{
                    level: "1",
                    categoryName: '',
                    parentId: '',
                    parentName: '',
                    sort: 0,
                    categoryDescribe: ''
                }}
                onSubmit={handleSubmit}
                onError={(error) => {
                    console.error('Form error:', error)
                }}
            />
        </CustomDialog>
    )
}