'use client'

import * as z from "zod"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import { Button } from "@/components/ui/button"
import type { Dict } from "@/types/dict"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { FormField } from "@/components/custom/form/types"
import { useState, useEffect } from "react"
import { BookOpen } from "lucide-react"

// 保持原有的表单验证schema
const formSchema = z.object({
    moduleName: z.string()
        .min(2, "模块名称不能少于2个字符")
        .max(20, "模块名称不能超过20个字符")
        .regex(/^[^<>]+$/, "模块名称不能包含特殊字符"),
    dictName: z.string()
        .min(2, "字典名称不能少于2个字符")
        .max(20, "字典名称不能超过20个字符")
        .regex(/^[^<>]+$/, "字典名称不能包含特殊字符"),
    dictCode: z.string()
        .min(2, "字典编码不能少于2个字符")
        .max(20, "字典编码不能超过20个字符")
        .regex(/^[A-Za-z0-9_]+$/, "字典编码只能包含字母、数字和下划线"),
    dictDescribe: z.string().max(200, "描述不能超过200个字符").optional()
})

interface DictEditProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingDict?: Dict
    onSubmit: (data: any) => Promise<void>
    loading?: boolean
}

export function DictEdit({
    open,
    onOpenChange,
    editingDict,
    onSubmit,
    loading: parentLoading
}: DictEditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)

    // 合并loading状态
    const loading = parentLoading || isSubmitting || isInitializing

    // 定义表单字段配置
    const fields: FormField[] = [
        {
            name: "moduleName",
            label: "模块名称",
            required: true,
            type: "text",
            placeholder: "请输入模块名称"
        },
        {
            name: "dictName",
            label: "字典名称",
            required: true,
            type: "text",
            placeholder: "请输入字典名称"
        },
        {
            name: "dictCode",
            label: "字典编码",
            required: true,
            type: "text",
            placeholder: "请输入字典编码"
        },
        {
            name: "dictDescribe",
            label: "描述",
            type: "textarea",
            placeholder: "请输入字典描述",
            className: "col-span-2 h-[140px]"
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
                                {editingDict ? "编辑字典" : "新增字典"}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                {editingDict ? "在这里修改字典信息，完成后点击确定保存。" : "请填写字典信息，完成后点击确定保存。"}
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
                            form="dict-edit-form"
                            disabled={loading}
                            className="px-8 shadow-sm transition-all active:scale-95"
                        >
                            {isSubmitting ? "正在提交..." : "确定"}
                        </Button>
                    </div>
                </div>
            }
            className="min-h-[70vh] max-h-[85vh]"
        >
            <CustomForm
                id="dict-edit-form"
                schema={formSchema}
                fields={fields}
                layout={layout}
                mode="onTouched"
                criteriaMode="firstError"
                shouldUnregister={true}
                loading={loading}
                initialData={editingDict ? {
                    moduleName: editingDict.moduleName,
                    dictName: editingDict.dictName,
                    dictCode: editingDict.dictCode,
                    dictDescribe: editingDict.dictDescribe
                } : undefined}
                defaultValues={{
                    moduleName: '',
                    dictName: '',
                    dictCode: '',
                    dictDescribe: ''
                }}
                onSubmit={handleSubmit}
                onError={(error) => {
                    console.error('Form error:', error)
                }}
            />
        </CustomDialog>
    )
} 