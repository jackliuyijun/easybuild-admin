'use client'

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import type { TableColumn } from "@/components/custom/table"
import { Plus, Search, RotateCw, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useCallback } from "react"
import { getGroupList, saveGroup, toggleGroupForbiddenFlag, deleteGroup } from "@/api/group"
import type { Group } from "@/types/group"
import { useDebounce } from "@/hooks/use-debounce"
import { showMessage, showError } from '@/components/custom/notifications'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { FORBIDDEN_FLAG_CONFIG, FORBIDDEN_FLAG_OPTIONS, getForbiddenFlagConfig } from '@/config/forbidden-flag'
import { GroupEdit } from "./group-edit"
import { DEFAULT_PAGE_SIZE } from "@/config/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePageTitle } from '@/store'

// 状态选项
const STATUS_OPTIONS = FORBIDDEN_FLAG_OPTIONS

// 动态导入表格组件
const CustomTable = dynamic(
    () => import('@/components/custom/table').then(mod => mod.CustomTable),
    { ssr: false }
)

export function GroupPage() {
    const { setPageTitle } = usePageTitle();
    // 状态定义
    const [searchKeyword, setSearchKeyword] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [groups, setGroups] = useState<Group[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingGroup, setEditingGroup] = useState<Group | undefined>()
    const debouncedKeyword = useDebounce(searchKeyword, 800)
    const [forbiddenFlagFilter, setForbiddenFlagFilter] = useState<number | undefined>(undefined)
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        group?: Group;
    }>({ open: false })
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        group?: Group;
    }>({ open: false })
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // 获取分类组列表
    const fetchGroups = useCallback(async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true)
            const res = await getGroupList({
                page: currentPage,
                limit: pageSize,
                searchKeyWord: debouncedKeyword || undefined,
                forbiddenFlag: forbiddenFlagFilter
            }) as any
            setGroups(res.data)
            setTotal(res.count || 0)
        } catch (error) {
            console.error('Failed to fetch category groups:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, debouncedKeyword, forbiddenFlagFilter, pageSize])

    // 监听页码和搜索关键词变化
    useEffect(() => {
        setPageTitle('分类组管理');
        fetchGroups()
    }, [setPageTitle, fetchGroups])

    // 处理刷新
    const handleRefresh = () => {
        fetchGroups(true)
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
        setEditingGroup(undefined)
        setDialogOpen(true)  // 直接打开对话框即可
    }

    // 处理编辑
    const handleEdit = (group: Group) => {
        setEditingGroup(group)
        setDialogOpen(true)
    }

    // 处理全选/取消全选
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(groups.map(group => group.groupId))
        } else {
            setSelectedIds([])
        }
    }

    // 处理单个选择
    const handleSelect = (groupId: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, groupId])
        } else {
            setSelectedIds(prev => prev.filter(id => id !== groupId))
        }
    }

    // 处理提交
    const handleSubmit = async (data: any) => {
        try {
            await saveGroup({
                ...(editingGroup?.groupId ? { groupId: editingGroup.groupId } : {}),
                ...data
            })

            showMessage({
                title: `${editingGroup ? '编辑' : '新增'}成功`,
                description: `分组"${data.groupName}"已${editingGroup ? '更新' : '创建'}`
            })

            fetchGroups(true)
            setDialogOpen(false)
        } catch (error: any) {
            showError({
                title: `${editingGroup ? '编辑' : '新增'}失败`,
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
    const handleToggleForbiddenFlag = async (group: Group) => {
        setConfirmDialog({
            open: true,
            group
        })
    }

    // 确认状态切换
    const handleConfirmToggle = async () => {
        if (!confirmDialog.group) return

        try {
            const groupIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : confirmDialog.group.groupId

            const newForbiddenFlag = confirmDialog.group.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                ? FORBIDDEN_FLAG_CONFIG.disable.value
                : FORBIDDEN_FLAG_CONFIG.enable.value

            await toggleGroupForbiddenFlag({
                ids: groupIds,
                value: newForbiddenFlag
            })

            showMessage({
                title: "操作成功",
                description: `已${getForbiddenFlagConfig(newForbiddenFlag).actionText}选中分组`
            })

            setSelectedIds([])
            fetchGroups(true)
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
    const handleDelete = (group: Group) => {
        setDeleteDialog({
            open: true,
            group
        })
    }

    // 确认删除
    const handleConfirmDelete = async () => {
        if (!deleteDialog.group) return

        try {
            const groupIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : deleteDialog.group.groupId

            await deleteGroup(groupIds)

            showMessage({
                title: "删除成功",
                description: "选中分组已删除"
            })

            setSelectedIds([])
            fetchGroups(true)
        } catch (error: any) {
            showError({
                title: "删除失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setDeleteDialog({ open: false })
        }
    }

    // 表格列置
    const columns: TableColumn<Group>[] = [
        {
            key: 'selection' as keyof Group,
            title: (
                <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length < groups.length ? "indeterminate" : groups.length > 0 && selectedIds.length === groups.length}

                    onCheckedChange={handleSelectAll}
                    aria-label="全选"
                />
            ) as any,
            width: 40,
            fixed: 'left',
            align: 'center',
            render: (_, record) => (
                <Checkbox
                    checked={selectedIds.includes(record.groupId)}
                    onCheckedChange={(checked: any) => handleSelect(record.groupId, checked)}
                    aria-label={`选择${record.groupName}`}
                />
            )
        },
        // {
        //     key: 'index' as keyof Group,
        //     title: '序号',
        //     width: 80,
        //     fixed: 'left',
        //     align: 'center',
        //     render: (_, __, index) => (currentPage - 1) * pageSize + index + 1
        // },
        {
            key: 'groupName',
            title: '分组名称',
            width: 200,
            align: 'center'
        },
        {
            key: 'groupCode',
            title: '分组编码',
            width: 120,
            align: 'center'
        },
        {
            key: 'groupDescribe',
            title: '描述',
            width: 300,
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
            key: 'insertTime',
            title: '创建时间',
            width: 180,
            align: 'center'
        },
        {
            key: 'action' as keyof Group,
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
                                        groups.find(d => d.groupId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                                            ? "text-yellow-500 hover:text-yellow-500"
                                            : "text-green-500 hover:text-green-500"
                                    )}
                                    onClick={() => {
                                        const firstGroup = groups.find(d => d.groupId === selectedIds[0])
                                        setConfirmDialog({
                                            open: true,
                                            group: {
                                                ...firstGroup!,
                                                groupName: `选中的 ${selectedIds.length} 个分组`
                                            }
                                        })
                                    }}
                                >
                                    批量{groups.find(d => d.groupId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value ? '禁用' : '启用'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-500"
                                    onClick={() => {
                                        setDeleteDialog({
                                            open: true,
                                            group: {
                                                ...groups.find(d => d.groupId === selectedIds[0])!,
                                                groupName: `选中的 ${selectedIds.length} 个分组`
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
                        data={groups}
                        columns={columns as any}
                        loading={loading}
                        rowKey="groupId"
                        scroll={{
                            x: 1390,
                            y: 'calc(100vh - 300px)'
                        }}
                        className="h-full [&_td]:py-2"
                        emptyText="暂无分组数据"
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
            <GroupEdit
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingGroup={editingGroup}
                onSubmit={handleSubmit}
                loading={loading}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setConfirmDialog(prev => ({ ...prev, group: undefined }))
                        }, 200)
                    }
                }}
                title={getForbiddenFlagConfig(confirmDialog.group?.forbiddenFlag).confirmTitle}
                description={`确定要${getForbiddenFlagConfig(confirmDialog.group?.forbiddenFlag).actionText}分组 "${confirmDialog.group?.groupName}" 吗？`}
                type={getForbiddenFlagConfig(confirmDialog.group?.forbiddenFlag).confirmType as any}
                confirmText={getForbiddenFlagConfig(confirmDialog.group?.forbiddenFlag).confirmText}
                onConfirm={handleConfirmToggle}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setDeleteDialog(prev => ({ ...prev, group: undefined }))
                        }, 200)
                    }
                }}
                title="删除确认"
                description={`确定要删除分组 "${deleteDialog.group?.groupName}" 吗？`}
                type="danger"
                confirmText="确认删除"
                onConfirm={handleConfirmDelete}
                showWarning={true}
            />
        </div>
    )
}
