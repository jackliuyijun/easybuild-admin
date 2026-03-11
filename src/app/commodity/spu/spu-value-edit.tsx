'use client'

import { useState, useEffect, useRef } from 'react'
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import type { CustomFormRef } from "@/components/custom/form/types"
import { Button } from "@/components/ui/button"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { X, Plus } from "lucide-react"
import * as z from "zod"
import type { FormField } from "@/components/custom/form/types"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

// 修改表单验证schema
const formSchema = z.object({
    values: z.array(
        z.preprocess(
            (val) => val === undefined || val === null ? '' : val,
            z.string().min(1, "SPU值不能为空")
        )
    )
        .min(1, "请至少输入一个SPU值")
        .superRefine((values, ctx) => {
            const cleanValues = values.map(v => String(v || '').trim()).filter(Boolean);
            const valueMap = new Map();

            cleanValues.forEach((value, index) => {
                if (!value) return;

                // 判断是否为英文（包含英文字母）
                const isEnglish = /[a-zA-Z]/.test(value);
                const compareValue = isEnglish ? value.toLowerCase() : value;

                // 检查是否已存在（考虑大小写）
                const existingIndex = Array.from(valueMap.entries()).find(
                    ([key, _]) => {
                        const existingIsEnglish = /[a-zA-Z]/.test(key);
                        return existingIsEnglish ?
                            key.toLowerCase() === compareValue :
                            key === compareValue;
                    }
                );

                if (existingIndex) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "SPU值不能重复",
                        path: [`${existingIndex[1]}`]
                    });
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "SPU值不能重复",
                        path: [`${index}`]
                    });
                } else {
                    valueMap.set(value, index);
                }
            });
        })
        .transform(values =>
            Array.from(new Set(
                values
                    .map(v => String(v || '').trim())
                    .filter(v => v !== '')
                    .map(v => {
                        // 保持原始大小写
                        return v;
                    })
            ))
        )
})

interface SpuValueEditProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialValues?: string | string[]
    onSubmit: (value: string) => Promise<void>
}

export function SpuValueEdit({
    open,
    onOpenChange,
    initialValues = [],
    onSubmit
}: SpuValueEditProps) {
    const [valueCount, setValueCount] = useState(1)
    const formRef = useRef<CustomFormRef>(null)

    // 转换初始值
    const parseInitialValues = (value: string | string[]): string[] => {
        if (Array.isArray(value)) {
            return value.filter(v => v && v.trim() !== '')
        }
        // 处理可能包含多个逗号的情况
        return value ? value.split(/\s*,\s*/).filter(v => v && v.trim() !== '') : ['']
    }

    // 动态生成表单字段
    const generateFields = (): FormField[] => {
        return Array.from({ length: valueCount }).map((_, index) => ({
            name: `values.${index}`,
            type: "text",
            placeholder: "请输入SPU值",
            className: "flex-1",
            render: (formField, form) => {
                const fieldError = (form.formState.errors.values as any)?.[index];

                return (
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Input
                                    {...formField}
                                    value={formField.value || ''}
                                    onChange={(e) => {
                                        const newValues = [...(form.getValues('values') || [])]
                                        newValues[index] = e.target.value
                                        form.setValue('values', newValues, {
                                            shouldValidate: true
                                        })
                                    }}
                                    placeholder="请输入SPU值"
                                    className="w-full bg-background hover:bg-accent/50 border-muted-foreground/20"
                                    autoComplete="off"
                                    onKeyDown={(e: React.KeyboardEvent) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                        }
                                    }}
                                />
                            </div>
                            <div className="w-8 flex justify-center">
                                {index > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemove(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        {fieldError && (
                            <p className="text-sm text-destructive">
                                {fieldError.message}
                            </p>
                        )}
                    </div>
                )
            }
        }))
    }

    const handleAdd = () => {
        setValueCount(prev => prev + 1)
    }

    const handleRemove = (index: number) => {
        if (valueCount <= 1) return

        const currentValues = formRef.current?.form.getValues().values || []
        const newValues = currentValues.filter((_: any, i: number) => i !== index)

        if (newValues.length === 0) {
            formRef.current?.form.setValue('values', [''])
            setValueCount(1)
        } else {
            formRef.current?.form.setValue('values', newValues)
            setValueCount(prev => prev - 1)
        }
    }

    useEffect(() => {
        if (open) {
            const parsedValues = parseInitialValues(initialValues)
            setValueCount(Math.max(1, parsedValues.length))
            setTimeout(() => {
                formRef.current?.form.reset({
                    values: parsedValues
                })
            }, 0)
        } else {
            setValueCount(1)
            formRef.current?.form.reset({ values: [''] })
        }
    }, [open, initialValues])

    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            await onSubmit(data.values.join(','))
            onOpenChange(false)
        } catch (error) {
            console.error('提交失败:', error)
        }
    }

    return (
        <CustomDialog
            open={open}
            onOpenChange={onOpenChange}
            header={
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <PackageSearch className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">编辑SPU值</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                在此编辑SPU的值列表，每行代表一个值
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
                            className="px-6 border-muted-foreground/20 hover:bg-muted"
                        >
                            取消
                        </Button>
                        <Button
                            type="submit"
                            form="spu-value-edit-form"
                            className="px-8 shadow-sm transition-all active:scale-95"
                        >
                            确定
                        </Button>
                    </div>
                </div>
            }
            className="sm:max-w-[500px] h-[550px] flex flex-col"
        >
            <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-4">

                <div className="flex flex-col">
                    <CustomForm
                        ref={formRef}
                        id="spu-value-edit-form"
                        schema={formSchema}
                        fields={generateFields()}
                        layout={{
                            className: "space-y-1"
                        }}
                        className="[&_.form-item]:!h-auto [&_.form-item]:!min-h-0 [&_.form-item]:!p-0 [&_.form-item]:!m-0"
                        defaultValues={{
                            values: ['']
                        }}
                        onSubmit={handleSubmit}
                        mode="onChange"
                    />
                    {formRef.current?.form.formState.errors.values && !Array.isArray(formRef.current?.form.formState.errors.values) && (
                        <p className="text-sm text-destructive mt-2">
                            {typeof formRef.current?.form.formState.errors.values === 'object' &&
                                'message' in formRef.current?.form.formState.errors.values
                                ? String(formRef.current?.form.formState.errors.values.message || '')
                                : ''}
                        </p>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleAdd}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                新增
                            </Button>
                        </div>
                        <div className="w-8"></div>
                    </div>
                </div>
            </div>
        </CustomDialog>
    )
} 