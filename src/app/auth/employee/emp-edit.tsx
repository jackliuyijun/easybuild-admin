'use client'

import * as z from "zod"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import { Button } from "@/components/ui/button"
import type { Employee } from "@/types/employee"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { FormField } from "@/components/custom/form/types"
import { useState, useEffect } from "react"
import { Users } from "lucide-react"

import { getRoleSelectList } from "@/api/role"

// 保持原有的表单验证schema
const formSchema = z.object({
    loginName: z.string()
        .min(4, "登录名不能少于4个字符")
        .max(20, "登录名不能超过20个字符"),
    employeeCode: z.string()
        .regex(/^[A-Za-z0-9]*$/, "工号只能包含字母和数字")
        .max(20, "工号不能超过20个字符")
        .optional()
        .or(z.literal('')),
    employeeName: z.string()
        .min(2, "姓名不能少于2个字符")
        .max(20, "姓名不能超过20个字符"),
    mobile: z.string()
        .regex(/^1[3-9]\d{9}$/, "请输入正确的手机号")
        .optional()
        .or(z.literal('')),
    email: z.string()
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, "请输入正确的邮箱地址")
        .optional()
        .or(z.literal('')),
    departmentId: z.string().optional(),
    departmentName: z.string().optional(),
    roles: z.string().min(1, "请选择角色"),
    rolesName: z.string().optional(),
    position: z.string().optional()
})

interface EmployeeEditProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingEmployee?: Employee
    onSubmit: (data: any) => Promise<void>
    loading?: boolean

    roleOptions: { value: string; label: string }[]
}

export function EmployeeEdit({
    open,
    onOpenChange,
    editingEmployee,
    onSubmit,
    loading: parentLoading,
    roleOptions: initialRoleOptions
}: EmployeeEditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)

    const [roleOptions, setRoleOptions] = useState(initialRoleOptions || [])

    // 合并loading状态
    const loading = parentLoading || isSubmitting || isInitializing

    // 定义表单字段配置
    const fields: FormField[] = [
        {
            name: "loginName",
            label: "登录名",
            required: true,
            type: "text",
            placeholder: "请输入登录名"
        },
        {
            name: "employeeName",
            label: "姓名",
            required: true,
            type: "text",
            placeholder: "请输入姓名"
        },
        {
            name: "roles",
            label: "角色",
            required: true,
            type: "multiSelect",
            placeholder: "请选择角色",
            options: roleOptions,
            onSearch: async (keyword) => {
                const data = await getRoleSelectList({ name: keyword })
                setRoleOptions(prev => {
                    const merged = [...prev]
                    data.forEach((item: any) => {
                        if (!merged.some(existing => existing.value === item.value)) {
                            merged.push(item)
                        }
                    })
                    return merged
                })
                return data
            },
            searchDebounce: 400,
            popoverProps: {
                align: 'start',
                className: 'w-full'
            },
            onChange: (value, form) => {
                const selectedRoles = roleOptions.filter(role =>
                    value.split(',').includes(role.value.toString())
                )
                const rolesName = selectedRoles.map(role => role.label).join(',')
                form.setValue('rolesName', rolesName)
            }
        },
        {
            name: "mobile",
            label: "手机号",
            type: "text",
            placeholder: "请输入手机号"
        },
        {
            name: "employeeCode",
            label: "工号",
            type: "text",
            placeholder: "请输入工号"
        },
        {
            name: "email",
            label: "邮箱",
            type: "text",
            placeholder: "请输入邮箱"
        },
        {
            name: "rolesName",
            label: "角色名称",
            type: "hidden"
        },
        {
            name: "departmentName",
            label: "部门名称",
            type: "hidden"
        },
        {
            name: "departmentId",
            label: "部门ID",
            type: "hidden"
        },
        {
            name: "position",
            label: "职位",
            type: "hidden"
        }
    ]

    // 表单布局配置
    const layout = {
        className: "grid grid-cols-2 gap-x-8 gap-y-6 pt-4"
    }

    // 初始化数据
    useEffect(() => {
        if (open) {
            const initializeData = async () => {
                setIsInitializing(true)
                try {
                    // 加载角色数据
                    const roles = await getRoleSelectList({})
                    setRoleOptions(roles)

                    // 如果是编辑模式，确保手机号正确回显
                    if (editingEmployee) {
                        console.log('Editing employee data:', editingEmployee)
                    }
                } finally {
                    setIsInitializing(false)
                }
            }
            initializeData()
        }
    }, [open, editingEmployee])

    // 处理表单提交
    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            setIsSubmitting(true)
            console.log('Form data before submit:', data)
            await onSubmit(data)
            onOpenChange(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <CustomDialog
            open={open}
            onOpenChange={onOpenChange}
            title={editingEmployee ? "编辑员工" : "新增员工"}
            loading={loading}
            submitting={isSubmitting}
            header={
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                {editingEmployee ? "编辑员工" : "新增员工"}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                {editingEmployee ? "在这里修改员工信息，完成后点击确定保存。" : "请填写员工信息，完成后点击确定保存。"}
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
                            form="employee-edit-form"
                            disabled={loading}
                            className="px-8 shadow-sm transition-all active:scale-95"
                        >
                            {isSubmitting ? "正在提交..." : "确定"}
                        </Button>
                    </div>
                </div>
            }
            maxWidth="2xl"
            height="450px"
        >
            <CustomForm
                id="employee-edit-form"
                schema={formSchema}
                fields={fields}
                layout={layout}
                mode="onTouched"
                criteriaMode="firstError"
                shouldUnregister={true}
                loading={loading}
                initialData={editingEmployee ? {
                    loginName: editingEmployee.loginName || '',
                    employeeCode: editingEmployee.employeeCode || '',
                    employeeName: editingEmployee.employeeName || '',
                    mobile: editingEmployee.mobile || '',
                    email: editingEmployee.email || '',
                    departmentId: editingEmployee.departmentId?.toString() || '',
                    departmentName: editingEmployee.departmentName || '',
                    roles: editingEmployee.roles || '',
                    rolesName: editingEmployee.rolesName || '',
                    position: editingEmployee.position || ''
                } : undefined}
                defaultValues={{
                    loginName: '',
                    employeeCode: '',
                    employeeName: '',
                    mobile: '',
                    email: '',
                    departmentId: '',
                    departmentName: '',
                    roles: '',
                    rolesName: '',
                    position: ''
                }}
                onSubmit={handleSubmit}
                onError={(error) => {
                    console.error('Form error:', error)
                }}
            />
        </CustomDialog>
    )
} 