'use client'

import * as z from "zod"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import { Button } from "@/components/ui/button"
import type { Role } from "@/types/role"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { FormField } from "@/components/custom/form/types"
import { useState, useEffect } from "react"
import { Shield } from "lucide-react"

// 修改表单验证schema
const formSchema = z.object({
    roleName: z.string()
        .min(2, "角色名称不能少于2个字符")
        .max(20, "角色名称不能超过20个字符")
        .regex(/^[^<>]+$/, "角色名称不能包含特殊字符"),
    remark: z.string()
        .max(100, "备注不能超过100个字符")
        .optional()
})

interface RoleEditProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingRole?: Role
    onSubmit: (data: any) => Promise<void>
    loading?: boolean
}

export function RoleEdit({
    open,
    onOpenChange,
    editingRole,
    onSubmit,
    loading: parentLoading
}: RoleEditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)

    // 合并loading状态
    const loading = parentLoading || isSubmitting || isInitializing

    // 修改表单字段配置
    const fields: FormField[] = [
        {
            name: "roleName",
            label: "角色名称",
            required: true,
            type: "text",
            placeholder: "请输入角色名称"
        },
        {
            name: "remark",
            label: "备注",
            type: "textarea",
            placeholder: "请输入备注信息",
            textareaProps: {
                rows: 3,
                maxLength: 100
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
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                {editingRole ? "编辑角色" : "新增角色"}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                {editingRole ? "在这里修改角色信息，完成后点击确定保存。" : "请填写角色信息，完成后点击确定保存。"}
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
                            form="role-edit-form"
                            disabled={loading}
                            className="px-8 shadow-sm transition-all active:scale-95"
                        >
                            {isSubmitting ? "正在提交..." : "确定"}
                        </Button>
                    </div>
                </div>
            }
            maxWidth="md"
            className="min-h-[55vh] max-h-[85vh]"
        >
            <CustomForm
                id="role-edit-form"
                schema={formSchema}
                fields={fields}
                layout={layout}
                mode="onTouched"
                criteriaMode="firstError"
                shouldUnregister={true}
                loading={loading}
                initialData={editingRole ? {
                    roleName: editingRole.roleName,
                    remark: editingRole.remark
                } : undefined}
                defaultValues={{
                    roleName: '',
                    remark: ''
                }}
                onSubmit={handleSubmit}
                onError={(error) => {
                    console.error('Form error:', error)
                }}
            />
        </CustomDialog>
    )
} 