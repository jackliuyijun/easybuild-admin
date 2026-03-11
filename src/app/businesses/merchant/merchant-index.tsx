'use client'

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import type { TableColumn } from "@/components/custom/table"
import { Plus, Search, RotateCw, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect, useCallback, useMemo } from "react"
import { getMerchantList, saveMerchant, toggleMerchantForbiddenFlag, deleteMerchant } from "@/api/merchant"
import type { Merchant } from "@/types/merchant"
import { useDebounce } from "@/hooks/use-debounce"
import { showMessage, showError } from '@/components/custom/notifications'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { FORBIDDEN_FLAG_CONFIG, FORBIDDEN_FLAG_OPTIONS, getForbiddenFlagConfig } from '@/config/forbidden-flag'
import { MerchantEdit } from "./merchant-edit"
import { DEFAULT_PAGE_SIZE } from "@/config/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { usePageTitle } from '@/store'

const STATUS_OPTIONS = FORBIDDEN_FLAG_OPTIONS

const CustomTable = dynamic(
    () => import('@/components/custom/table').then(mod => mod.CustomTable),
    { ssr: false }
)

export function MerchantPage() {
    const { setPageTitle } = usePageTitle();
    const [searchKeyword, setSearchKeyword] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [merchants, setMerchants] = useState<Merchant[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingMerchant, setEditingMerchant] = useState<Merchant | undefined>()
    const debouncedKeyword = useDebounce(searchKeyword, 800)
    const [forbiddenFlagFilter, setForbiddenFlagFilter] = useState<number | undefined>(undefined)
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        merchant?: Merchant;
    }>({ open: false })
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        merchant?: Merchant;
    }>({ open: false })
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const fetchMerchants = useCallback(async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true)
            const res = await getMerchantList({
                page: currentPage,
                limit: pageSize,
                merchantName: debouncedKeyword || undefined,
                forbiddenFlag: forbiddenFlagFilter
            }) as any
            setMerchants(res.data)
            setTotal(res.count)
        } catch (error) {
            console.error('Failed to fetch merchants:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, debouncedKeyword, forbiddenFlagFilter, pageSize])

    const handleRefresh = () => {
        fetchMerchants(true)
    }

    useEffect(() => {
        setPageTitle('超市管理');
        fetchMerchants()
    }, [setPageTitle, fetchMerchants])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setSelectedIds([])
    }

    const handleSearch = (value: string) => {
        setSearchKeyword(value)
        setCurrentPage(1)
        setSelectedIds([])
    }

    const handleSubmit = async (data: any) => {
        try {
            await saveMerchant({
                ...(editingMerchant?.merchantId ? { merchantId: editingMerchant.merchantId } : {}),
                ...data
            })

            showMessage({
                title: `${editingMerchant ? '编辑' : '新增'}成功`,
                description: `超市"${data.merchantName}"已${editingMerchant ? '更新' : '创建'}`
            })

            fetchMerchants(true)
        } catch (error: any) {
            showError({
                title: `${editingMerchant ? '编辑' : '新增'}失败`,
                description: error.message || '请稍后重试'
            })
            throw error
        }
    }

    const handleEdit = (merchant: Merchant) => {
        setEditingMerchant(merchant)
        setDialogOpen(true)
    }

    const handleCreate = () => {
        setEditingMerchant(undefined)
        setDialogOpen(true)
    }

    const handleForbiddenFlagChange = (value: number | undefined) => {
        setForbiddenFlagFilter(value)
        setCurrentPage(1)
        setSelectedIds([])
    }

    const handleToggleForbiddenFlag = async (merchant: Merchant) => {
        setConfirmDialog({
            open: true,
            merchant
        })
    }

    const handleConfirmToggle = async () => {
        if (!confirmDialog.merchant) return

        try {
            const merchantIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : confirmDialog.merchant.merchantId

            const newForbiddenFlag = confirmDialog.merchant.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                ? FORBIDDEN_FLAG_CONFIG.disable.value
                : FORBIDDEN_FLAG_CONFIG.enable.value

            await toggleMerchantForbiddenFlag({
                ids: merchantIds,
                value: newForbiddenFlag
            })

            showMessage({
                title: "操作成功",
                description: `已${getForbiddenFlagConfig(newForbiddenFlag).actionText}选中超市`
            })

            setSelectedIds([])
            fetchMerchants(true)
        } catch (error: any) {
            showError({
                title: "操作失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setConfirmDialog({ open: false })
        }
    }

    const handleDelete = (merchant: Merchant) => {
        setDeleteDialog({
            open: true,
            merchant
        })
    }

    const handleConfirmDelete = async () => {
        if (!deleteDialog.merchant) return

        try {
            const merchantIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : deleteDialog.merchant.merchantId

            await deleteMerchant(merchantIds)

            showMessage({
                title: "删除成功",
                description: "选中超市已删除"
            })

            setSelectedIds([])
            fetchMerchants(true)
        } catch (error: any) {
            showError({
                title: "删除失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setDeleteDialog(prev => ({ ...prev, open: false }))
            setTimeout(() => {
                setDeleteDialog(prev => ({ ...prev, merchant: undefined }))
            }, 200)
        }
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(merchants.map(m => m.merchantId))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelect = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id])
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id))
        }
    }

    const columns = useMemo<TableColumn<Merchant>[]>(() => [
        {
            key: 'selection' as any,
            title: (
                <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length < merchants.length ? "indeterminate" : merchants.length > 0 && selectedIds.length === merchants.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="全选"
                />
            ) as any,
            width: 40,
            align: 'center',
            render: (_, record) => (
                <Checkbox
                    checked={selectedIds.includes(record.merchantId)}
                    onCheckedChange={(checked) => handleSelect(record.merchantId, checked as boolean)}
                    aria-label={`选择${record.merchantName}`}
                />
            )
        },
        {
            key: 'merchantName',
            title: '超市名称',
            width: 120,
            align: 'center',
        },

        {
            key: 'linkMan',
            title: '联系人',
            width: 80,
            align: 'center',
        },
        {
            key: 'linkPhone',
            title: '联系电话',
            width: 80,
            align: 'center',
        },
        {
            key: 'businessHours',
            title: '营业时间',
            width: 100,
            align: 'center',
        },
        {
            key: 'addressInfo',
            title: '地址',
            width: 200,
            align: 'left',
        },
        {
            key: 'forbiddenFlag',
            title: '状态',
            width: 80,
            align: 'center',
            render: (_, record) => {
                const isEnabled = record.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value;
                return (
                    <Switch
                        checked={isEnabled}
                        onCheckedChange={() => handleToggleForbiddenFlag(record)}
                    />
                )
            }
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
    ], [merchants.length, selectedIds])

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <div className="flex-none">
                <div className="px-6 py-3">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="relative w-[240px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="输入关键字搜索..."
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
                                        merchants.find(m => m.merchantId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                                            ? "text-yellow-500 hover:text-yellow-500"
                                            : "text-green-500 hover:text-green-500"
                                    )}
                                    onClick={() => {
                                        const first = merchants.find(m => m.merchantId === selectedIds[0])
                                        setConfirmDialog({
                                            open: true,
                                            merchant: {
                                                ...first!,
                                                merchantName: `选中的 ${selectedIds.length} 个超市`
                                            }
                                        })
                                    }}
                                >
                                    批量{merchants.find(m => m.merchantId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value ? '禁用' : '启用'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-500"
                                    onClick={() => {
                                        setDeleteDialog({
                                            open: true,
                                            merchant: {
                                                ...merchants.find(m => m.merchantId === selectedIds[0])!,
                                                merchantName: `选中的 ${selectedIds.length} 个超市`
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
                        data={merchants}
                        columns={columns as any}
                        loading={loading}
                        rowKey="merchantId"
                        scroll={{
                            x: 1000,
                            y: 'calc(100vh - 300px)'
                        }}
                        className="h-full [&_td]:py-2"
                        emptyText="暂无超市数据"
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

            <MerchantEdit
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingMerchant={editingMerchant}
                onSubmit={handleSubmit}
                loading={loading}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setConfirmDialog(prev => ({ ...prev, merchant: undefined }))
                        }, 200)
                    }
                }}
                title={getForbiddenFlagConfig(confirmDialog.merchant?.forbiddenFlag).confirmTitle}
                description={`确定要${getForbiddenFlagConfig(confirmDialog.merchant?.forbiddenFlag).actionText}超市 "${confirmDialog.merchant?.merchantName}" 吗？`}
                type={getForbiddenFlagConfig(confirmDialog.merchant?.forbiddenFlag).confirmType as any}
                confirmText={getForbiddenFlagConfig(confirmDialog.merchant?.forbiddenFlag).confirmText}
                onConfirm={handleConfirmToggle}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setDeleteDialog(prev => ({ ...prev, merchant: undefined }))
                        }, 200)
                    }
                }}
                title="删除确认"
                description={`确定要删除超市 "${deleteDialog.merchant?.merchantName}" 吗？`}
                type="danger"
                confirmText="确认删除"
                onConfirm={handleConfirmDelete}
                showWarning={true}
            />
        </div>
    )
}
