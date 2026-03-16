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
import { getContainerList, saveContainer, toggleContainerForbiddenFlag, deleteContainer } from "@/api/container"
import type { Container } from "@/types/container"
import { useDebounce } from "@/hooks/use-debounce"
import { showMessage, showError } from '@/components/custom/notifications'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { FORBIDDEN_FLAG_CONFIG, FORBIDDEN_FLAG_OPTIONS, getForbiddenFlagConfig } from '@/config/forbidden-flag'
import { ContainerEdit } from "./container-edit"
import { DEFAULT_PAGE_SIZE } from "@/config/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { usePageTitle } from '@/store'

const STATUS_OPTIONS = FORBIDDEN_FLAG_OPTIONS

const CustomTable = dynamic(
    () => import('@/components/custom/table').then(mod => mod.CustomTable),
    { ssr: false }
)

export function ContainerPage() {
    const { setPageTitle } = usePageTitle();
    const [searchKeyword, setSearchKeyword] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [containers, setContainers] = useState<Container[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingContainer, setEditingContainer] = useState<Container | undefined>()
    const debouncedKeyword = useDebounce(searchKeyword, 800)
    const [forbiddenFlagFilter, setForbiddenFlagFilter] = useState<number | undefined>(undefined)
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        container?: Container;
    }>({ open: false })
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        container?: Container;
    }>({ open: false })
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const fetchContainers = useCallback(async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true)
            const res = await getContainerList({
                page: currentPage,
                limit: pageSize,
                containerName: debouncedKeyword || undefined,
                forbiddenFlag: forbiddenFlagFilter
            }) as any
            setContainers(res.data)
            setTotal(res.count)
        } catch (error) {
            console.error('Failed to fetch containers:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, debouncedKeyword, forbiddenFlagFilter, pageSize])

    const handleRefresh = () => {
        fetchContainers(true)
    }

    useEffect(() => {
        setPageTitle('货柜管理');
        fetchContainers()
    }, [setPageTitle, fetchContainers])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setSelectedIds([])
    }

    const handleSearch = (value: string) => {
        setSearchKeyword(value)
        setCurrentPage(1)
        setSelectedIds([])
    }

    const handleSubmit = async (data: { name: string, code?: string, addressInfo?: string }) => {
        try {
            await saveContainer({
                ...(editingContainer?.containerId ? { containerId: editingContainer.containerId } : {}),
                containerName: data.name,
                containerCode: data.code,
                addressInfo: data.addressInfo
            })

            showMessage({
                title: `${editingContainer ? '编辑' : '新增'}成功`,
                description: `货柜"${data.name}"已${editingContainer ? '更新' : '创建'}`
            })

            fetchContainers(true)
        } catch (error: any) {
            showError({
                title: `${editingContainer ? '编辑' : '新增'}失败`,
                description: error.message || '请稍后重试'
            })
            throw error
        }
    }

    const handleEdit = (container: Container) => {
        setEditingContainer(container)
        setDialogOpen(true)
    }

    const handleCreate = () => {
        setEditingContainer(undefined)
        setDialogOpen(true)
    }

    const handleForbiddenFlagChange = (value: number | undefined) => {
        setForbiddenFlagFilter(value)
        setCurrentPage(1)
        setSelectedIds([])
    }

    const handleToggleForbiddenFlag = async (container: Container) => {
        setConfirmDialog({
            open: true,
            container
        })
    }

    const handleConfirmToggle = async () => {
        if (!confirmDialog.container) return

        try {
            const containerIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : confirmDialog.container.containerId

            const newForbiddenFlag = confirmDialog.container.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                ? FORBIDDEN_FLAG_CONFIG.disable.value
                : FORBIDDEN_FLAG_CONFIG.enable.value

            await toggleContainerForbiddenFlag({
                ids: containerIds,
                value: newForbiddenFlag
            })

            showMessage({
                title: "操作成功",
                description: `已${getForbiddenFlagConfig(newForbiddenFlag).actionText}选中货柜`
            })

            setSelectedIds([])
            fetchContainers(true)
        } catch (error: any) {
            showError({
                title: "操作失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setConfirmDialog({ open: false })
        }
    }

    const handleDelete = (container: Container) => {
        setDeleteDialog({
            open: true,
            container
        })
    }

    const handleConfirmDelete = async () => {
        if (!deleteDialog.container) return

        try {
            const containerIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : deleteDialog.container.containerId

            await deleteContainer(containerIds)

            showMessage({
                title: "删除成功",
                description: "选中货柜已删除"
            })

            setSelectedIds([])
            fetchContainers(true)
        } catch (error: any) {
            showError({
                title: "删除失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setDeleteDialog(prev => ({ ...prev, open: false }))
            setTimeout(() => {
                setDeleteDialog(prev => ({ ...prev, container: undefined }))
            }, 200)
        }
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(containers.map(c => c.containerId))
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

    const columns = useMemo<TableColumn<Container>[]>(() => [
        {
            key: 'selection' as any,
            title: (
                <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length < containers.length ? "indeterminate" : containers.length > 0 && selectedIds.length === containers.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="全选"
                />
            ) as any,
            width: 40,
            align: 'center',
            render: (_: any, record: Container) => (
                <Checkbox
                    checked={selectedIds.includes(record.containerId)}
                    onCheckedChange={(checked) => handleSelect(record.containerId, checked as boolean)}
                    aria-label={`选择${record.containerName}`}
                />
            )
        },
        {
            key: 'containerName',
            title: '货柜名称',
            width: 150,
            align: 'left',
            render: (value) => (
                <span className="truncate" title={value as string}>
                    {value}
                </span>
            )
        },
        {
            key: 'containerCode',
            title: '货柜编号',
            width: 120,
            align: 'left',
        },
        {
            key: 'forbiddenFlag',
            title: '状态',
            width: 100,
            align: 'center',
            render: (_: number, record: Container) => {
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
            key: 'addressInfo',
            title: '地址信息',
            width: 200,
            align: 'left',
            render: (value) => (
                <span className="truncate" title={value as string}>
                    {value || '-'}
                </span>
            )
        },
        {
            key: 'action' as any,
            title: '操作',
            width: 100,
            align: 'center',
            render: (_: any, record: Container) => (
                <div className="flex gap-2 justify-center">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(record)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(record)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </div>
            )
        }
    ], [containers.length, selectedIds])

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
                                        containers.find(c => c.containerId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                                            ? "text-yellow-500 hover:text-yellow-500"
                                            : "text-green-500 hover:text-green-500"
                                    )}
                                    onClick={() => {
                                        const first = containers.find(c => c.containerId === selectedIds[0])
                                        setConfirmDialog({
                                            open: true,
                                            container: {
                                                ...first!,
                                                containerName: `选中的 ${selectedIds.length} 个货柜`
                                            }
                                        })
                                    }}
                                >
                                    批量{containers.find(c => c.containerId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value ? '禁用' : '启用'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-500"
                                    onClick={() => {
                                        setDeleteDialog({
                                            open: true,
                                            container: {
                                                ...containers.find(c => c.containerId === selectedIds[0])!,
                                                containerName: `选中的 ${selectedIds.length} 个货柜`
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
                        data={containers}
                        columns={columns as any}
                        loading={loading}
                        rowKey="containerId"
                        scroll={{
                            x: 680,
                            y: 'calc(100vh - 300px)'
                        }}
                        className="h-full [&_td]:py-2"
                        emptyText="暂无货柜数据"
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

            <ContainerEdit
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingContainer={editingContainer}
                onSubmit={handleSubmit}
                loading={loading}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setConfirmDialog(prev => ({ ...prev, container: undefined }))
                        }, 200)
                    }
                }}
                title={getForbiddenFlagConfig(confirmDialog.container?.forbiddenFlag).confirmTitle}
                description={`确定要${getForbiddenFlagConfig(confirmDialog.container?.forbiddenFlag).actionText}货柜 "${confirmDialog.container?.containerName}" 吗？`}
                type={getForbiddenFlagConfig(confirmDialog.container?.forbiddenFlag).confirmType as any}
                confirmText={getForbiddenFlagConfig(confirmDialog.container?.forbiddenFlag).confirmText}
                onConfirm={handleConfirmToggle}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setDeleteDialog(prev => ({ ...prev, container: undefined }))
                        }, 200)
                    }
                }}
                title="删除确认"
                description={`确定要删除货柜 "${deleteDialog.container?.containerName}" 吗？`}
                type="danger"
                confirmText="确认删除"
                onConfirm={handleConfirmDelete}
                showWarning={true}
            />
        </div>
    )
}
