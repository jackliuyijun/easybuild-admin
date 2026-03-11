'use client'

import * as z from "zod"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import { Button } from "@/components/ui/button"
import type { Department } from "@/types/department"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { FormField } from "@/components/custom/form/types"
import { useState, useEffect } from "react"
import { Building2 } from "lucide-react"

// 保持原有的表单验证schema
const formSchema = z.object({
    name: z.string()
        .min(2, "部门名称不能少于2个字符")
        .max(20, "部门名称不能超过20个字符")
        .regex(/^[^<>]+$/, "部门名称不能包含特殊字符")
})

interface DepartmentEditProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingDepartment?: Department
    onSubmit: (data: any) => Promise<void>
    loading?: boolean
}

export function DepartmentEdit({
    open,
    onOpenChange,
    editingDepartment,
    onSubmit,
    loading: parentLoading
}: DepartmentEditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)

    // 合并loading状态
    const loading = parentLoading || isSubmitting || isInitializing

    // 定义表单字段配置
    const fields: FormField[] = [
        {
            name: "name",
            label: "部门名称",
            required: true,
            type: "text",
            placeholder: "请输入部门名称"
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
            onOpenChange(false)  // 提交成功后关闭对话框
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
            title={editingDepartment ? "编辑部门" : "新增部门"}
            loading={loading}
            submitting={isSubmitting}
            header={
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                {editingDepartment ? "编辑部门" : "新增部门"}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                {editingDepartment ? "在这里修改部门信息，完成后点击确定保存。" : "请填写部门信息，完成后点击确定保存。"}
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
                            form="department-edit-form"
                            disabled={loading}
                            className="px-8 shadow-sm transition-all active:scale-95"
                        >
                            {isSubmitting ? "提交中..." : "确定"}
                        </Button>
                    </div>
                </div>
            }
            maxWidth="md"
            height="300px"
            className="min-h-0"
        >
            <CustomForm
                id="department-edit-form"
                schema={formSchema}
                fields={fields}
                layout={layout}
                mode="onChange"
                criteriaMode="firstError"
                shouldUnregister={true}
                loading={loading}
                initialData={editingDepartment ? {
                    name: editingDepartment.departmentName
                } : undefined}
                defaultValues={{
                    name: ''
                }}
                onSubmit={handleSubmit}
                onError={(error) => {
                    console.error('Form error:', error)
                }}
            />
        </CustomDialog>
    )
}
