'use client'

import { useEffect, useState, useRef } from 'react'
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import type { CustomFormRef } from "@/components/custom/form/types"
import { Button } from "@/components/ui/button"
import type { SpuConfig } from "@/types/spu-config"
import { getCategoryDropdownList } from "@/api/category"
import { SpuValueEdit } from './spu-value-edit'
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import * as z from "zod"
import type { FormField } from "@/components/custom/form/types"
import { PackageSearch } from "lucide-react"

// 定义表单验证schema
const formSchema = z.object({
    spuName: z.string()
        .min(1, "SPU名称不能为空")
        .max(50, "SPU名称不能超过50个字符")
        .regex(/^[a-zA-Z0-9\u4e00-\u9fa5]+$/, "SPU名称只能包含中文、英文和数字"),
    spuValue: z.string()
        .min(1, "SPU值不能为空"),
    firstCategoryId: z.string()
        .optional()
        .refine(val => !val || val.length > 0, "请选择一级分类"),
    secondCategoryId: z.string()
        .optional()
        .refine(val => !val || val.length > 0, "请选择二级分类"),
    firstCategoryName: z.string().optional(),
    secondCategoryName: z.string().optional(),
})

interface SpuConfigEditProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingSpuConfig?: SpuConfig
    onSubmit: (data: any) => Promise<void>
    loading?: boolean
}

