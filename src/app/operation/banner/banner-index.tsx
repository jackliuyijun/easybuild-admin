'use client'

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import type { TableColumn } from "@/components/custom/table"
import { Plus, Search, RotateCw, Eye, Play, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useCallback } from "react"
import { getBannerList, saveBanner, toggleBannerForbiddenFlag, deleteBanner } from "@/api/banner"
import type { Banner } from "@/types/banner"
import { useDebounce } from "@/hooks/use-debounce"
import { showMessage, showError } from '@/components/custom/notifications'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { FORBIDDEN_FLAG_CONFIG, FORBIDDEN_FLAG_OPTIONS, getForbiddenFlagConfig } from '@/config/forbidden-flag'
import { BannerEdit } from "./banner-edit"
import { DEFAULT_PAGE_SIZE } from "@/config/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { ImagePreview } from "@/components/ui/image-preview"
import { JUMP_TYPE_OPTIONS, SHARE_FLAG_OPTIONS, LOCATION_OPTIONS, PAGE_TYPE_OPTIONS } from './banner-edit'
import { VideoPreview } from "@/components/ui/video-preview"
import { CustomTable } from "@/components/custom/table"
import { Switch } from "@/components/ui/switch"
import { ApiResponse } from '@/types/api'
import { usePageTitle } from '@/store'

// 状态选项
const STATUS_OPTIONS = FORBIDDEN_FLAG_OPTIONS

