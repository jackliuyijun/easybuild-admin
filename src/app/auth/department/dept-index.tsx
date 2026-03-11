'use client'

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import type { TableColumn } from "@/components/custom/table"
import { Plus, Search, RotateCw, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect, useCallback, useMemo } from "react"
import { getDepartmentList, saveDepartment, toggleDepartmentForbiddenFlag, deleteDepartment } from "@/api/department"
import type { Department } from "@/types/department"
import { useDebounce } from "@/hooks/use-debounce"
import { showMessage, showError } from '@/components/custom/notifications'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { FORBIDDEN_FLAG_CONFIG, FORBIDDEN_FLAG_OPTIONS, getForbiddenFlagConfig } from '@/config/forbidden-flag'
import { DepartmentEdit } from "./dept-edit"
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

export function DepartmentPage() {
    const { setPageTitle } = usePageTitle();
    // 搜索关键词状态
    const [searchKeyword, setSearchKeyword] = useState("")
    // 当前页码
    const [currentPage, setCurrentPage] = useState(1)
    // 部门列表数据
    const [departments, setDepartments] = useState<Department[]>([])
    // 总数
    const [total, setTotal] = useState(0)
    // 加载状态
    const [loading, setLoading] = useState(false)
    // 刷新状态
    const [refreshing, setRefreshing] = useState(false)
    // 对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    // 当前编辑的部门数据
    const [editingDepartment, setEditingDepartment] = useState<Department | undefined>()
    // 防抖处理搜索关键词
    const debouncedKeyword = useDebounce(searchKeyword, 800)
    // 添加状态筛选态
    const [forbiddenFlagFilter, setForbiddenFlagFilter] = useState<number | undefined>(undefined)
    // 确认对话框状态
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        department?: Department;
    }>({ open: false })
    // 删除确认对话框状态
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        department?: Department;
    }>({ open: false })
    // 每页条数状态
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    // 添加选中项管理状态
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // 使用 useCallback 缓存函数
    const fetchDepartments = useCallback(async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true)
            const res = await getDepartmentList({
                page: currentPage,
                limit: pageSize,
                departmentName: debouncedKeyword || undefined,
                forbiddenFlag: forbiddenFlagFilter
            }) as any
            setDepartments(res.data)
            setTotal(res.count)
        } catch (error) {
            console.error('Failed to fetch departments:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, debouncedKeyword, forbiddenFlagFilter, pageSize])

    // 处理刷新
    const handleRefresh = () => {
        fetchDepartments(true)
    }

    // 监听页码和搜索关键词变化
    useEffect(() => {
        setPageTitle('部门管理');
        fetchDepartments()
    }, [setPageTitle, fetchDepartments])

    // 处理页码变化
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setSelectedIds([])
    }

    // 处理搜索
    const handleSearch = (value: string) => {
        setSearchKeyword(value)
        setCurrentPage(1)
        setSelectedIds([])
    }

    // 处理新建/辑提交
    const handleSubmit = async (data: { name: string }) => {
        try {
            await saveDepartment({
                ...(editingDepartment?.departmentId ? { departmentId: editingDepartment.departmentId } : {}),
                departmentName: data.name
            })

            // 提示成功
            showMessage({
                title: `${editingDepartment ? '编辑' : '新增'}成功`,
                description: `部门"${data.name}"已${editingDepartment ? '更新' : '创建'}`
            })

            // 刷新列表
            fetchDepartments(true)
        } catch (error: any) {
            // 显示错误提示
            showError({
                title: `${editingDepartment ? '编辑' : '新增'}失败`,
                description: error.message || '请稍后重试'
            })
            // 抛出错误，让对话框组件处理loading状态
            throw error
        }
    }

    // 打开编辑对话框
    const handleEdit = (department: Department) => {
        setEditingDepartment(department)
        setDialogOpen(true)
    }

    // 打开新建对话框
    const handleCreate = () => {
        setEditingDepartment(undefined)
        setDialogOpen(true)
    }

    // 处理状态筛选变化
    const handleForbiddenFlagChange = (value: number | undefined) => {
        setForbiddenFlagFilter(value)
        setCurrentPage(1)
        setSelectedIds([])
    }

    // 处理状态切换
    const handleToggleForbiddenFlag = async (department: Department) => {
        setConfirmDialog({
            open: true,
            department
        })
    }

    // 确认状态切换
    const handleConfirmToggle = async () => {
        if (!confirmDialog.department) return

        try {
            const departmentIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : confirmDialog.department.departmentId

            const newForbiddenFlag = confirmDialog.department.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                ? FORBIDDEN_FLAG_CONFIG.disable.value
                : FORBIDDEN_FLAG_CONFIG.enable.value

            await toggleDepartmentForbiddenFlag({
                ids: departmentIds,
                value: newForbiddenFlag
            })

            showMessage({
                title: "操作成功",
                description: `已${getForbiddenFlagConfig(newForbiddenFlag).actionText}选中部门`
            })

            setSelectedIds([])
            fetchDepartments(true)
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
    const handleDelete = (department: Department) => {
        setDeleteDialog({
            open: true,
            department
        })
    }

    // 确认删除
    const handleConfirmDelete = async () => {
        if (!deleteDialog.department) return

        try {
            const departmentIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : deleteDialog.department.departmentId

            await deleteDepartment(departmentIds)

            showMessage({
                title: "删除成功",
                description: "选中部门已删除"
            })

            setSelectedIds([])
            fetchDepartments(true)
        } catch (error: any) {
            showError({
                title: "删除失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setDeleteDialog(prev => ({ ...prev, open: false }))
            setTimeout(() => {
                setDeleteDialog(prev => ({ ...prev, department: undefined }))
            }, 200)
        }
    }

    // 处理每页条数变化
    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)  // 重置到第一页
        // 更新 fetchDepartments 中的 limit
        getDepartmentList({
            page: 1,
            limit: size,
            departmentName: debouncedKeyword || undefined,
            forbiddenFlag: forbiddenFlagFilter
        }).then((res: any) => {
            setDepartments(res.data)
            setTotal(res.count)
        })
    }

    // 处理全选/取消全选
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(departments.map(dept => dept.departmentId))
        } else {
            setSelectedIds([])
        }
    }

    // 处理单个选择
    const handleSelect = (departmentId: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, departmentId])
        } else {
            setSelectedIds(prev => prev.filter(id => id !== departmentId))
        }
    }

    // 定义表格列配置
    const columns = useMemo<TableColumn<Department>[]>(() => [
        {
            key: 'selection' as any,
            title: (
                <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length < departments.length ? "indeterminate" : departments.length > 0 && selectedIds.length === departments.length}

                    onCheckedChange={handleSelectAll}
                    aria-label="全选"
                />
            ) as any,
            width: 40,
            //fixed: 'left',
            align: 'center',
            render: (_, record) => (
                <Checkbox
                    checked={selectedIds.includes(record.departmentId)}
                    onCheckedChange={(checked) => handleSelect(record.departmentId, checked as boolean)}
                    aria-label={`选择${record.departmentName}`}
                />
            )
        },
        {
            key: 'departmentName',
            title: '部门名称',
            width: 100,
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
            key: 'insertTime',
            title: '创建时间',
            width: 180,
            align: 'center'
        },
        {
            key: 'lastUpdateTime',
            title: '更新时间',
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
    ], [departments.length, selectedIds])

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
                                        departments.find(d => d.departmentId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                                            ? "text-yellow-500 hover:text-yellow-500"
                                            : "text-green-500 hover:text-green-500"
                                    )}
                                    onClick={() => {
                                        const firstDept = departments.find(d => d.departmentId === selectedIds[0])
                                        setConfirmDialog({
                                            open: true,
                                            department: {
                                                ...firstDept!,
                                                departmentName: `选中的 ${selectedIds.length} 个部门`
                                            }
                                        })
                                    }}
                                >
                                    批量{departments.find(d => d.departmentId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value ? '禁用' : '启用'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-500"
                                    onClick={() => {
                                        setDeleteDialog({
                                            open: true,
                                            department: {
                                                ...departments.find(d => d.departmentId === selectedIds[0])!,
                                                departmentName: `选中的 ${selectedIds.length} 个部门`
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
                        data={departments}
                        columns={columns as any}
                        loading={loading}
                        rowKey="departmentId"
                        scroll={{
                            x: 680,
                            y: 'calc(100vh - 300px)'
                        }}
                        className="h-full [&_td]:py-2"
                        emptyText="暂无部门数据"
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
            <DepartmentEdit
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingDepartment={editingDepartment}
                onSubmit={async (data) => {
                    await handleSubmit({ name: data.name })
                }}
                loading={loading}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setConfirmDialog(prev => ({ ...prev, department: undefined }))
                        }, 200)
                    }
                }}
                title={getForbiddenFlagConfig(confirmDialog.department?.forbiddenFlag).confirmTitle}
                description={`确定要${getForbiddenFlagConfig(confirmDialog.department?.forbiddenFlag).actionText}部门 "${confirmDialog.department?.departmentName}" 吗？`}
                type={getForbiddenFlagConfig(confirmDialog.department?.forbiddenFlag).confirmType as any}
                confirmText={getForbiddenFlagConfig(confirmDialog.department?.forbiddenFlag).confirmText}
                onConfirm={handleConfirmToggle}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setDeleteDialog(prev => ({ ...prev, department: undefined }))
                        }, 200)
                    }
                }}
                title="删除确认"
                description={`确定要删除部门 "${deleteDialog.department?.departmentName}" 吗？`}
                type="danger"
                confirmText="确认删除"
                onConfirm={handleConfirmDelete}
                showWarning={true}
            />
        </div>
    )
}
