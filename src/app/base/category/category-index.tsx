'use client'

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import type { TableColumn } from "@/components/custom/table"
import { Plus, Search, RotateCw, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useCallback } from "react"
import { getCategoryList, saveCategory, toggleCategoryForbiddenFlag, deleteCategory } from "@/api/category"
import type { Category } from "@/types/category"
import { useDebounce } from "@/hooks/use-debounce"
import { showMessage, showError } from '@/components/custom/notifications'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { FORBIDDEN_FLAG_CONFIG, FORBIDDEN_FLAG_OPTIONS, getForbiddenFlagConfig } from '@/config/forbidden-flag'
import { CategoryEdit } from "./category-edit"
import { DEFAULT_PAGE_SIZE } from "@/config/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { MultiSelect } from "@/components/custom/multi-select"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePageTitle } from '@/store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 等级选项
const LEVEL_OPTIONS = [
    { value: 'all', label: '全部等级' },
    { value: '1', label: '一级' },
    { value: '2', label: '二级' },
    { value: '3', label: '三级' }
]

// 状态选项
const STATUS_OPTIONS = FORBIDDEN_FLAG_OPTIONS

// 动态导入表格组件
const CustomTable = dynamic(
    () => import('@/components/custom/table').then(mod => mod.CustomTable),
    { ssr: false }
)

