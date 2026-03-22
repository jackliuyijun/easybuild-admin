'use client'

import { useEffect, useState, useRef } from 'react'
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import type { CustomFormRef } from "@/components/custom/form/types"
import { Button } from "@/components/ui/button"
import type { SpuConfig } from "@/types/spu-config"
import { SpuValueEdit } from './spu-value-edit'
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import * as z from "zod"
import type { FormField, FieldType } from "@/components/custom/form/types"
import { PackageSearch } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { CategoryCascader, CategoryCascaderValue } from "@/components/custom/category-cascader"

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
    const [spuValueEditOpen, setSpuValueEditOpen] = useState(false)
    const [currentSpuValue, setCurrentSpuValue] = useState<string>('')
    const formRef = useRef<CustomFormRef>(null)

    // 合并loading状态
    const loading = parentLoading || isSubmitting

    // 字段配置
    const fields: FormField[] = [
        {
            name: "spuName",
            label: "SPU名称",
            required: true,
            type: "text",
            placeholder: "请输入SPU名称"
        },
        {
            name: "categories" as any,
            label: "商品分类",
            type: "custom" as FieldType,
            render: (_field, form: UseFormReturn) => {
                const categoryValue: CategoryCascaderValue = {
                    firstCategoryId: form.watch('firstCategoryId'),
                    secondCategoryId: form.watch('secondCategoryId'),
                    firstCategoryName: form.watch('firstCategoryName'),
                    secondCategoryName: form.watch('secondCategoryName'),
                }
                return (
                    <CategoryCascader
                        value={categoryValue}
                        onChange={(val: CategoryCascaderValue) => {
                            form.setValue('firstCategoryId', val.firstCategoryId || '', { shouldValidate: true })
                            form.setValue('firstCategoryName', val.firstCategoryName || '')
                            form.setValue('secondCategoryId', val.secondCategoryId || '', { shouldValidate: true })
                            form.setValue('secondCategoryName', val.secondCategoryName || '')
                        }}
                        groupId="goods"
                        placeholder="请选择商品分类"
                        maxLevel={2}
                        width="100%"
                    />
                )
            }
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

        // 隐藏字段 - 用于存储分类名称
        {
            name: "firstCategoryId",
            type: "hidden",
            className: "hidden"
        },
        {
            name: "secondCategoryId",
            type: "hidden",
            className: "hidden"
        },
        {
            name: "firstCategoryName",
            type: "hidden",
            className: "hidden"
        },
        {
            name: "secondCategoryName",
            type: "hidden",
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