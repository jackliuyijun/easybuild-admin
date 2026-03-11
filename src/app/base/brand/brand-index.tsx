'use client'

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import type { TableColumn } from "@/components/custom/table"
import { Plus, Search, RotateCw, MoreHorizontal, Edit, Trash2 } from "lucide-react"
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
import { getBrandList, saveBrand, toggleBrandForbiddenFlag, deleteBrand } from "@/api/brand"
import type { Brand } from "@/types/brand"
import { useDebounce } from "@/hooks/use-debounce"
import { showMessage, showError } from '@/components/custom/notifications'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { FORBIDDEN_FLAG_CONFIG, FORBIDDEN_FLAG_OPTIONS, getForbiddenFlagConfig } from '@/config/forbidden-flag'
import { BrandEdit } from "./brand-edit"
import { DEFAULT_PAGE_SIZE } from "@/config/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'
import { X } from 'lucide-react'
import { ImagePreview } from "@/components/ui/image-preview"
import { MultiSelect } from "@/components/custom/multi-select"
import { getBrandCategoryDropdownList } from "@/api/category"
import { useToast } from "@/hooks/use-toast"
import { usePageTitle } from '@/store'

// 状态选项
const STATUS_OPTIONS = FORBIDDEN_FLAG_OPTIONS

// 动态导入表格组件
const CustomTable = dynamic(
    () => import('@/components/custom/table').then(mod => mod.CustomTable),
    { ssr: false }
)

