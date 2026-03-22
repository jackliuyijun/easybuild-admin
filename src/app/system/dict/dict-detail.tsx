'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { TableColumn } from "@/components/custom/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RotateCw, Plus } from "lucide-react"
import type { Dict } from "@/types/dict"
import { DEFAULT_PAGE_SIZE } from "@/config/pagination"
import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from "react"
import { getDictItemList, toggleDictItemForbiddenFlag, deleteDictItem } from "@/api/dict-item"
import type { DictItem } from "@/types/dict-item"
import { useDebounce } from "@/hooks/use-debounce"
import { DictItemEdit } from "./dict-item-edit"
import { saveDictItem } from "@/api/dict-item"
import { showMessage, showError } from '@/components/custom/notifications'
import { FORBIDDEN_FLAG_CONFIG, getForbiddenFlagConfig } from '@/config/forbidden-flag'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { Switch } from "@/components/ui/switch"

// 动态导入表格组件
const CustomTable = dynamic(
    () => import('@/components/custom/table').then(mod => mod.CustomTable),
    { ssr: false }
)

interface DictDetailProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    dict?: Dict
}

export function DictDetail({
    open,
    onOpenChange,
    dict
}: DictDetailProps) {
    // 状态定义
    const [searchKeyword, setSearchKeyword] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [dictItems, setDictItems] = useState<DictItem[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const debouncedKeyword = useDebounce(searchKeyword, 800)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingDictItem, setEditingDictItem] = useState<DictItem | undefined>()
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        dictItem?: DictItem;
    }>({ open: false })
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        dictItem?: DictItem;
    }>({ open: false })

    // 获取字典项列表
    const fetchDictItems = useCallback(async (isRefreshing = false) => {
        if (!dict?.dictId) return

        try {
            isRefreshing ? setRefreshing(true) : setLoading(true)
            const res = await getDictItemList({
                page: currentPage,
                limit: pageSize,
                dictId: dict.dictId,
                dictKey: debouncedKeyword || undefined,
                forbiddenFlag: undefined
            }) as any
            setDictItems(res.data)
            setTotal(res.count)
        } catch (error) {
            console.error('Failed to fetch dict items:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, debouncedKeyword, dict?.dictId, pageSize])

    // 处理搜索
    const handleSearch = (value: string) => {
        setSearchKeyword(value)
        setCurrentPage(1)
    }

    // 处理刷新
    const handleRefresh = () => fetchDictItems(true)

    // 处理分页变化
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // 处理新建
    const handleCreate = () => {
        setEditingDictItem(undefined)
        setDialogOpen(true)
    }

    // 处理交
    const handleSubmit = async (data: {
        dictKey: string
        dictValue: string
    }) => {
        if (!dict?.dictId) return

        try {
            await saveDictItem({
                ...(editingDictItem?.dictItemId ? { dictItemId: editingDictItem.dictItemId } : {}),
                dictId: dict.dictId,
                ...data
            })

            showMessage({
                title: `${editingDictItem ? '编辑' : '新增'}成功`,
                description: `字典项"${data.dictKey}"已${editingDictItem ? '更新' : '创建'}`
            })

            setDialogOpen(false)
            fetchDictItems(true)
        } catch (error: any) {
            showError({
                title: `${editingDictItem ? '编辑' : '新增'}失败`,
                description: error.message || '请稍后重试'
            })
            throw error
        }
    }

    // 处理编辑
    const handleEdit = (dictItem: DictItem) => {
        setEditingDictItem(dictItem)
        setDialogOpen(true)
    }

    // 处理状态切换
    const handleToggleForbiddenFlag = (dictItem: DictItem) => {
        setConfirmDialog({
            open: true,
            dictItem
        })
    }

    // 确认状态切换
    const handleConfirmToggle = async () => {
        if (!confirmDialog.dictItem) return

        try {
            await toggleDictItemForbiddenFlag({
                ids: confirmDialog.dictItem.dictItemId,
                value: confirmDialog.dictItem.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                    ? FORBIDDEN_FLAG_CONFIG.disable.value
                    : FORBIDDEN_FLAG_CONFIG.enable.value
            })

            showMessage({
                title: "操作成功",
                description: `已${getForbiddenFlagConfig(confirmDialog.dictItem.forbiddenFlag).actionText}选中字典项`
            })

            fetchDictItems(true)
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
    const handleDelete = (dictItem: DictItem) => {
        setDeleteDialog({
            open: true,
            dictItem
        })
    }

    // 确认删除
    const handleConfirmDelete = async () => {
        if (!deleteDialog.dictItem) return

        try {
            await deleteDictItem(deleteDialog.dictItem.dictItemId)

            showMessage({
                title: "删除成功",
                description: "字典项已删除"
            })

            fetchDictItems(true)
        } catch (error: any) {
            showError({
                title: "删除失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setDeleteDialog(prev => ({ ...prev, open: false }))
            setTimeout(() => {
                setDeleteDialog(prev => ({ ...prev, dictItem: undefined }))
            }, 200)
        }
    }

    // 监听弹窗打开和搜索关键词变化
    useEffect(() => {
        if (open && dict?.dictId) {
            fetchDictItems()
        }
    }, [open, dict?.dictId, fetchDictItems])

    // 表格列配置
    const columns: TableColumn<DictItem>[] = [
        {
            key: 'index' as any,
            title: '序号',
            width: 80,
            align: 'center',
            render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1
        },
        {
            key: 'dictKey',
            title: '字典key',
            width: 200,
            align: 'center',
            render: (value) => (
                <span className="truncate" title={value as string}>
                    {value}
                </span>
            )
        },
        {
            key: 'dictValue',
            title: '字典值',
            width: 200,
            align: 'center',
            render: (value) => (
                <span className="truncate" title={value as string}>
                    {value}
                </span>
            )
        },
        {
            key: 'forbiddenFlag',
            title: '状态',
            width: 100,
            align: 'center',
            render: (_: any, record: DictItem) => {
                const isEnabled = record.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value;
                return (
                    <Switch
                        checked={isEnabled}
                        onCheckedChange={() => handleToggleForbiddenFlag(record)}
                        className={cn(
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
            key: 'action' as any,
            title: '操作',
            width: 120,
            align: 'center',
            render: (_: any, record: DictItem) => (
                <div className="space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-500"
                        onClick={() => handleDelete(record)}
                    >
                        删除
                    </Button>
                </div>
            )
        }
    ]

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            modal
        >
            <DialogContent
                className="max-w-[1200px] h-[80vh] flex flex-col p-0 overflow-hidden"
                onPointerDownOutside={(e) => {
                    e.preventDefault()
                }}
                onEscapeKeyDown={(e) => {
                    e.preventDefault()
                }}
            >
                <DialogTitle className="sr-only">字典详情 - {dict?.dictName}</DialogTitle>
                {/* 顶部基础信息 */}
                <div className="flex items-center gap-8 px-6 py-4 border-b">
                    <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">模块名称</div>
                        <div className="text-sm font-medium">{dict?.moduleName}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">字典名称</div>
                        <div className="text-sm font-medium">{dict?.dictName}</div>
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-muted-foreground">典编码</div>
                        <div className="text-sm font-medium">{dict?.dictCode}</div>
                    </div>
                </div>

                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                    {/* 搜索区域 */}
                    <div className="flex items-center gap-4 px-6 py-4 border-b">
                        <div className="relative w-[240px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="请输入字典key..."
                                className="pl-9"
                                value={searchKeyword}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={loading || refreshing}
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="gap-1 ml-auto"
                            onClick={handleCreate}
                        >
                            <Plus className="h-4 w-4" />
                            新建
                        </Button>
                    </div>

                    {/* 表格区域 */}
                    <div className="flex-1 min-h-0 overflow-auto">
                        <CustomTable
                            config={{ rowHeight: 48, headerHeight: 48, footerHeight: 48 }}
                            data={dictItems}
                            columns={columns as any}
                            loading={loading}
                            scroll={{
                                x: 1000,
                                y: 'calc(80vh - 300px)'
                            }}
                            rowKey="dictItemId"
                            className="h-full [&_td]:py-2"
                            emptyText="暂无数据"
                            pagination={{
                                current: currentPage,
                                pageSize: pageSize,
                                total: total,
                                onChange: handlePageChange,
                                onPageSizeChange: (size) => {
                                    setPageSize(size)
                                    setCurrentPage(1)
                                }
                            }}
                        />
                    </div>
                </div>

                {/* 字典项编辑对话框 */}
                <DictItemEdit
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    editingDictItem={editingDictItem}
                    dictId={dict?.dictId || ''}
                    onSubmit={handleSubmit}
                    loading={loading}
                />

                {/* 添加确认对话框 */}
                <ConfirmDialog
                    open={confirmDialog.open}
                    onOpenChange={(open) => {
                        if (!open) {
                            setConfirmDialog(prev => ({ ...prev, open: false }))
                            setTimeout(() => {
                                setConfirmDialog(prev => ({ ...prev, dictItem: undefined }))
                            }, 200)
                        }
                    }}
                    title={getForbiddenFlagConfig(confirmDialog.dictItem?.forbiddenFlag).confirmTitle}
                    description={`确定要${getForbiddenFlagConfig(confirmDialog.dictItem?.forbiddenFlag).actionText}字典项 "${confirmDialog.dictItem?.dictKey}" 吗？`}
                    type={getForbiddenFlagConfig(confirmDialog.dictItem?.forbiddenFlag).confirmType as any}
                    confirmText={getForbiddenFlagConfig(confirmDialog.dictItem?.forbiddenFlag).confirmText}
                    onConfirm={handleConfirmToggle}
                />

                <ConfirmDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) => {
                        if (!open) {
                            setDeleteDialog(prev => ({ ...prev, open: false }))
                            setTimeout(() => {
                                setDeleteDialog(prev => ({ ...prev, dictItem: undefined }))
                            }, 200)
                        }
                    }}
                    title="删除确认"
                    description={`确定要删除字典项 "${deleteDialog.dictItem?.dictKey}" 吗？`}
                    type="danger"
                    confirmText="确认删除"
                    onConfirm={handleConfirmDelete}
                    showWarning={true}
                />
            </DialogContent>
        </Dialog>
    )
}
