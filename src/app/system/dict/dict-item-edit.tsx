'use client'

import * as z from "zod"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import { Button } from "@/components/ui/button"
import type { DictItem } from "@/types/dict-item"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { FormField } from "@/components/custom/form/types"
import { useState, useEffect } from "react"
import { BookOpen } from "lucide-react"

// 保持原有的表单验证schema
const formSchema = z.object({
    dictKey: z.string()
        .min(2, "字典key不能少于2个字符")
        .max(50, "字典key不能超过50个字符")
        .regex(/^[A-Za-z0-9_]+$/, "字典key只能包含字母、数字和下划线"),
    dictValue: z.string()
        .min(1, "字典值不能为空")
        .max(500, "字典值不能超过500个字符")
})

interface DictItemEditProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingDictItem?: DictItem
    dictId: string
    onSubmit: (data: any) => Promise<void>
    loading?: boolean
}

export function DictItemEdit({
    open,
    onOpenChange,
    editingDictItem,
    dictId,
    onSubmit,
    loading: parentLoading
}: DictItemEditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)
    
    // 合并loading状态
    const loading = parentLoading || isSubmitting || isInitializing

    // 定义表单字段配置
    const fields: FormField[] = [
        {
            name: "dictKey",
            label: "字典key",
            required: true,
            type: "text",
            placeholder: "请输入字典key"
        },
        {
            name: "dictValue",
            label: "字典值",
            required: true,
            type: "textarea",
            placeholder: "请输入字典值",
            textareaProps: {
                maxLength: 500,
                className: "min-h-[100px]"
            }
        }
    ]

    // 表单布局配置
    const layout = {
        className: "grid grid-cols-1 gap-6 pt-4"
    }

    // 处理表单提交
    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            setIsSubmitting(true)
            await onSubmit(data)
            onOpenChange(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    // 初始化数据
    useEffect(() => {
        if (open) {
            const initializeData = async () => {
                setIsInitializing(true)
                try {
                    // 这里添加初始化数据的逻辑
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
            loading={loading}
            submitting={isSubmitting}
            header={
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                {editingDictItem ? "编辑字典项" : "新增字典项"}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                {editingDictItem ? "在这里修改字典项信息，完成后点击确定保存。" : "请填写字典项信息，完成后点击确定保存。"}
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
                            form="dict-item-edit-form"
                            disabled={loading}
                            className="px-8 shadow-sm transition-all active:scale-95"
                        >
                            {isSubmitting ? "正在提交..." : "确定"}
                        </Button>
                    </div>
                </div>
            }
            className="min-h-[50vh] max-h-[85vh] max-w-[500px]"
        >
            <CustomForm
                id="dict-item-edit-form"
                schema={formSchema}
                fields={fields}
                layout={layout}
                mode="onTouched"
                criteriaMode="firstError"
                shouldUnregister={true}
                loading={loading}
                initialData={editingDictItem ? {
                    dictKey: editingDictItem.dictKey,
                    dictValue: editingDictItem.dictValue
                } : undefined}
                defaultValues={{
                    dictKey: '',
                    dictValue: ''
                }}
                onSubmit={handleSubmit}
                onError={(error) => {
                    console.error('Form error:', error)
                }}
            />
        </CustomDialog>
    )
} 