export function BrandPage() {
    const { setPageTitle } = usePageTitle();
    // 状态定义与部门管理页面类似
    const [searchKeyword, setSearchKeyword] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [brands, setBrands] = useState<Brand[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingBrand, setEditingBrand] = useState<Brand | undefined>()
    const debouncedKeyword = useDebounce(searchKeyword, 800)
    const [forbiddenFlagFilter, setForbiddenFlagFilter] = useState<number | undefined>(undefined)
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        brand?: Brand;
    }>({ open: false })
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        brand?: Brand;
    }>({ open: false })
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [previewImage, setPreviewImage] = useState<{
        open: boolean;
        url?: string;
    }>({ open: false })
    const [categoryOptions, setCategoryOptions] = useState<{
        value: string;
        label: string;
    }[]>([])
    const [categoryFilter, setCategoryFilter] = useState<string | undefined>()

    // 获取品牌列表
    const fetchBrands = useCallback(async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true)
            const res = await getBrandList({
                page: currentPage,
                limit: pageSize,
                brandName: debouncedKeyword || undefined,
                forbiddenFlag: forbiddenFlagFilter,
                categoryCode: categoryFilter || undefined
            }) as any
            setBrands(res.data)
            setTotal(res.count || 0)
        } catch (error) {
            console.error('Failed to fetch brands:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, debouncedKeyword, forbiddenFlagFilter, pageSize, categoryFilter])

    // 监听页码和搜索关键词变化
    useEffect(() => {
        setPageTitle('品牌管理');
        fetchBrands()
    }, [setPageTitle, fetchBrands])

    // 处理刷新
    const handleRefresh = () => {
        fetchBrands(true)
    }

    // 处理页码变化
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setSelectedIds([])
    }

    // 处理每页条数变化
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
        setEditingBrand(undefined)
        setDialogOpen(true)
    }

    // 处理编辑
    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand)
        setDialogOpen(true)
    }

    // 处理全选/取消全选
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(brands.map(brand => brand.brandId))
        } else {
            setSelectedIds([])
        }
    }

    // 处理单个选择
    const handleSelect = (brandId: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, brandId])
        } else {
            setSelectedIds(prev => prev.filter(id => id !== brandId))
        }
    }

    // 处理提交
    const handleSubmit = async (data: any) => {
        try {
            await saveBrand({
                ...(editingBrand?.brandId ? { brandId: editingBrand.brandId } : {}),
                ...data
            })

            showMessage({
                title: `${editingBrand ? '编辑' : '新增'}成功`,
                description: `品牌"${data.brandName}"已${editingBrand ? '更新' : '创建'}`
            })

            fetchBrands(true)
            setDialogOpen(false)
        } catch (error: any) {
            showError({
                title: `${editingBrand ? '编辑' : '新增'}失败`,
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
    const handleToggleForbiddenFlag = async (brand: Brand) => {
        setConfirmDialog({
            open: true,
            brand
        })
    }

    // 确认状态切换
    const handleConfirmToggle = async () => {
        if (!confirmDialog.brand) return

        try {
            const brandIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : confirmDialog.brand.brandId

            const newForbiddenFlag = confirmDialog.brand.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                ? FORBIDDEN_FLAG_CONFIG.disable.value
                : FORBIDDEN_FLAG_CONFIG.enable.value

            await toggleBrandForbiddenFlag({
                ids: brandIds,
                value: newForbiddenFlag
            })

            showMessage({
                title: "操作成功",
                description: `已${getForbiddenFlagConfig(newForbiddenFlag).actionText}选中品牌`
            })

            setSelectedIds([])
            fetchBrands(true)
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
    const handleDelete = (brand: Brand) => {
        setDeleteDialog({
            open: true,
            brand
        })
    }

    // 确认删除
    const handleConfirmDelete = async () => {
        if (!deleteDialog.brand) return

        try {
            const brandIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : deleteDialog.brand.brandId

            await deleteBrand(brandIds)

            showMessage({
                title: "删除成功",
                description: "选中品牌已删除"
            })

            setSelectedIds([])
            fetchBrands(true)
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

    // 添加获取分类选项的 useEffect
    useEffect(() => {
        getBrandCategoryDropdownList().then(options => {
            setCategoryOptions(options)
        })
    }, [])

    // 添加分类筛选变化处理函数
    const handleCategoryChange = (value: string) => {
        setCategoryFilter(value || undefined)
        setCurrentPage(1)
        setSelectedIds([])
    }

    // 表格列配置
    const columns: any[] = [
        {
            key: 'selection',
            title: (
                <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length < brands.length ? "indeterminate" : brands.length > 0 && selectedIds.length === brands.length}

                    onCheckedChange={handleSelectAll}
                    aria-label="全选"
                />
            ),
            width: 40,
            fixed: 'left',
            align: 'center',
            render: (_: any, record: any) => (
                <Checkbox
                    checked={selectedIds.includes(record.brandId)}
                    onCheckedChange={(checked: any) => handleSelect(record.brandId, checked)}
                    aria-label={`选择${record.brandName}`}
                />
            )
        },
        // {
        //     key: 'index',
        //     title: '序号',
        //     width: 80,
        //     fixed: 'left',
        //     align: 'center',
        //     render: (_: any, __: any, index: any) => (currentPage - 1) * pageSize + index + 1
        // },
        {
            key: 'brandName',
            title: '品牌名称',
            width: 150,
            align: 'center'
        },
        {
            key: 'categoryName',
            title: '所属分类',
            width: 150,
            align: 'center'
        },
        {
            key: 'logo',
            title: 'Logo',
            width: 100,
            align: 'center',
            render: (value: any) => value ? (
                <img
                    src={value as string}
                    alt="logo"
                    className="w-8 h-8 mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation()
                        handlePreviewImage(value as string)
                    }}
                />
            ) : '-'
        },
        {
            key: 'brandDescribe' as keyof Brand,
            title: '描述',
            width: 200,
            align: 'center'
        },
        {
            key: 'sort',
            title: '排序',
            width: 100,
            align: 'center'
        },
        {
            key: 'forbiddenFlag',
            title: '状态',
            width: 100,
            align: 'center',
            render: (_: any, record: any) => {
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
            key: 'insertTime',
            title: '创建时间',
            width: 180,
            align: 'center'
        },
        {
            key: 'action' as keyof Brand,
            title: '操作',
            width: 60,
            fixed: 'right',
            align: 'center',
            render: (_: any, record: any) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">打开菜单</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => handleEdit(record)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>编辑</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleDelete(record)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>删除</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
                                placeholder="搜索品牌名称..."
                                value={searchKeyword}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <div className="w-[240px]">
                            <MultiSelect
                                value={categoryFilter || ''}
                                onChange={handleCategoryChange}
                                options={categoryOptions}
                                placeholder="按分类筛选"
                                multiple={false}
                                popoverProps={{
                                    align: 'start',
                                    className: 'w-full'
                                }}
                                onSearch={async (keyword) => {
                                    const data = await getBrandCategoryDropdownList({
                                        name: keyword
                                    })
                                    setCategoryOptions(prev => {
                                        const merged = [...prev]
                                        data.forEach((item: { value: string; label: string }) => {
                                            if (!merged.some(existing => existing.value === item.value)) {
                                                merged.push(item)
                                            }
                                        })
                                        return merged
                                    })
                                    return data
                                }}
                                searchDebounce={800}
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
                                        brands.find(d => d.brandId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                                            ? "text-yellow-500 hover:text-yellow-500"
                                            : "text-green-500 hover:text-green-500"
                                    )}
                                    onClick={() => {
                                        const firstBrand = brands.find(d => d.brandId === selectedIds[0])
                                        setConfirmDialog({
                                            open: true,
                                            brand: {
                                                ...firstBrand!,
                                                brandName: `选中的 ${selectedIds.length} 个品牌`
                                            }
                                        })
                                    }}
                                >
                                    批量{brands.find(d => d.brandId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value ? '禁用' : '启用'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-500"
                                    onClick={() => {
                                        setDeleteDialog({
                                            open: true,
                                            brand: {
                                                ...brands.find(d => d.brandId === selectedIds[0])!,
                                                brandName: `选中的 ${selectedIds.length} 个品牌`
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
                    <CustomTable
                        config={{ rowHeight: 48, headerHeight: 48, footerHeight: 48 }}
                        data={brands}
                        columns={columns}
                        loading={loading}
                        rowKey="brandId"
                        scroll={{
                            x: 1520,
                            y: 'calc(100vh - 300px)'
                        }}
                        className="h-full [&_td]:py-2"
                        emptyText="暂无品牌数据"
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
            <BrandEdit
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingBrand={editingBrand}
                onSubmit={handleSubmit}
                loading={loading}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setConfirmDialog(prev => ({ ...prev, brand: undefined }))
                        }, 200)
                    }
                }}
                title={getForbiddenFlagConfig(confirmDialog.brand?.forbiddenFlag).confirmTitle}
                description={`确定要${getForbiddenFlagConfig(confirmDialog.brand?.forbiddenFlag).actionText}品牌 "${confirmDialog.brand?.brandName}" 吗？`}
                type={getForbiddenFlagConfig(confirmDialog.brand?.forbiddenFlag).confirmType as any}
                confirmText={getForbiddenFlagConfig(confirmDialog.brand?.forbiddenFlag).confirmText}
                onConfirm={handleConfirmToggle}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setDeleteDialog(prev => ({ ...prev, brand: undefined }))
                        }, 200)
                    }
                }}
                title="删除确认"
                description={`确定要删除品牌 "${deleteDialog.brand?.brandName}" 吗？`}
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
        </div>
    )
}
