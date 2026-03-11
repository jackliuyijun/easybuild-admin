'use client'

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import type { TableColumn } from "@/components/custom/table"
import { Plus, Search, RotateCw, MoreHorizontal, Edit, Shield, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect, useCallback } from "react"
import { getRoleList, saveRole, toggleRoleForbiddenFlag, deleteRole } from "@/api/role"
import type { Role } from "@/types/role"
import { useDebounce } from "@/hooks/use-debounce"
import { showMessage, showError } from '@/components/custom/notifications'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { FORBIDDEN_FLAG_CONFIG, FORBIDDEN_FLAG_OPTIONS, getForbiddenFlagConfig } from '@/config/forbidden-flag'
import { RoleEdit } from "./role-edit"
import { RoleGrant } from "./role-grant"
import { DEFAULT_PAGE_SIZE } from "@/config/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { usePageTitle } from '@/store'

// 状态选项
const STATUS_OPTIONS = FORBIDDEN_FLAG_OPTIONS

// 动态导入表格组件，禁 SSR
const CustomTable = dynamic(
    () => import('@/components/custom/table').then(mod => mod.CustomTable),
    { ssr: false }
)

export function RolePage() {
    const { setPageTitle } = usePageTitle();
    // 搜索关键词状态
    const [searchKeyword, setSearchKeyword] = useState("")
    // 当前页码
    const [currentPage, setCurrentPage] = useState(1)
    // 角色列表数据
    const [roles, setRoles] = useState<Role[]>([])
    // 总数
    const [total, setTotal] = useState(0)
    // 加载状态
    const [loading, setLoading] = useState(false)
    // 刷新状态
    const [refreshing, setRefreshing] = useState(false)
    // 编辑对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    // 当前编辑的角色数据
    const [editingRole, setEditingRole] = useState<Role | undefined>()
    // 防抖处理搜索关键词
    const debouncedKeyword = useDebounce(searchKeyword, 300)
    // 添加状态筛选态
    const [forbiddenFlagFilter, setForbiddenFlagFilter] = useState<number | undefined>(undefined)
    // 确认对话框状态
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        role?: Role;
    }>({ open: false })
    // 删除确认对话框状态
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        role?: Role;
    }>({ open: false })
    // 权限分配对话框状态
    const [grantDialog, setGrantDialog] = useState<{
        open: boolean;
        role?: Role;
    }>({ open: false })
    // 添加 pageSize 状态
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    // 选中状态
    const [selectedRows, setSelectedRows] = useState<Role[]>([])

    // 使用 useCallback 缓存函数
    const fetchRoles = useCallback(async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true)
            const res = await getRoleList({
                page: currentPage,
                limit: pageSize,  // 使用 pageSize 替换 PAGE_SIZE
                roleName: debouncedKeyword || undefined,
                forbiddenFlag: forbiddenFlagFilter
            }) as any
            setRoles(res.data)
            setTotal(res.count || 0)
        } catch (error) {
            console.error('Failed to fetch roles:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, debouncedKeyword, forbiddenFlagFilter, pageSize])  // 添加 pageSize 依赖

    // 处理刷新
    const handleRefresh = () => {
        fetchRoles(true)
    }

    // 监听页码和搜索关键词变化
    useEffect(() => {
        setPageTitle('角色管理');
        fetchRoles()
    }, [setPageTitle, fetchRoles])

    // 处理页码变化
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setSelectedRows([])
    }

    // 处理搜索
    const handleSearch = (value: string) => {
        setSearchKeyword(value)
        setCurrentPage(1)
        setSelectedRows([])
    }

    // 处理新建/编辑提交
    const handleSubmit = async (data: { roleName: string; remark?: string }) => {
        try {
            await saveRole({
                ...(editingRole?.roleId ? { roleId: editingRole.roleId } : {}),
                roleName: data.roleName,
                remark: data.remark || ''
            })

            // 提示成功
            showMessage({
                title: `${editingRole ? '编辑' : '新增'}成功`,
                description: `角色"${data.roleName}"已${editingRole ? '更新' : '创建'}`
            })

            setDialogOpen(false)
            // 刷新列表
            fetchRoles(true)
        } catch (error: any) {
            // 显示错误提示
            showError({
                title: `${editingRole ? '编辑' : '新增'}失败`,
                description: error.message || '请稍后重试'
            })
            // 抛出错误，让对话框组件处理loading状态
            throw error
        }
    }

    // 打开编辑对话框
    const handleEdit = (role: Role) => {
        setEditingRole(role)
        setDialogOpen(true)
    }

    // 打开新建对话框
    const handleCreate = () => {
        setEditingRole(undefined)
        setDialogOpen(true)
    }

    // 处理状态筛选变化
    const handleForbiddenFlagChange = (value: number | undefined) => {
        setForbiddenFlagFilter(value)
        setCurrentPage(1)
        setSelectedRows([])
    }

    // 处理状态切换
    const handleToggleForbiddenFlag = async (role: Role) => {
        setConfirmDialog({
            open: true,
            role
        })
    }

    // 确认状态切换
    const handleConfirmToggle = async () => {
        if (!confirmDialog.role) return

        try {
            const roleIds = selectedRows.length > 0
                ? selectedRows.map(role => role.roleId).join(',')
                : confirmDialog.role.roleId

            const newForbiddenFlag = confirmDialog.role.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                ? FORBIDDEN_FLAG_CONFIG.disable.value
                : FORBIDDEN_FLAG_CONFIG.enable.value

            await toggleRoleForbiddenFlag({
                ids: roleIds,
                value: newForbiddenFlag
            })

            showMessage({
                title: "操作成功",
                description: `已${getForbiddenFlagConfig(newForbiddenFlag).actionText}选中角色`
            })

            setSelectedRows([])
            fetchRoles(true)
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
    const handleDelete = (role: Role) => {
        setDeleteDialog({
            open: true,
            role
        })
    }

    // 确认删除
    const handleConfirmDelete = async () => {
        if (!deleteDialog.role) return

        try {
            const roleIds = selectedRows.length > 0
                ? selectedRows.map(role => role.roleId).join(',')
                : deleteDialog.role.roleId

            await deleteRole(roleIds)

            showMessage({
                title: "删除成功",
                description: "选中角色已删除"
            })

            setSelectedRows([])
            fetchRoles(true)
        } catch (error: any) {
            showError({
                title: "删除失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setDeleteDialog(prev => ({ ...prev, open: false }))
            setTimeout(() => {
                setDeleteDialog(prev => ({ ...prev, role: undefined }))
            }, 200)
        }
    }

    // 处理权限分配
    const handleGrant = (role: Role) => {
        setGrantDialog({
            open: true,
            role
        })
    }

    // 添加处理每页条数变化的函数
    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1) // 重置到第一页
    }

    // 处理全选
    const handleSelectAll = (checked: boolean) => {
        setSelectedRows(checked ? roles : [])
    }

    // 处理单行选择
    const handleSelectRow = (checked: boolean, record: Role) => {
        if (checked) {
            setSelectedRows(prev => [...prev, record])
        } else {
            setSelectedRows(prev => prev.filter(item => item.roleId !== record.roleId))
        }
    }

    // 定义表格列配置
    const columns: TableColumn<Role>[] = [
        {
            key: 'selection' as any,
            title: (
                <Checkbox
                    checked={selectedRows.length > 0 && selectedRows.length < roles.length ? "indeterminate" : roles.length > 0 && selectedRows.length === roles.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="全选"
                />
            ) as any,
            width: 40,
            align: 'center',
            render: (_, record) => (
                <Checkbox
                    checked={selectedRows.some(item => item.roleId === record.roleId)}
                    onCheckedChange={(checked: any) => handleSelectRow(checked, record)}
                    aria-label={`选择 ${record.roleName}`}
                />
            )
        },
        {
            key: 'roleName',
            title: '角色名称',
            //fixed: 'left',
            width: 200,
            align: 'left',
            render: (value) => (
                <span className="truncate" title={value as string}>
                    {value}
                </span>
            )
        },
        {
            key: 'remark',
            title: '备注',
            width: 300,
            align: 'left',
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
            key: 'blank' as any,
            title: '',
            width: 100,
            align: 'left',
            render: () => null
        },
        {
            key: 'action' as any,
            title: '操作',
            width: 140,
            align: 'center',
            render: (_, record) => (
                <div className="flex gap-2 justify-center">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(record)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleGrant(record)}><Shield className="h-4 w-4" /></Button>
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

                        {selectedRows.length > 0 && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        getForbiddenFlagConfig(selectedRows[0]?.forbiddenFlag).actionClassName
                                    )}
                                    onClick={() => {
                                        setConfirmDialog({
                                            open: true,
                                            role: {
                                                ...selectedRows[0],
                                                roleName: `选中的 ${selectedRows.length} 个角色`
                                            }
                                        })
                                    }}
                                >
                                    批量{getForbiddenFlagConfig(selectedRows[0]?.forbiddenFlag).actionText}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-500"
                                    onClick={() => {
                                        setDeleteDialog({
                                            open: true,
                                            role: {
                                                ...selectedRows[0],
                                                roleName: `选中的 ${selectedRows.length} 个角色`
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
                        data={roles}
                        columns={columns as any}
                        loading={loading}
                        rowKey="roleId"
                        scroll={{
                            x: 1200,
                            y: 'calc(100vh - 300px)'
                        }}
                        className="h-full [&_td]:py-2"
                        emptyText="暂无角色数据"
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
            <RoleEdit
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingRole={editingRole}
                onSubmit={handleSubmit}
                loading={loading}
            />

            {/* 权限分配对话框 */}
            <RoleGrant
                open={grantDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setGrantDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setGrantDialog(prev => ({ ...prev, role: undefined }))
                        }, 200)
                    }
                }}
                role={grantDialog.role}
                onSubmit={async () => handleRefresh()}
            />

            {/* 状态切换确认对话框 */}
            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setConfirmDialog(prev => ({ ...prev, role: undefined }))
                        }, 200)
                    }
                }}
                title={getForbiddenFlagConfig(confirmDialog.role?.forbiddenFlag).confirmTitle}
                description={`确定要${getForbiddenFlagConfig(confirmDialog.role?.forbiddenFlag).actionText}角色 "${confirmDialog.role?.roleName}" 吗？`}
                type={getForbiddenFlagConfig(confirmDialog.role?.forbiddenFlag).confirmType as any}
                confirmText={getForbiddenFlagConfig(confirmDialog.role?.forbiddenFlag).confirmText}
                onConfirm={handleConfirmToggle}
            />

            {/* 删除确认对话框 */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setDeleteDialog(prev => ({ ...prev, role: undefined }))
                        }, 200)
                    }
                }}
                title="删除确认"
                description={`确定要删除角色 "${deleteDialog.role?.roleName}" 吗？`}
                type="danger"
                confirmText="确认删除"
                onConfirm={handleConfirmDelete}
                showWarning={true}
            />
        </div>
    )
}
