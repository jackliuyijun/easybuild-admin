'use client'

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import type { TableColumn } from "@/components/custom/table"
import { Plus, Search, RotateCw, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useCallback } from "react"
import { getTagList, saveTag, toggleTagForbiddenFlag, deleteTag } from "@/api/tag"
import type { Tag } from "@/types/tag"
import { useDebounce } from "@/hooks/use-debounce"
import { showMessage, showError } from '@/components/custom/notifications'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { FORBIDDEN_FLAG_CONFIG, FORBIDDEN_FLAG_OPTIONS, getForbiddenFlagConfig } from '@/config/forbidden-flag'
import { TagEdit } from "./tag-edit"
import { DEFAULT_PAGE_SIZE } from "@/config/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { MultiSelect } from "@/components/custom/multi-select"
import { getCategoryDropdownList } from "@/api/category"
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

export function TagPage() {
    const { setPageTitle } = usePageTitle();
    // 状态定义
    const [searchKeyword, setSearchKeyword] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [tags, setTags] = useState<Tag[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingTag, setEditingTag] = useState<Tag | undefined>()
    const debouncedKeyword = useDebounce(searchKeyword, 800)
    const [forbiddenFlagFilter, setForbiddenFlagFilter] = useState<number | undefined>(undefined)
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        tag?: Tag;
    }>({ open: false })
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        tag?: Tag;
    }>({ open: false })
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [categoryOptions, setCategoryOptions] = useState<{
        value: string;
        label: string;
    }[]>([])
    const [categoryFilter, setCategoryFilter] = useState<string | undefined>()

    // 获取分类选项
    useEffect(() => {
        setPageTitle('标签管理');
        getCategoryDropdownList().then(options => {
            setCategoryOptions(options)
        })
    }, [setPageTitle])

    // 获取标签列表
    const fetchTags = useCallback(async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true)
            const res = await getTagList({
                page: currentPage,
                limit: pageSize,
                searchKeyWord: debouncedKeyword || undefined,
                forbiddenFlag: forbiddenFlagFilter,
                categoryCode: categoryFilter
            }) as any
            setTags(res.data)
            setTotal(res.count || 0)
        } catch (error) {
            console.error('Failed to fetch tags:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, debouncedKeyword, forbiddenFlagFilter, pageSize, categoryFilter])

    // 监听页码和搜索关键词变化
    useEffect(() => {
        fetchTags()
    }, [fetchTags])

    // 处理刷新
    const handleRefresh = () => {
        fetchTags(true)
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
        setEditingTag(undefined)
        setDialogOpen(true)
    }

    // 处理编辑
    const handleEdit = (tag: Tag) => {
        setEditingTag(tag)
        setDialogOpen(true)
    }

    // 处理全选/取消全选
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(tags.map(tag => tag.tagId))
        } else {
            setSelectedIds([])
        }
    }

    // 处理单个选择
    const handleSelect = (tagId: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, tagId])
        } else {
            setSelectedIds(prev => prev.filter(id => id !== tagId))
        }
    }

    // 处理提交
    const handleSubmit = async (data: any) => {
        try {
            await saveTag({
                ...(editingTag?.tagId ? { tagId: editingTag.tagId } : {}),
                ...data
            })

            showMessage({
                title: `${editingTag ? '编辑' : '新增'}成功`,
                description: `标签"${data.tagName}"已${editingTag ? '更新' : '创建'}`
            })

            fetchTags(true)
            setDialogOpen(false)
        } catch (error: any) {
            showError({
                title: `${editingTag ? '编辑' : '新增'}失败`,
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
    const handleToggleForbiddenFlag = async (tag: Tag) => {
        setConfirmDialog({
            open: true,
            tag
        })
    }

    // 确认状态切换
    const handleConfirmToggle = async () => {
        if (!confirmDialog.tag) return

        try {
            const tagIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : confirmDialog.tag.tagId

            const newForbiddenFlag = confirmDialog.tag.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                ? FORBIDDEN_FLAG_CONFIG.disable.value
                : FORBIDDEN_FLAG_CONFIG.enable.value

            await toggleTagForbiddenFlag({
                ids: tagIds,
                value: newForbiddenFlag
            })

            showMessage({
                title: "操作成功",
                description: `已${getForbiddenFlagConfig(newForbiddenFlag).actionText}选中标签`
            })

            setSelectedIds([])
            fetchTags(true)
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
    const handleDelete = (tag: Tag) => {
        setDeleteDialog({
            open: true,
            tag
        })
    }

    // 确认删除
    const handleConfirmDelete = async () => {
        if (!deleteDialog.tag) return

        try {
            const tagIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : deleteDialog.tag.tagId

            await deleteTag(tagIds)

            showMessage({
                title: "删除成功",
                description: "选中标签已删除"
            })

            setSelectedIds([])
            fetchTags(true)
        } catch (error: any) {
            showError({
                title: "删除失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setDeleteDialog({ open: false })
        }
    }

    // 处理分类筛选变化
    const handleCategoryChange = (value: string) => {
        setCategoryFilter(value || undefined)
        setCurrentPage(1)
        setSelectedIds([])
    }

    // 表格列配置
    const columns: TableColumn<Tag>[] = [
        {
            key: 'selection' as keyof Tag,
            title: (
                <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length < tags.length ? "indeterminate" : tags.length > 0 && selectedIds.length === tags.length}

                    onCheckedChange={handleSelectAll}
                    aria-label="全选"
                />
            ) as any,
            width: 40,
            fixed: 'left',
            align: 'center',
            render: (_, record) => (
                <Checkbox
                    checked={selectedIds.includes(record.tagId)}
                    onCheckedChange={(checked: any) => handleSelect(record.tagId, checked)}
                    aria-label={`选择${record.tagName}`}
                />
            )
        },
        // {
        //     key: 'index' as keyof Tag,
        //     title: '序号',
        //     width: 80,
        //     fixed: 'left',
        //     align: 'center',
        //     render: (_, __, index) => (currentPage - 1) * pageSize + index + 1
        // },
        {
            key: 'tagName',
            title: '标签名称',
            width: 150,
            align: 'center'
        },
        {
            key: 'tagCode',
            title: '编码',
            width: 120,
            align: 'center'
        },
        {
            key: 'categoryName',
            title: '所属分类',
            width: 150,
            align: 'center'
        },
        {
            key: 'tagDescribe',
            title: '描述',
            width: 200,
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
            key: 'action' as keyof Tag,
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

                        <div className="w-[240px]">
                            <MultiSelect
                                value={categoryFilter ? [categoryFilter] : []}
                                onChange={handleCategoryChange}
                                options={categoryOptions}
                                placeholder="按分类筛选"
                                multiple={false}
                                popoverProps={{
                                    align: 'start',
                                    className: 'w-full'
                                }}
                                onSearch={async (keyword) => {
                                    const data = await getCategoryDropdownList({
                                        categoryName: keyword
                                    })
                                    setCategoryOptions(prev => {
                                        const merged = [...prev]
                                        data.forEach((item: any) => {
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
                                        tags.find(d => d.tagId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                                            ? "text-yellow-500 hover:text-yellow-500"
                                            : "text-green-500 hover:text-green-500"
                                    )}
                                    onClick={() => {
                                        const firstTag = tags.find(d => d.tagId === selectedIds[0])
                                        setConfirmDialog({
                                            open: true,
                                            tag: {
                                                ...firstTag!,
                                                tagName: `选中的 ${selectedIds.length} 个标签`
                                            }
                                        })
                                    }}
                                >
                                    批量{tags.find(d => d.tagId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value ? '禁用' : '启用'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-500"
                                    onClick={() => {
                                        setDeleteDialog({
                                            open: true,
                                            tag: {
                                                ...tags.find(d => d.tagId === selectedIds[0])!,
                                                tagName: `选中的 ${selectedIds.length} 个标签`
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
                        data={tags}
                        columns={columns as any}
                        loading={loading}
                        rowKey="tagId"
                        scroll={{
                            x: 1520,
                            y: 'calc(100vh - 300px)'
                        }}
                        className="h-full [&_td]:py-2"
                        emptyText="暂无标签数据"
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
            <TagEdit
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingTag={editingTag}
                onSubmit={handleSubmit}
                loading={loading}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setConfirmDialog(prev => ({ ...prev, tag: undefined }))
                        }, 200)
                    }
                }}
                title={getForbiddenFlagConfig(confirmDialog.tag?.forbiddenFlag).confirmTitle}
                description={`确定要${getForbiddenFlagConfig(confirmDialog.tag?.forbiddenFlag).actionText}标签 "${confirmDialog.tag?.tagName}" 吗？`}
                type={getForbiddenFlagConfig(confirmDialog.tag?.forbiddenFlag).confirmType as any}
                confirmText={getForbiddenFlagConfig(confirmDialog.tag?.forbiddenFlag).confirmText}
                onConfirm={handleConfirmToggle}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setDeleteDialog(prev => ({ ...prev, tag: undefined }))
                        }, 200)
                    }
                }}
                title="删除确认"
                description={`确定要删除标签 "${deleteDialog.tag?.tagName}" 吗`}
                type="danger"
                confirmText="确认删除"
                onConfirm={handleConfirmDelete}
                showWarning={true}
            />
        </div>
    )
}
