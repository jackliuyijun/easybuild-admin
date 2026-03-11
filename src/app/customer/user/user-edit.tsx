'use client'

import * as z from "zod"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import { Button } from "@/components/ui/button"
import type { User } from "@/types/user"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { FormField } from "@/components/custom/form/types"
import { useState, useEffect } from "react"
import { UserCircle } from "lucide-react"

// 性别选项
const GENDER_OPTIONS = [
    { value: 'male', label: '男' },
    { value: 'female', label: '女' }
] as const

// 定义表单验证schema
const formSchema = z.object({
    phone: z.string()
        .min(1, "手机号不能为空")
        .regex(/^1[3-9]\d{9}$/, "请输入正确的手机号码"),
    name: z.string()
        .max(20, "用户名最多20个字符")
        .regex(/^[\u4e00-\u9fa5a-zA-Z0-9_-]*$/, "用户名只能包含中文、英文、数字、下划线连字符")
        .optional()
        .or(z.literal('')),
    userNo: z.string()
        .max(12, "会员编号最多12位")
        .regex(/^[A-Za-z0-9]*$/, "会员编号只能包含字母和数字")
        .optional()
        .or(z.literal('')),
    email: z.string()
        .optional()
        .refine(val => !val || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val), {
            message: "请输入正确的邮箱地址"
        }),
    gender: z.string()
        .optional()
        .refine(val => !val || /^(male|female)$/.test(val), {
            message: "请选择正确的性别"
        }),
    remark: z.string()
        .optional()
        .refine(val => !val || val.length <= 200, {
            message: "备注最多200个��符"
        }),
    avatar: z.string().optional(),
    signature: z.string().optional()
})

interface UserEditProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingUser?: User
    onSubmit: (data: any) => Promise<void>
    loading?: boolean
}

export function UserEdit({
    open,
    onOpenChange,
    editingUser,
    onSubmit,
    loading: parentLoading
}: UserEditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)

    // 合并loading状态
    const loading = parentLoading || isSubmitting || isInitializing

    // 表单字段配置
    const fields: FormField[] = [
        {
            name: "phone",
            label: "手机号",
            required: true,
            type: "text",
            placeholder: "请输入手机号"
        },
        {
            name: "name",
            label: "用户名",
            type: "text",
            placeholder: "请输入用户名"
        },
        {
            name: "email",
            label: "邮箱",
            type: "text",
            placeholder: "请输入邮箱"
        },
        {
            name: "gender",
            label: "性别",
            type: "select",
            placeholder: "请选择性别",
            options: GENDER_OPTIONS as any,
            selectProps: {
                popoverProps: {
                    align: 'start',
                    className: 'w-[200px]'
                }
            }
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
                            <UserCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                {editingUser ? "编辑用户" : "新增用户"}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                {editingUser ? "在这里修改用户信息，完成后点击确定保存。" : "请填写用户信息，完成后点击确定保存。"}
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
                            form="user-edit-form"
                            disabled={loading}
                            className="px-8 shadow-sm transition-all active:scale-95"
                        >
                            {isSubmitting ? "正在提交..." : "确定"}
                        </Button>
                    </div>
                </div>
            }
            className="min-h-[50vh] max-h-[55vh] max-w-xl"
        >
            <CustomForm
                id="user-edit-form"
                schema={formSchema}
                fields={fields}
                layout={layout}
                loading={loading}
                mode="onTouched"
                criteriaMode="firstError"
                shouldUnregister={true}
                initialData={editingUser ? {
                    phone: editingUser.phone || '',
                    userNo: editingUser.userNo || '',
                    name: editingUser.name || '',
                    email: editingUser.email || '',
                    gender: editingUser.gender || '',
                    avatar: editingUser.avatar || '',
                    signature: editingUser.signature || '',
                    remark: editingUser.remark || ''
                } : undefined}
                defaultValues={{
                    phone: '',
                    userNo: '',
                    name: '',
                    email: '',
                    gender: '',
                    avatar: '',
                    signature: '',
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