export const SpuConfigEdit = ({
    open,
    onOpenChange,
    editingSpuConfig,
    onSubmit,
    loading: parentLoading
}: SpuConfigEditProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)
    const [spuValueEditOpen, setSpuValueEditOpen] = useState(false)
    const [currentSpuValue, setCurrentSpuValue] = useState<string>('')
    const [categoryOptions, setCategoryOptions] = useState({
        first: [] as { value: string; label: string }[],
        second: [] as { value: string; label: string }[]
    })
    const formRef = useRef<CustomFormRef>(null)

    // 合并loading状态
    const loading = parentLoading || isSubmitting || isInitializing

    // 加载分类选项的通用函数
    const loadCategories = async (level: number, parentId?: string, keyword: string = '') => {
        try {
            const options = await getCategoryDropdownList({
                level,
                parentId,
                categoryName: keyword,
                groupId: 'goods'
            })
            return options
        } catch (error) {
            console.error('Failed to load categories:', error)
            return []
        }
    }

    // 使用 useRef 来存储上一次的值
    const lastValueRef = useRef<{
        firstCategory?: string
        secondCategory?: string
        thirdCategory?: string
    }>({})

    // 字段配置
    const fields: FormField[] = [
        {
            name: "spuName",
            label: "SPU名称",
            required: true,
            type: "text",
            placeholder: "请输入SPU名称",
            className: "col-span-2"
        },
        {
            name: "spuValue",
            label: "SPU值",
            required: true,
            type: "textarea",
            placeholder: "请编辑SPU值",
            className: "col-span-2 h-[100px] mb-7",
            readOnly: true,
            error: {
                position: 'bottom',
                offset: { y: -40 },
            },
            suffix: (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        const currentValue = formRef.current?.form.getValues('spuValue')
                        setCurrentSpuValue(currentValue || '')
                        setSpuValueEditOpen(true)
                    }}
                    disabled={loading}
                >
                    编辑值
                </Button>
            )
        },
        {
            name: "firstCategoryId",
            label: "一级分类",
            type: "multiSelect",
            placeholder: "请选择一级分类",
            options: categoryOptions.first,
            multiple: false,
            onSearch: async (keyword) => {
                if (!keyword) return categoryOptions.first
                const options = await loadCategories(1, undefined, keyword)
                setCategoryOptions(prev => ({
                    ...prev,
                    first: options
                }))
                return options
            },
            onChange: async (value, form) => {
                // 更新一级分类名称和清空下级分类
                const selectedOption = categoryOptions.first.find(opt => opt.value === value)
                form.setValue('firstCategoryName', selectedOption?.label || '')
                form.setValue('secondCategoryId', '')
                form.setValue('secondCategoryName', '')

                // 更新分类选项
                if (value) {
                    const options = await loadCategories(2, value)
                    setCategoryOptions(prev => ({
                        ...prev,
                        second: options
                    }))
                } else {
                    setCategoryOptions(prev => ({
                        ...prev,
                        second: []
                    }))
                }
            }
        },
        {
            name: "secondCategoryId",
            label: "二级分类",
            type: "multiSelect",
            placeholder: "请选择二级分类",
            options: categoryOptions.second,
            multiple: false,
            disabled: (form) => !form.watch('firstCategoryId'),
            onSearch: async (keyword) => {
                const firstId = formRef.current?.form.getValues('firstCategoryId')
                if (!firstId || !keyword) return categoryOptions.second

                const options = await loadCategories(2, firstId, keyword)
                setCategoryOptions(prev => ({
                    ...prev,
                    second: options
                }))
                return options
            },
            onChange: async (value, form) => {
                // 更新二级分类名称
                const selectedOption = categoryOptions.second.find(opt => opt.value === value)
                form.setValue('secondCategoryName', selectedOption?.label || '')
            }
        },

        // 隐藏字段 - 用于存储分类名称
        {
            name: "firstCategoryName",
            type: "text",
            className: "hidden"
        },
        {
            name: "secondCategoryName",
            type: "text",
            className: "hidden"
        }
    ]

    // 处理表单提交
    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            setIsSubmitting(true)
            await onSubmit(data)
        } catch (error) {
            console.error('Failed to submit spu config:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // 处理SPU值编辑提交
    const handleSpuValueSubmit = async (value: string) => {
        formRef.current?.form.setValue('spuValue', value, {
            shouldValidate: true
        })
        setSpuValueEditOpen(false)
    }

    // 初始化数据
    useEffect(() => {
        if (open) {
            const initializeCategories = async () => {
                setIsInitializing(true)
                try {
                    // 加载一级分类
                    const firstOptions = await loadCategories(1)
                    setCategoryOptions(prev => ({
                        ...prev,
                        first: firstOptions
                    }))

                    // 如果是编辑模式，加载已选分类的选项
                    if (editingSpuConfig) {
                        if (editingSpuConfig.firstCategoryId) {
                            const secondOptions = await loadCategories(2, editingSpuConfig.firstCategoryId)
                            setCategoryOptions(prev => ({
                                ...prev,
                                second: secondOptions
                            }))
                        }
                    }
                } finally {
                    setIsInitializing(false)
                }
            }
            initializeCategories()
        }
    }, [open, editingSpuConfig])

    useEffect(() => {
        if (open && editingSpuConfig) {
            setCurrentSpuValue(editingSpuConfig.spuValue || '')
        }
    }, [open, editingSpuConfig])

    return (
        <>
            <CustomDialog
                open={open}
                onOpenChange={onOpenChange}
                loading={loading}
                submitting={isSubmitting}
                header={
                    <div className="flex flex-col w-full">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <PackageSearch className="w-6 h-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight">
                                    {editingSpuConfig ? "编辑SPU配置" : "新增SPU配置"}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                    {editingSpuConfig ? "在这里修改SPU配置信息，完成后点击确定保存。" : "请填写SPU配置信息，完成后点击确定保存。"}
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
                                form="spu-config-form"
                                disabled={loading}
                                className="px-8 shadow-sm transition-all active:scale-95"
                            >
                                {isSubmitting ? "正在提交..." : "确定"}
                            </Button>
                        </div>
                    </div>
                }
                className="min-h-[65vh] max-h-[85vh]"
            >
                <CustomForm
                    ref={formRef}
                    id="spu-config-form"
                    schema={formSchema}
                    fields={fields}
                    layout={{
                        className: "grid grid-cols-2 gap-x-8 gap-y-6 pt-4"
                    }}
                    loading={loading}
                    initialData={editingSpuConfig ? {
                        spuName: editingSpuConfig.spuName || '',
                        spuValue: editingSpuConfig.spuValue || '',
                        firstCategoryId: editingSpuConfig.firstCategoryId || '',
                        secondCategoryId: editingSpuConfig.secondCategoryId || '',
                        firstCategoryName: editingSpuConfig.firstCategoryName || '',
                        secondCategoryName: editingSpuConfig.secondCategoryName || ''
                    } : undefined}
                    defaultValues={{
                        spuName: '',
                        spuValue: '',
                        firstCategoryId: '',
                        secondCategoryId: '',
                        firstCategoryName: '',
                        secondCategoryName: ''
                    }}
                    onSubmit={handleSubmit}
                />
            </CustomDialog>

            <SpuValueEdit
                open={spuValueEditOpen}
                onOpenChange={setSpuValueEditOpen}
                initialValues={currentSpuValue}
                onSubmit={handleSpuValueSubmit}
            />
        </>
    )
}