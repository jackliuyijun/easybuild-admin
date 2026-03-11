'use client'

import * as z from "zod"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { CustomForm } from "@/components/custom/form/custom-form"
import { Button } from "@/components/ui/button"
import type { Banner } from "@/types/banner"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { FormField } from "@/components/custom/form/types"
import { useState, useEffect } from "react"
import { Image } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

// 保持原有的选项配置，改回number类型
export const JUMP_TYPE_OPTIONS = [
    { value: '1', label: '网页' },
    { value: '2', label: '小程序' },
    { value: '3', label: 'APP' }
]

const MEDIA_TYPE_OPTIONS = [
    { value: '0', label: '图片' },
    { value: '1', label: '视频' }
]

// LOCATION_OPTIONS 和 PAGE_TYPE_OPTIONS 保持字符串类型
export const LOCATION_OPTIONS = [
    { value: 'top', label: '顶部' },
    { value: 'middle', label: '中部' },
    { value: 'bottom', label: '底部' },
    { value: 'other', label: '其他' }
]

export const PAGE_TYPE_OPTIONS = [
    { value: 'index', label: '首页' },
    { value: 'list', label: '列表页' }
]

export const SHARE_FLAG_OPTIONS = [
    { value: '0', label: '不可分享' },
    { value: '1', label: '可分享' }
]

// 定义表单验证schema
const formSchema = z.object({
    bannerTitle: z.string().min(1, "标题不能为空"),
    bannerLocation: z.string().min(1, "请选择位置"),
    pageType: z.string().optional(),
    jumpUrl: z.string().optional(),
    sort: z.preprocess(
        (val) => val === '' || val === undefined || val === null ? 0 : Number(val),
        z.number().min(0, "排序必须大于等于0")
    ),
    mediaType: z.preprocess(
        (val) => val === '' || val === undefined || val === null ? 0 : Number(val),
        z.number().min(0, "请选择媒体类型")
    ),
    mediaUrl: z.string().min(1, "请上传媒体文件")
})

interface BannerEditProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingBanner?: Banner
    onSubmit: (data: any) => Promise<void>
    loading?: boolean
}

export function BannerEdit({
    open,
    onOpenChange,
    editingBanner,
    onSubmit,
    loading: parentLoading
}: BannerEditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)

    // 合并loading状态
    const loading = parentLoading || isSubmitting || isInitializing

    // 表单字段配置
    const fields: FormField[] = [
        // --- 基础设置 ---
        {
            name: "bannerTitle",
            label: "标题",
            required: true,
            type: "text",
            placeholder: "请输入banner标题"
        },
        {
            name: "bannerLocation",
            label: "位置",
            required: true,
            type: "select",
            placeholder: "请选择位置",
            options: LOCATION_OPTIONS
        },
        {
            name: "pageType",
            label: "页面类型",
            type: "select",
            placeholder: "请选择页面类型",
            options: PAGE_TYPE_OPTIONS,
            selectProps: {
                popoverProps: {
                    align: 'start',
                    className: 'w-[200px]'
                }
            }
        },
        {
            name: "mediaType",
            label: "媒体类型",
            required: true,
            type: "select",
            placeholder: "请选择媒体类型",
            options: MEDIA_TYPE_OPTIONS
        },
        {
            name: "jumpUrl",
            label: "跳转链接",
            type: "text",
            placeholder: "请输入跳转链接"
        },
        {
            name: "sort",
            label: "排序",
            type: "number",
            placeholder: "请输入排序号",
            inputProps: {
                min: 0,
                step: 1
            }
        },
        {
            name: "mediaUrl",
            label: "媒体文件",
            required: true,
            type: "upload",
            placeholder: "点击或拖拽上传媒体文件",
            className: "col-span-3 h-[120px]",
            error: {
                position: 'bottom',
                offset: {
                    y: -43
                }
            },
            uploadProps: {
                accept: "image/*,video/*",
                maxSize: 50 * 1024 * 1024,
                preview: true,
                folder: "banner",
                hideError: true,
                mediaType: (form: UseFormReturn) => String(form.watch('mediaType')) === '1' ? 'video' : 'image'
            }
        },

    ]

    // 表单布局配置
    const layout = {
        className: "grid grid-cols-3 gap-x-8 gap-y-6 pt-4"
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
                            <Image className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                {editingBanner ? "编辑Banner" : "新增Banner"}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                {editingBanner ? "在这里修改Banner信息，完成后点击确定保存。" : "请填写Banner信息，完成后点击确定保存。"}
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
                            form="banner-edit-form"
                            disabled={loading}
                            className="px-8 shadow-sm transition-all active:scale-95"
                        >
                            {isSubmitting ? "正在提交..." : "确定"}
                        </Button>
                    </div>
                </div>
            }
            maxWidth="4xl"
            className="min-h-[76vh] max-h-[85vh] w-[1400px]"
        >
            <CustomForm
                id="banner-edit-form"
                schema={formSchema}
                fields={fields}
                layout={layout}
                mode="onTouched"
                criteriaMode="firstError"
                shouldUnregister={false}
                loading={loading}
                initialData={editingBanner ? {
                    bannerTitle: editingBanner.bannerTitle,
                    bannerLocation: editingBanner.bannerLocation,
                    pageType: editingBanner.pageType,
                    jumpUrl: editingBanner.jumpUrl,
                    sort: typeof editingBanner.sort === 'string'
                        ? parseInt(editingBanner.sort)
                        : editingBanner.sort,
                    mediaType: (editingBanner.mediaType ?? 0).toString(),
                    mediaUrl: editingBanner.mediaUrl
                } : undefined}
                defaultValues={{
                    bannerTitle: '',
                    bannerLocation: '',
                    pageType: '',
                    jumpUrl: '',
                    sort: 0,
                    mediaType: 0,
                    mediaUrl: ''
                }}
                onSubmit={handleSubmit}
                onError={(error) => {
                    console.error('Form error:', error)
                }}
            />
        </CustomDialog>
    )
}