export function CategoryPage() {
    const { setPageTitle } = usePageTitle();
    // 状态定义
    const [searchKeyword, setSearchKeyword] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [categories, setCategories] = useState<Category[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | undefined>()
    const debouncedKeyword = useDebounce(searchKeyword, 800)
    const [forbiddenFlagFilter, setForbiddenFlagFilter] = useState<number | undefined>(undefined)
    const [levelFilter, setLevelFilter] = useState<string>('all')
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        category?: Category;
    }>({ open: false })
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        category?: Category;
    }>({ open: false })
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // 获取分类列表
    const fetchCategories = useCallback(async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true)
            const res = await getCategoryList({
                page: currentPage,
                limit: pageSize,
                searchKeyWord: debouncedKeyword || undefined,
                forbiddenFlag: forbiddenFlagFilter,
                level: levelFilter && levelFilter !== 'all' ? parseInt(levelFilter, 10) : undefined,
            }) as any
            setCategories(res.data)
            setTotal(res.count || 0)
        } catch (error) {
            console.error('Failed to fetch categories:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, debouncedKeyword, forbiddenFlagFilter, levelFilter, pageSize])


    // 监听页码和搜索关键词变化
    useEffect(() => {
        setPageTitle('分类管理');
        fetchCategories()
    }, [setPageTitle, fetchCategories])

    // 处理刷新
    const handleRefresh = () => {
        fetchCategories(true)
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
        setEditingCategory(undefined)
        setDialogOpen(true)
    }

    // 处理编辑
    const handleEdit = (category: Category) => {
        setEditingCategory(category)
        setDialogOpen(true)
    }

    // 处理全选/取消全选
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(categories.map(category => category.categoryId))
        } else {
            setSelectedIds([])
        }
    }

    // 处理单个选择
    const handleSelect = (categoryId: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, categoryId])
        } else {
            setSelectedIds(prev => prev.filter(id => id !== categoryId))
        }
    }

    // 处理提交
    const handleSubmit = async (data: any) => {
        try {
            await saveCategory({
                ...(editingCategory?.categoryId ? { categoryId: editingCategory.categoryId } : {}),
                ...data
            })

            showMessage({
                title: `${editingCategory ? '编辑' : '新增'}成功`,
                description: `分类"${data.categoryName}"已${editingCategory ? '更新' : '创建'}`
            })

            fetchCategories(true)
            setDialogOpen(false)
        } catch (error: any) {
            showError({
                title: `${editingCategory ? '编辑' : '新增'}失败`,
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

    // 处理等级筛选变化
    const handleLevelChange = (value: string) => {
        setLevelFilter(value)
        setCurrentPage(1)
        setSelectedIds([])
    }

    // 处理状态切换
    const handleToggleForbiddenFlag = async (category: Category) => {
        setConfirmDialog({
            open: true,
            category
        })
    }

    // 确认状态切换
    const handleConfirmToggle = async () => {
        if (!confirmDialog.category) return

        try {
            const categoryIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : confirmDialog.category.categoryId

            const newForbiddenFlag = confirmDialog.category.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                ? FORBIDDEN_FLAG_CONFIG.disable.value
                : FORBIDDEN_FLAG_CONFIG.enable.value

            await toggleCategoryForbiddenFlag({
                ids: categoryIds,
                value: newForbiddenFlag
            })

            showMessage({
                title: "操作成功",
                description: `已${getForbiddenFlagConfig(newForbiddenFlag).actionText}选中分类`
            })

            setSelectedIds([])
            fetchCategories(true)
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
    const handleDelete = (category: Category) => {
        setDeleteDialog({
            open: true,
            category
        })
    }

    // 确认删除
    const handleConfirmDelete = async () => {
        if (!deleteDialog.category) return

        try {
            const categoryIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : deleteDialog.category.categoryId

            await deleteCategory(categoryIds)

            showMessage({
                title: "删除成功",
                description: "选中分类已删除"
            })

            setSelectedIds([])
            fetchCategories(true)
        } catch (error: any) {
            showError({
                title: "删除失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setDeleteDialog({ open: false })
        }
    }


    // 表格列配置
    const columns: TableColumn<Category>[] = [
        {
            key: 'selection' as keyof Category,
            title: (
                <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length < categories.length ? "indeterminate" : categories.length > 0 && selectedIds.length === categories.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="全选"
                />
            ) as any,
            width: 60,
            align: 'center',
            fixed: 'left',
            render: (_, record) => (
                <Checkbox
                    checked={selectedIds.includes(record.categoryId)}
                    onCheckedChange={(checked: any) => handleSelect(record.categoryId, checked)}
                    aria-label={`选择${record.categoryName}`}
                />
            )
        },

        {
            key: 'categoryName',
            title: '分类名称',
            width: 150,
            align: 'left',
            //fixed: 'left'
        },
        {
            key: 'categoryDescribe' as keyof Category,
            title: '描述',
            width: 260,
            align: 'left'
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
            key: 'sort',
            title: '排序',
            width: 80,
            align: 'center'
        },
        {
            key: 'level' as keyof Category,
            title: '等级',
            width: 100,
            align: 'center',
            render: (_, record) => {
                const levelConfig: Record<number, {
                    label: string;
                    bg: string;
                    text: string;
                    border: string;
                    dot: string;
                }> = {
                    1: {
                        label: '一级',
                        bg: 'bg-blue-500/10 dark:bg-blue-500/15',
                        text: 'text-blue-600 dark:text-blue-400',
                        border: 'border-blue-200/50 dark:border-blue-500/20',
                        dot: 'bg-blue-500'
                    },
                    2: {
                        label: '二级',
                        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
                        text: 'text-emerald-600 dark:text-emerald-400',
                        border: 'border-emerald-200/50 dark:border-emerald-500/20',
                        dot: 'bg-emerald-500'
                    },
                    3: {
                        label: '三级',
                        bg: 'bg-violet-500/10 dark:bg-violet-500/15',
                        text: 'text-violet-600 dark:text-violet-400',
                        border: 'border-violet-200/50 dark:border-violet-500/20',
                        dot: 'bg-violet-500'
                    }
                }
                const config = levelConfig[record.level] || {
                    label: `${record.level}级`,
                    bg: 'bg-gray-500/10',
                    text: 'text-gray-600 dark:text-gray-400',
                    border: 'border-gray-200 dark:border-gray-500/20',
                    dot: 'bg-gray-500'
                }
                return (
                    <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold transition-all duration-200 hover:scale-105 backdrop-blur-sm shadow-sm",
                        config.bg,
                        config.text,
                        config.border
                    )}>
                        <span className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]", config.dot)} />
                        {config.label}
                    </div>
                )
            }
        },
        {
            key: 'parentName',
            title: '上级分类',
            width: 150,
            align: 'center'
        },
        {
            key: 'action' as keyof Category,
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

                        <Select value={levelFilter} onValueChange={handleLevelChange}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="全部等级" />
                            </SelectTrigger>
                            <SelectContent>
                                {LEVEL_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

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
                                        categories.find(d => d.categoryId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                                            ? "text-yellow-500 hover:text-yellow-500"
                                            : "text-green-500 hover:text-green-500"
                                    )}
                                    onClick={() => {
                                        const firstCategory = categories.find(d => d.categoryId === selectedIds[0])
                                        setConfirmDialog({
                                            open: true,
                                            category: {
                                                ...firstCategory!,
                                                categoryName: `选中的 ${selectedIds.length} 个分类`
                                            }
                                        })
                                    }}
                                >
                                    批量{categories.find(d => d.categoryId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value ? '禁用' : '启用'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-500"
                                    onClick={() => {
                                        setDeleteDialog({
                                            open: true,
                                            category: {
                                                ...categories.find(d => d.categoryId === selectedIds[0])!,
                                                categoryName: `选中的 ${selectedIds.length} 个分类`
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
                        data={categories}
                        columns={columns as any}
                        loading={loading}
                        rowKey="categoryId"
                        scroll={{
                            x: 1520,
                            y: 'calc(100vh - 300px)'
                        }}
                        className="h-full [&_td]:py-2"
                        emptyText="暂无分类数据"
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
            <CategoryEdit
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingCategory={editingCategory}
                onSubmit={handleSubmit}
                loading={loading}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setConfirmDialog(prev => ({ ...prev, category: undefined }))
                        }, 200)
                    }
                }}
                title={getForbiddenFlagConfig(confirmDialog.category?.forbiddenFlag).confirmTitle}
                description={`确定要${getForbiddenFlagConfig(confirmDialog.category?.forbiddenFlag).actionText}分类 "${confirmDialog.category?.categoryName}" 吗？`}
                type={getForbiddenFlagConfig(confirmDialog.category?.forbiddenFlag).confirmType as any}
                confirmText={getForbiddenFlagConfig(confirmDialog.category?.forbiddenFlag).confirmText}
                onConfirm={handleConfirmToggle}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setDeleteDialog(prev => ({ ...prev, category: undefined }))
                        }, 200)
                    }
                }}
                title="删除确认"
                description={`确定要删除分类 "${deleteDialog.category?.categoryName}" 吗？`}
                type="danger"
                confirmText="确认删除"
                onConfirm={handleConfirmDelete}
                showWarning={true}
            />
        </div>
    )
}
