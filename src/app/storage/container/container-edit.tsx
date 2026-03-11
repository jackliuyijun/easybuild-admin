'use client'

import * as z from "zod"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import { Button } from "@/components/ui/button"
import type { Container } from "@/types/container"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { FormField } from "@/components/custom/form/types"
import { useState, useEffect } from "react"
import { Box } from "lucide-react"

const formSchema = z.object({
    name: z.string()
        .min(1, "货柜名称不能为空")
        .max(50, "货柜名称不能超过50个字符"),
    code: z.string().max(50, "货柜编号不能超过50个字符").optional().or(z.literal('')),
    addressInfo: z.string().max(200, "地址信息不能超过200个字符").optional().or(z.literal(''))
})

interface ContainerEditProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingContainer?: Container
    onSubmit: (data: any) => Promise<void>
    loading?: boolean
}

export function ContainerEdit({
    open,
    onOpenChange,
    editingContainer,
    onSubmit,
    loading: parentLoading
}: ContainerEditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)

    const loading = parentLoading || isSubmitting || isInitializing

    const fields: FormField[] = [
        {
            name: "name",
            label: "货柜名称",
            required: true,
            type: "text",
            placeholder: "请输入货柜名称"
        },
        {
            name: "code",
            label: "货柜编号",
            type: "text",
            placeholder: "请输入货柜编号"
        },
        {
            name: "addressInfo",
            label: "地址信息",
            type: "text",
            placeholder: "请输入地址信息"
        }
    ]

    const layout = {
        className: "grid grid-cols-1 gap-6 pt-4"
    }

    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            setIsSubmitting(true)
            await onSubmit(data)
            onOpenChange(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (open) {
            const initializeData = async () => {
                setIsInitializing(true)
                try {
                    // 初始化逻辑
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
            title={editingContainer ? "编辑货柜" : "新增货柜"}
            loading={loading}
            submitting={isSubmitting}
            header={
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Box className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                {editingContainer ? "编辑货柜" : "新增货柜"}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                {editingContainer ? "在这里修改货柜信息，完成后点击确定保存。" : "请填写货柜信息，完成后点击确定保存。"}
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
                            form="container-edit-form"
                            disabled={loading}
                            className="px-8 shadow-sm transition-all active:scale-95"
                        >
                            {isSubmitting ? "正在提交..." : "确定"}
                        </Button>
                    </div>
                </div>
            }
            maxWidth="md"
            height="440px"
            className="min-h-0"
        >
            <CustomForm
                id="container-edit-form"
                schema={formSchema}
                fields={fields}
                layout={layout}
                mode="onChange"
                criteriaMode="firstError"
                shouldUnregister={true}
                loading={loading}
                initialData={editingContainer ? {
                    name: editingContainer.containerName,
                    code: editingContainer.containerCode,
                    addressInfo: editingContainer.addressInfo
                } : undefined}
                defaultValues={{
                    name: '',
                    code: '',
                    addressInfo: ''
                }}
                onSubmit={handleSubmit}
                onError={(error) => {
                    console.error('Form error:', error)
                }}
            />
        </CustomDialog>
    )
}
