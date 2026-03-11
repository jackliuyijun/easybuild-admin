'use client'

import * as z from "zod"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import { Button } from "@/components/ui/button"
import type { Group } from "@/types/group"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { FormField } from "@/components/custom/form/types"
import { useState, useEffect } from "react"
import { FolderTree } from "lucide-react"

// 定义表单验证schema
const formSchema = z.object({
    groupName: z.string().min(2, "分组名称不能少于2个字符").max(50, "分组名称不能超过50个字符"),
    groupCode: z.string().min(2, "分组编码不能少于2个字符").max(20, "分组编码不能超过20个字符")
        .regex(/^[A-Za-z0-9]+$/, "编码只能包含字母和数字"),
    groupDescribe: z.string().max(200, "描述不能超过200个字符").optional()
})

interface GroupEditProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingGroup?: Group
    onSubmit: (data: any) => Promise<void>
    loading?: boolean
}

export function GroupEdit({
    open,
    onOpenChange,
    editingGroup,
    onSubmit,
    loading: parentLoading
}: GroupEditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)

    // 合并loading状态
    const loading = parentLoading || isSubmitting || isInitializing

    // 表单字段配置
    const fields: FormField[] = [
        {
            name: "groupName",
            label: "分组名称",
            required: true,
            type: "text",
            placeholder: "请输入分组名称"
        },
        {
            name: "groupCode",
            label: "分组编码",
            required: true,
            type: "text",
            placeholder: "请输入分组编码(仅支持字母和数字)"
        },
        {
            name: "groupDescribe",
            label: "描述",
            type: "textarea",
            placeholder: "请输入分组描述",
            textareaProps: {
                rows: 3
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
                            <FolderTree className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                {editingGroup ? "编辑分组" : "新增分组"}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                {editingGroup ? "在这里修改分组信息，完成后点击确定保存。" : "请填写分组信息，完成后点击确定保存。"}
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
                            form="group-edit-form"
                            disabled={loading}
                            className="px-8 shadow-sm transition-all active:scale-95"
                        >
                            {isSubmitting ? "正在提交..." : "确定"}
                        </Button>
                    </div>
                </div>
            }
            maxWidth="xl"
            className="min-h-[60vh] max-h-[90vh]"
        >
            <CustomForm
                id="group-edit-form"
                schema={formSchema}
                fields={fields}
                layout={layout}
                mode="onTouched"
                criteriaMode="firstError"
                shouldUnregister={true}
                loading={loading}
                initialData={editingGroup ? {
                    groupName: editingGroup.groupName,
                    groupCode: editingGroup.groupCode,
                    groupDescribe: editingGroup.groupDescribe
                } : undefined}
                defaultValues={{
                    groupName: '',
                    groupCode: '',
                    groupDescribe: ''
                }}
                onSubmit={handleSubmit}
                onError={(error) => {
                    console.error('Form error:', error)
                }}
            />
        </CustomDialog>
    )
} 