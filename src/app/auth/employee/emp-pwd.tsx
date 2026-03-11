'use client'

import * as z from "zod"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import { Button } from "@/components/ui/button"
import type { Employee } from "@/types/employee"
import { DialogTitle } from "@/components/ui/dialog"
import type { FormField } from "@/components/custom/form/types"
import { useState, useEffect } from "react"
import { showMessage, showError } from "@/components/custom/notifications"
import { updateEmployeePassword } from "@/api/employee"
import CryptoJS from 'crypto-js'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// 保持原有的表单验证schema
const formSchema = z.object({
    newPassword: z.string()
        .min(8, "密码不能少于8个字符")
        .max(20, "密码不能超过20个字符")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%])[A-Za-z\d!@#$%]{8,20}$/,
            "密码必须包含大小写字母、数字和特殊字符(!@#$%)"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"]
})

interface EditPwdProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    employee?: Employee
    onSuccess?: () => void
}

export function EditPwd({
    open,
    onOpenChange,
    employee,
    onSuccess
}: EditPwdProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // 合并loading状态
    const loading = isSubmitting || isInitializing

    // 定义表单字段配置
    const fields: FormField[] = [
        {
            name: "newPassword",
            label: "新密码",
            required: true,
            type: "custom",
            render: ({ field, formState }: any) => (
                <div className="relative">
                    <Input
                        type={showNewPassword ? "text" : "password"}
                        {...field}
                        placeholder="请输入新密码"
                        className="pr-10"
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-300 focus:outline-none bg-transparent transition-colors duration-200",
                            "text-gray-500",
                            loading && "cursor-not-allowed opacity-50 pointer-events-none"
                        )}
                        disabled={loading}
                    >
                        {!showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
            )
        },
        {
            name: "confirmPassword",
            label: "确认密码",
            required: true,
            type: "custom",
            render: ({ field, formState }: any) => (
                <div className="relative">
                    <Input
                        type={showConfirmPassword ? "text" : "password"}
                        {...field}
                        placeholder="请再次输入新密码"
                        className="pr-10"
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-300 focus:outline-none bg-transparent transition-colors duration-200",
                            "text-gray-500",
                            loading && "cursor-not-allowed opacity-50 pointer-events-none"
                        )}
                        disabled={loading}
                    >
                        {!showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
            )
        }
    ]

    // 表单布局配置
    const layout = {
        className: "grid grid-cols-1 gap-6"
    }

    // 处理表单提交
    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!employee) return

        try {
            setIsSubmitting(true)
            await updateEmployeePassword({
                employeeId: employee.employeeId,
                password: data.newPassword
            })
            showMessage({ title: '密码修改成功' })
            onSuccess?.()
            onOpenChange(false)
        } catch (error) {
            showError({ title: '密码修改失败' })
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
                <DialogTitle>修改密码</DialogTitle>
            }
            footer={
                <div className="flex justify-end gap-4 w-full">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        取消
                    </Button>
                    <Button
                        type="submit"
                        form="employee-pwd-form"
                        disabled={loading}
                    >
                        {isSubmitting ? "提交中..." : "确定"}
                    </Button>
                </div>
            }
            className="min-h-[50vh] max-h-[85vh] max-w-[500px]"
        >
            {/* 隐藏的诱饵输入框，用于消耗浏览器的自动填充行为 */}
            <div className="absolute opacity-0 -z-10 h-0 w-0 overflow-hidden" aria-hidden="true">
                <input type="text" name="dummy_username" tabIndex={-1} />
                <input type="password" name="dummy_password" tabIndex={-1} />
            </div>
            <CustomForm
                id="employee-pwd-form"
                schema={formSchema}
                fields={fields}
                layout={layout}
                mode="onTouched"
                criteriaMode="firstError"
                shouldUnregister={true}
                loading={loading}
                autoComplete="new-password"
                defaultValues={{
                    newPassword: '',
                    confirmPassword: ''
                }}
                onSubmit={handleSubmit}
                onError={(error) => {
                    console.error('Form error:', error)
                }}
            />
            <div className="mt-8 text-sm text-muted-foreground">
                密码需包含：数字、大小写字母、特殊字符，位数至少8位，特殊字符须在&quot;! @ # $ %&quot;范围内选择。
            </div>
        </CustomDialog>
    )
} 