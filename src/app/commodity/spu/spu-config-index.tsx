'use client'

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import type { TableColumn } from "@/components/custom/table"
import { Plus, Search, RotateCw, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useCallback, useEffect } from "react"
import { getList, save, remove } from "@/api/spuConfig"
import type { SpuConfig } from "@/types/spu-config"
import { useDebounce } from "@/hooks/use-debounce"
import { showMessage, showError } from '@/components/custom/notifications'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { DEFAULT_PAGE_SIZE } from "@/config/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { SpuConfigEdit } from "./spu-config-edit"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { CategoryCascader, CategoryCascaderValue } from "@/components/custom/category-cascader"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePageTitle } from '@/store'

const CustomTable = dynamic(
    () => import('@/components/custom/table').then(mod => mod.CustomTable),
    { ssr: false }
)

export function SpuConfigPage() {
    const [searchKeyword, setSearchKeyword] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [spuConfigs, setSpuConfigs] = useState<SpuConfig[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingSpuConfig, setEditingSpuConfig] = useState<SpuConfig | undefined>()
    const debouncedKeyword = useDebounce(searchKeyword, 800)
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        spuConfig?: SpuConfig;
    }>({ open: false })
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const [categoryValue, setCategoryValue] = useState<CategoryCascaderValue>({
        firstCategoryId: '',
        secondCategoryId: '',
        thirdCategoryId: ''
    })
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('SPU配置管理');
    }, [setPageTitle])

    const fetchSpuConfigs = useCallback(async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true)
            const res = await getList({
                page: currentPage,
                limit: pageSize,
                searchKeyWord: debouncedKeyword || undefined,
                firstCategoryId: categoryValue.firstCategoryId || undefined,
                secondCategoryId: categoryValue.secondCategoryId || undefined
            }) as any
            setSpuConfigs(res.data)
            setTotal(res.count)
        } catch (error) {
            // 删除 console.error
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, debouncedKeyword, pageSize, categoryValue])

    useEffect(() => {
        fetchSpuConfigs()
    }, [fetchSpuConfigs])



    const handleRefresh = () => {
        fetchSpuConfigs(true)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setSelectedIds([])
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
        setSelectedIds([])
    }

    const handleSearch = (value: string) => {
        setSearchKeyword(value)
        setCurrentPage(1)
        setSelectedIds([])
    }

    const handleCategoryChange = (value: CategoryCascaderValue) => {
        setCategoryValue(value)
        setCurrentPage(1)
        setSelectedIds([])
    }



    const handleCreate = () => {
        setEditingSpuConfig(undefined)
        setDialogOpen(true)
    }

    const handleEdit = (spuConfig: SpuConfig) => {
        setEditingSpuConfig(spuConfig)
        setDialogOpen(true)
    }

    const handleSubmit = async (data: any) => {
        try {
            await save({
                ...(editingSpuConfig?.goodsSpuConfigId ? { goodsSpuConfigId: editingSpuConfig.goodsSpuConfigId } : {}),
                ...data
            })

            showMessage({
                title: `${editingSpuConfig ? '编辑' : '新增'}成功`,
                description: `SPU配置"${data.spuName}"已${editingSpuConfig ? '更新' : '创建'}`
            })

            fetchSpuConfigs(true)
            setDialogOpen(false)
        } catch (error: any) {
            showError({
                title: `${editingSpuConfig ? '编辑' : '新增'}失败`,
                description: error.message || '请稍后重试'
            })
            throw error
        }
    }

    const handleDelete = (spuConfig: SpuConfig) => {
        setDeleteDialog({
            open: true,
            spuConfig
        })
    }

    const handleConfirmDelete = async () => {
        if (!deleteDialog.spuConfig) return

        try {
            const ids = selectedIds.length > 0
                ? selectedIds.join(',')
                : deleteDialog.spuConfig.goodsSpuConfigId

            await remove(ids)

            showMessage({
                title: "删除成功",
                description: "选中SPU配置已删除"
            })

            setSelectedIds([])
            fetchSpuConfigs(true)
        } catch (error: any) {
            showError({
                title: "删除失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setDeleteDialog({ open: false })
        }
    }

    const columns: TableColumn<SpuConfig>[] = [
        {
            key: 'selection' as any,
            title: (
                <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length < spuConfigs.length ? "indeterminate" : spuConfigs.length > 0 && selectedIds.length === spuConfigs.length}

                    onCheckedChange={(checked) => {
                        if (checked) {
                            setSelectedIds(spuConfigs.map(config => config.goodsSpuConfigId))
                        } else {
                            setSelectedIds([])
                        }
                    }}
                    aria-label="全选"
                />
            ) as any,
            width: 40,
            fixed: 'left',
            align: 'center',
            render: (_, record) => (
                <Checkbox
                    checked={selectedIds.includes(record.goodsSpuConfigId)}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            setSelectedIds(prev => [...prev, record.goodsSpuConfigId])
                        } else {
                            setSelectedIds(prev => prev.filter(id => id !== record.goodsSpuConfigId))
                        }
                    }}
                    aria-label={`选择${record.spuName}`}
                />
            )
        },
        // {
        //     key: 'index' as any,
        //     title: '序号',
        //     width: 80,
        //     fixed: 'left',
        //     align: 'center',
        //     render: (_, __, index) => (currentPage - 1) * pageSize + index + 1
        // },
        {
            key: 'spuName',
            title: 'SPU名称',
            width: 120,
            align: 'center'
        },
        {
            key: 'spuValue',
            title: 'SPU值',
            width: 120,
            align: 'center'
        },
        {
            key: 'firstCategoryName',
            title: '一级分类',
            width: 120,
            align: 'center'
        },
        {
            key: 'secondCategoryName',
            title: '二级分类',
            width: 120,
            align: 'center'
        },
        {
            key: 'createTime',
            title: '创建时间',
            width: 180,
            align: 'center'
        },
        {
            key: 'action' as any,
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
                                placeholder="输入关键字..."
                                value={searchKeyword}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <div className="w-[240px]">
                            <CategoryCascader
                                value={categoryValue}
                                onChange={handleCategoryChange}
                                placeholder="选择分类..."
                                maxLevel={2}
                                width="240px"
                            />
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={loading || refreshing}
                            className={cn(
                                "px-2 h-[40px] transition-all duration-300",
                                refreshing && "animate-spin"
                            )}
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>

                        {selectedIds.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-500"
                                onClick={() => {
                                    setDeleteDialog({
                                        open: true,
                                        spuConfig: {
                                            ...spuConfigs.find(d => d.goodsSpuConfigId === selectedIds[0])!,
                                            spuName: `选中的 ${selectedIds.length} 个SPU配置`
                                        }
                                    })
                                }}
                            >
                                批量删除
                            </Button>
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
                        data={spuConfigs}
                        columns={columns as any}
                        loading={loading}
                        rowKey="goodsSpuConfigId"
                        scroll={{
                            x: 1200,
                            y: 'calc(100vh - 300px)'
                        }}
                        className="h-full [&_td]:py-2"
                        emptyText="暂无SPU配置数据"
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

            <SpuConfigEdit
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingSpuConfig={editingSpuConfig}
                onSubmit={handleSubmit}
                loading={loading}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setDeleteDialog(prev => ({ ...prev, spuConfig: undefined }))
                        }, 200)
                    }
                }}
                title="删除确认"
                description={`确定要删除SPU配置 "${deleteDialog.spuConfig?.spuName}" 吗？`}
                type="danger"
                confirmText="确认删除"
                onConfirm={handleConfirmDelete}
                showWarning={true}
            />
        </div>
    )
}