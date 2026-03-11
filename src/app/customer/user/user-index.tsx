'use client'

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import type { TableColumn } from "@/components/custom/table"
import { Plus, Search, RotateCw, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useState, useCallback, useEffect } from "react"
import { getList, save, toggleForbiddenFlag, remove as deleteUser } from "@/api/user"
import type { User } from "@/types/user"
import { useDebounce } from "@/hooks/use-debounce"
import { showMessage, showError } from '@/components/custom/notifications'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { FORBIDDEN_FLAG_CONFIG, FORBIDDEN_FLAG_OPTIONS, getForbiddenFlagConfig } from '@/config/forbidden-flag'
import { UserEdit } from "./user-edit"
import { DEFAULT_PAGE_SIZE } from "@/config/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { ImagePreview } from "@/components/ui/image-preview"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePageTitle } from '@/store'

const CustomTable = dynamic(
    () => import('@/components/custom/table').then(mod => mod.CustomTable),
    { ssr: false }
)

const STATUS_OPTIONS = FORBIDDEN_FLAG_OPTIONS

export function UserPage() {
    const { setPageTitle } = usePageTitle();
    const [searchKeyword, setSearchKeyword] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [users, setUsers] = useState<User[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | undefined>()
    const debouncedKeyword = useDebounce(searchKeyword, 800)
    const [forbiddenFlagFilter, setForbiddenFlagFilter] = useState<number | undefined>(undefined)
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        user?: User;
    }>({ open: false })
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        user?: User;
    }>({ open: false })
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [previewImage, setPreviewImage] = useState<{
        open: boolean;
        url?: string;
    }>({ open: false })

    const fetchUsers = useCallback(async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true)
            const res = await getList({
                page: currentPage,
                limit: pageSize,
                searchKeyWord: debouncedKeyword || undefined,
                forbiddenFlag: forbiddenFlagFilter
            }) as any
            setUsers(res.data)
            setTotal(res.count)
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, debouncedKeyword, forbiddenFlagFilter, pageSize])

    useEffect(() => {
        setPageTitle('会员管理');
        fetchUsers()
    }, [setPageTitle, fetchUsers])

    const handleRefresh = () => {
        fetchUsers(true)
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

    const handleCreate = () => {
        setEditingUser(undefined)
        setDialogOpen(true)
    }

    const handleEdit = (user: User) => {
        setEditingUser(user)
        setDialogOpen(true)
    }

    const handleSubmit = async (data: any) => {
        try {
            await save({
                ...(editingUser?.userId ? { userId: editingUser.userId } : {}),
                ...data
            })

            showMessage({
                title: `${editingUser ? '编辑' : '新增'}成功`,
                description: `会员"${data.name}"已${editingUser ? '更新' : '创建'}`
            })

            fetchUsers(true)
            setDialogOpen(false)
        } catch (error: any) {
            showError({
                title: `${editingUser ? '编辑' : '新增'}失败`,
                description: error.message || '请稍后重试'
            })
            throw error
        }
    }

    const handleToggleForbiddenFlag = async (user: User) => {
        setConfirmDialog({
            open: true,
            user
        })
    }

    const handleConfirmToggle = async () => {
        if (!confirmDialog.user) return

        try {
            const userIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : confirmDialog.user.userId

            const newForbiddenFlag = confirmDialog.user.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                ? FORBIDDEN_FLAG_CONFIG.disable.value
                : FORBIDDEN_FLAG_CONFIG.enable.value

            await toggleForbiddenFlag({
                ids: userIds,
                value: newForbiddenFlag
            })

            showMessage({
                title: "操作成功",
                description: `已${getForbiddenFlagConfig(newForbiddenFlag).actionText}选中会员`
            })

            setSelectedIds([])
            fetchUsers(true)
        } catch (error: any) {
            showError({
                title: "操作失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setConfirmDialog({ open: false })
        }
    }

    const handleDelete = (user: User) => {
        setDeleteDialog({
            open: true,
            user
        })
    }

    const handleConfirmDelete = async () => {
        if (!deleteDialog.user) return

        try {
            const userIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : deleteDialog.user.userId

            await deleteUser(userIds)

            showMessage({
                title: "删除成功",
                description: "选中会员已删除"
            })

            setSelectedIds([])
            fetchUsers(true)
        } catch (error: any) {
            showError({
                title: "删除失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setDeleteDialog({ open: false })
        }
    }

    const columns: TableColumn<User>[] = [
        {
            key: 'selection' as any,
            title: (
                <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length < users.length ? "indeterminate" : users.length > 0 && selectedIds.length === users.length}

                    onCheckedChange={(checked) => {
                        if (checked) {
                            setSelectedIds(users.map(user => user.userId))
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
                    checked={selectedIds.includes(record.userId)}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            setSelectedIds(prev => [...prev, record.userId])
                        } else {
                            setSelectedIds(prev => prev.filter(id => id !== record.userId))
                        }
                    }}
                    aria-label={`选择${record.name}`}
                />
            )
        },
        {
            key: 'phone',
            title: '手机号',
            width: 120,
            align: 'center'
        },
        {
            key: 'name',
            title: '用户名',
            width: 120,
            align: 'center'
        },
        {
            key: 'email',
            title: '邮箱',
            width: 150,
            align: 'center'
        },
        {
            key: 'gender',
            title: '性别',
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
                    />
                )
            }
        },
        {
            key: 'createTime',
            title: '注册时间',
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

                        <div className="flex items-center gap-2">
                            {STATUS_OPTIONS.map((option) => (
                                <Button
                                    key={option.label}
                                    variant={forbiddenFlagFilter === option.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setForbiddenFlagFilter(
                                            forbiddenFlagFilter === option.value ? undefined : option.value
                                        )
                                        setCurrentPage(1)
                                        setSelectedIds([])
                                    }}
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
                                        users.find(d => d.userId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                                            ? "text-yellow-500 hover:text-yellow-500"
                                            : "text-green-500 hover:text-green-500"
                                    )}
                                    onClick={() => {
                                        const firstUser = users.find(d => d.userId === selectedIds[0])
                                        setConfirmDialog({
                                            open: true,
                                            user: {
                                                ...firstUser!,
                                                name: `选中的 ${selectedIds.length} 个会员`
                                            }
                                        })
                                    }}
                                >
                                    批量{users.find(d => d.userId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value ? '禁用' : '启用'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-500"
                                    onClick={() => {
                                        setDeleteDialog({
                                            open: true,
                                            user: {
                                                ...users.find(d => d.userId === selectedIds[0])!,
                                                name: `选中的 ${selectedIds.length} 个会员`
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
                        data={users}
                        columns={columns as any}
                        loading={loading}
                        rowKey="userId"
                        scroll={{
                            x: 1800,
                            y: 'calc(100vh - 300px)'
                        }}
                        className="h-full [&_td]:py-2"
                        emptyText="暂无会员数据"
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
            <UserEdit
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingUser={editingUser}
                onSubmit={handleSubmit}
                loading={loading}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setConfirmDialog(prev => ({ ...prev, user: undefined }))
                        }, 200)
                    }
                }}
                title={getForbiddenFlagConfig(confirmDialog.user?.forbiddenFlag).confirmTitle}
                description={`确定要${getForbiddenFlagConfig(confirmDialog.user?.forbiddenFlag).actionText}会员 "${confirmDialog.user?.name}" 吗？`}
                type={getForbiddenFlagConfig(confirmDialog.user?.forbiddenFlag).confirmType as any}
                confirmText={getForbiddenFlagConfig(confirmDialog.user?.forbiddenFlag).confirmText}
                onConfirm={handleConfirmToggle}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setDeleteDialog(prev => ({ ...prev, user: undefined }))
                        }, 200)
                    }
                }}
                title="删除确认"
                description={`确定要删除会员 "${deleteDialog.user?.name}" 吗？`}
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