export function BannerPage() {
    const { setPageTitle } = usePageTitle();
    // 状态定义
    const [searchKeyword, setSearchKeyword] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [banners, setBanners] = useState<Banner[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingBanner, setEditingBanner] = useState<Banner | undefined>()
    const debouncedKeyword = useDebounce(searchKeyword, 800)
    const [forbiddenFlagFilter, setForbiddenFlagFilter] = useState<number | undefined>(undefined)
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        banner?: Banner;
    }>({ open: false })
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        banner?: Banner;
    }>({ open: false })
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [previewImage, setPreviewImage] = useState<{
        open: boolean;
        url?: string;
    }>({ open: false })
    const [videoPreview, setVideoPreview] = useState<{
        open: boolean;
        url?: string;
    }>({ open: false })

    // 获取banner列表
    const fetchBanners = useCallback(async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true)
            const res = await getBannerList({
                page: currentPage,
                limit: pageSize,
                bannerTitle: debouncedKeyword || undefined,
                forbiddenFlag: forbiddenFlagFilter
            }) as any
            setBanners(res.data)
            setTotal(res.count || 0)
        } catch (error) {
            console.error('Failed to fetch banners:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, debouncedKeyword, forbiddenFlagFilter, pageSize])

    // 监听页码和搜索关键词变化
    useEffect(() => {
        setPageTitle('Banner管理');
        fetchBanners()
    }, [setPageTitle, fetchBanners])

    // 处理刷新
    const handleRefresh = () => {
        fetchBanners(true)
    }

    // 处理页码变化
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setSelectedIds([])
    }

    // 处理每条数变化
    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
        setSelectedIds([])
    }

    // 处理搜索
    const handleSearch = (value: string) => {
        setSearchKeyword(value)
        setCurrentPage(1)
        setSelectedIds([])
    }

    // 处理新建
    const handleCreate = () => {
        setEditingBanner(undefined)
        setDialogOpen(true)
    }

    // 处理编辑
    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner)
        setDialogOpen(true)
    }

    // 处理全选/取消全选
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(banners.map(banner => banner.bannerId))
        } else {
            setSelectedIds([])
        }
    }

    // 处理单个选择
    const handleSelect = (bannerId: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, bannerId])
        } else {
            setSelectedIds(prev => prev.filter(id => id !== bannerId))
        }
    }

    // 处理提交
    const handleSubmit = async (data: any) => {
        try {
            await saveBanner({
                ...(editingBanner?.bannerId ? { bannerId: editingBanner.bannerId } : {}),
                ...data
            })

            showMessage({
                title: `${editingBanner ? '编辑' : '新增'}成功`,
                description: `Banner"${data.bannerTitle}"已${editingBanner ? '更新' : '创建'}`
            })

            fetchBanners(true)
            setDialogOpen(false)
        } catch (error: any) {
            showError({
                title: `${editingBanner ? '编辑' : '新增'}失败`,
                description: error.message || '请稍后重试'
            })
            throw error
        }
    }

    // 处理状态筛选变化
    const handleForbiddenFlagChange = (value: number | undefined) => {
        setForbiddenFlagFilter(value)
        setCurrentPage(1)
        setSelectedIds([])
    }

    // 处理状态切换
    const handleToggleForbiddenFlag = async (banner: Banner) => {
        setConfirmDialog({
            open: true,
            banner
        })
    }

    // 确认状态切换
    const handleConfirmToggle = async () => {
        if (!confirmDialog.banner) return

        try {
            const bannerIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : confirmDialog.banner.bannerId

            const newForbiddenFlag = confirmDialog.banner.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                ? FORBIDDEN_FLAG_CONFIG.disable.value
                : FORBIDDEN_FLAG_CONFIG.enable.value

            await toggleBannerForbiddenFlag({
                ids: bannerIds,
                value: newForbiddenFlag
            })

            showMessage({
                title: "操作成功",
                description: `已${getForbiddenFlagConfig(newForbiddenFlag).actionText}选中Banner`
            })

            setSelectedIds([])
            fetchBanners(true)
        } catch (error: any) {
            showError({
                title: "操作失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setConfirmDialog({ open: false })
        }
    }

    // 处理删除
    const handleDelete = (banner: Banner) => {
        setDeleteDialog({
            open: true,
            banner
        })
    }

    // 确认删除
    const handleConfirmDelete = async () => {
        if (!deleteDialog.banner) return

        try {
            const bannerIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : deleteDialog.banner.bannerId

            await deleteBanner(bannerIds)

            showMessage({
                title: "删除成功",
                description: "选中Banner已删除"
            })

            setSelectedIds([])
            fetchBanners(true)
        } catch (error: any) {
            showError({
                title: "删除失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setDeleteDialog({ open: false })
        }
    }

    // 处理图片预览
    const handlePreviewImage = (url: string) => {
        setPreviewImage({
            open: true,
            url
        })
    }

    // 处理视频预览
    const handlePreviewVideo = (url: string) => {
        setVideoPreview({
            open: true,
            url
        })
    }

    // 表格列配置
    const columns: TableColumn<Banner>[] = [
        {
            key: 'selection' as keyof Banner,
            title: (
                <Checkbox
                    checked={
                        selectedIds.length > 0 && selectedIds.length < banners.length
                            ? "indeterminate"
                            : banners.length > 0 && selectedIds.length === banners.length
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="全选"
                />
            ) as any,
            width: 40,
            fixed: 'left',
            align: 'center',
            render: (_, record) => (
                <Checkbox
                    checked={selectedIds.includes(record.bannerId)}
                    onCheckedChange={(checked) => handleSelect(record.bannerId, checked as boolean)}
                    aria-label={`选择${record.bannerTitle}`}
                />
            )
        },
        {
            key: 'bannerTitle',
            title: '标题',
            width: 150,
            align: 'center'
        },
        {
            key: 'mediaUrl',
            title: '媒体',
            width: 100,
            align: 'center',
            render: (value, record) => value ? (
                record.mediaType === 0 ? (
                    <img
                        src={value as string}
                        alt="media"
                        className="w-8 h-8 mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewImage(value as string)
                        }}
                    />
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewVideo(value as string)
                        }}
                    >
                        <Play className="h-4 w-4" />
                        查看视频
                    </Button>
                )
            ) : '-'
        },
        {
            key: 'bannerLocation',
            title: '位置',
            width: 100,
            align: 'center',
            render: (value) => {
                const option = LOCATION_OPTIONS.find(opt => opt.value === value)
                return option?.label || value
            }
        },
        {
            key: 'pageType',
            title: '页面类型',
            width: 100,
            align: 'center',
            render: (value) => {
                const option = PAGE_TYPE_OPTIONS.find(opt => opt.value === value)
                return option?.label || value
            }
        },
        {
            key: 'jumpUrl',
            title: '跳转链接',
            width: 120,
            align: 'center',
            render: (value) => {
                return value || '-'
            }
        },
        {
            key: 'sort',
            title: '排序',
            width: 80,
            align: 'center'
        },
        {
            key: 'forbiddenFlag',
            title: '状态',
            width: 100,
            align: 'center',
            render: (_, record) => {
                const isEnabled = record.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value;
                return (
                    <Switch
                        checked={isEnabled}
                        onCheckedChange={() => handleToggleForbiddenFlag(record)}
                        className={cn(
                            "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400",
                            "h-6 w-11",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            "rounded-full border-2 border-transparent transition-colors",
                            "focus:outline-none"
                        )}
                    />
                )
            }
        },
        {
            key: 'action' as keyof Banner,
            title: '操作',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <div className="flex gap-2 justify-center">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(record)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(record)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </div>
            )
        }
    ]

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <div className="flex-none">
                <div className="px-6 py-3">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="relative w-[240px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="搜索Banner标题..."
                                value={searchKeyword}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {STATUS_OPTIONS.map((option) => (
                                <Button
                                    key={option.label}
                                    variant={forbiddenFlagFilter === option.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleForbiddenFlagChange(option.value)}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={loading || refreshing}
                            className={cn(
                                "px-2 transition-all duration-300",
                                refreshing && "animate-spin"
                            )}
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>

                        {selectedIds.length > 0 && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        banners.find(d => d.bannerId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                                            ? "text-yellow-500 hover:text-yellow-500"
                                            : "text-green-500 hover:text-green-500"
                                    )}
                                    onClick={() => {
                                        const firstBanner = banners.find(d => d.bannerId === selectedIds[0])
                                        setConfirmDialog({
                                            open: true,
                                            banner: {
                                                ...firstBanner!,
                                                bannerTitle: `选中的 ${selectedIds.length} 个Banner`
                                            }
                                        })
                                    }}
                                >
                                    批量{banners.find(d => d.bannerId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value ? '禁用' : '启用'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-500"
                                    onClick={() => {
                                        setDeleteDialog({
                                            open: true,
                                            banner: {
                                                ...banners.find(d => d.bannerId === selectedIds[0])!,
                                                bannerTitle: `选中的 ${selectedIds.length} 个Banner`
                                            }
                                        })
                                    }}
                                >
                                    批量删除
                                </Button>
                            </>
                        )}

                        <div className="ml-auto flex gap-2">
                            <Button
                                className="flex items-center gap-1"
                                onClick={handleCreate}
                            >
                                <Plus className="h-4 w-4" />
                                新建
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0">
                    <CustomTable<Banner>
                        config={{ rowHeight: 48, headerHeight: 48, footerHeight: 48 }}
                        data={banners}
                        columns={columns}
                        loading={loading}
                        rowKey="bannerId"
                        scroll={{
                            x: 1520,
                            y: 'calc(100vh - 300px)'
                        }}
                        className="h-full [&_td]:py-2"
                        emptyText="暂无Banner数据"
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: total,
                            onChange: handlePageChange,
                            onPageSizeChange: handlePageSizeChange
                        }}
                    />
                </div>
            </div>

            {/* 编辑对话框 */}
            <BannerEdit
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingBanner={editingBanner}
                onSubmit={handleSubmit}
                loading={loading}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setConfirmDialog(prev => ({ ...prev, banner: undefined }))
                        }, 200)
                    }
                }}
                title={getForbiddenFlagConfig(confirmDialog.banner?.forbiddenFlag).confirmTitle}
                description={`确定要${getForbiddenFlagConfig(confirmDialog.banner?.forbiddenFlag).actionText}Banner "${confirmDialog.banner?.bannerTitle}" 吗？`}
                type={getForbiddenFlagConfig(confirmDialog.banner?.forbiddenFlag).confirmType as any}
                confirmText={getForbiddenFlagConfig(confirmDialog.banner?.forbiddenFlag).confirmText}
                onConfirm={handleConfirmToggle}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setDeleteDialog(prev => ({ ...prev, banner: undefined }))
                        }, 200)
                    }
                }}
                title="删除确认"
                description={`确定要删除Banner "${deleteDialog.banner?.bannerTitle}" 吗？`}
                type="danger"
                confirmText="确认删除"
                onConfirm={handleConfirmDelete}
                showWarning={true}
            />

            <ImagePreview
                open={previewImage.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setPreviewImage(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setPreviewImage(prev => ({ ...prev, url: undefined }))
                        }, 200)
                    }
                }}
                url={previewImage.url}
            />

            <VideoPreview
                open={videoPreview.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setVideoPreview(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setVideoPreview(prev => ({ ...prev, url: undefined }))
                        }, 200)
                    }
                }}
                url={videoPreview.url}
            />
        </div>
    )
}
