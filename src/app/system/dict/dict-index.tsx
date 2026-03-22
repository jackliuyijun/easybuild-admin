'use client'

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import type { TableColumn } from "@/components/custom/table"
import { Plus, Search, RotateCw, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
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
import { getDictList, saveDict, toggleDictForbiddenFlag, deleteDict } from "@/api/dict"
import type { Dict } from "@/types/dict"
import { useDebounce } from "@/hooks/use-debounce"
import { showMessage, showError } from '@/components/custom/notifications'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { FORBIDDEN_FLAG_CONFIG, FORBIDDEN_FLAG_OPTIONS, getForbiddenFlagConfig } from '@/config/forbidden-flag'
import { DictEdit } from "./dict-edit"
import { DEFAULT_PAGE_SIZE } from "@/config/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { DictDetail } from "./dict-detail"
import { Switch } from "@/components/ui/switch"
import { usePageTitle } from '@/store'

// 状态选项
const STATUS_OPTIONS = FORBIDDEN_FLAG_OPTIONS

// 动态导入表格组件
const CustomTable = dynamic(
    () => import('@/components/custom/table').then(mod => mod.CustomTable),
    { ssr: false }
)

export function DictPage() {
    const { setPageTitle } = usePageTitle();
    // 状态定义与 department 模块类似,只是变量名从 department 改为 dict
    const [searchKeyword, setSearchKeyword] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [dicts, setDicts] = useState<Dict[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingDict, setEditingDict] = useState<Dict | undefined>()
    const debouncedKeyword = useDebounce(searchKeyword, 800)
    const [forbiddenFlagFilter, setForbiddenFlagFilter] = useState<number | undefined>(undefined)
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        dict?: Dict;
    }>({ open: false })
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        dict?: Dict;
    }>({ open: false })
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [detailDialog, setDetailDialog] = useState<{
        open: boolean;
        dict?: Dict;
    }>({ open: false })

    // 获取字典列表
    const fetchDicts = useCallback(async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true)
            const res = await getDictList({
                page: currentPage,
                limit: pageSize,
                dictName: debouncedKeyword || undefined,
                forbiddenFlag: forbiddenFlagFilter
            }) as any
            setDicts(res.data)
            setTotal(res.count)
        } catch (error) {
            console.error('Failed to fetch dicts:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, debouncedKeyword, forbiddenFlagFilter, pageSize])

    // 处理函数定义 - 移到表格列配置之前
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(dicts.map(dict => dict.dictId))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelect = (dictId: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, dictId])
        } else {
            setSelectedIds(prev => prev.filter(id => id !== dictId))
        }
    }

    const handleForbiddenFlagChange = (value: number | undefined) => {
        setForbiddenFlagFilter(value)
        setCurrentPage(1)
        setSelectedIds([])
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
        setSelectedIds([])
    }

    const handleCreate = () => {
        setEditingDict(undefined)
        setDialogOpen(true)
    }

    const handleEdit = (dict: Dict) => {
        setEditingDict(dict)
        setDialogOpen(true)
    }

    const handleToggleForbiddenFlag = (dict: Dict) => {
        setConfirmDialog({
            open: true,
            dict
        })
    }

    const handleConfirmToggle = async () => {
        if (!confirmDialog.dict) return

        try {
            const dictIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : confirmDialog.dict.dictId

            const newForbiddenFlag = confirmDialog.dict.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                ? FORBIDDEN_FLAG_CONFIG.disable.value
                : FORBIDDEN_FLAG_CONFIG.enable.value

            await toggleDictForbiddenFlag({
                ids: dictIds,
                value: newForbiddenFlag
            })

            showMessage({
                title: "操作成功",
                description: `已${getForbiddenFlagConfig(newForbiddenFlag).actionText}选中字典`
            })

            setSelectedIds([])
            fetchDicts(true)
        } catch (error: any) {
            showError({
                title: "操作失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setConfirmDialog({ open: false })
        }
    }

    const handleDelete = (dict: Dict) => {
        setDeleteDialog({
            open: true,
            dict
        })
    }

    const handleConfirmDelete = async () => {
        if (!deleteDialog.dict) return

        try {
            const dictIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : deleteDialog.dict.dictId

            await deleteDict(dictIds)

            showMessage({
                title: "删除成功",
                description: "选中字典已删除"
            })

            setSelectedIds([])
            fetchDicts(true)
        } catch (error: any) {
            showError({
                title: "删除失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setDeleteDialog(prev => ({ ...prev, open: false }))
            setTimeout(() => {
                setDeleteDialog(prev => ({ ...prev, dict: undefined }))
            }, 200)
        }
    }

    const handleSubmit = async (data: {
        moduleName: string
        dictName: string
        dictCode: string
        dictDescribe: string
    }) => {
        try {
            await saveDict({
                ...(editingDict?.dictId ? { dictId: editingDict.dictId } : {}),
                ...data
            })

            showMessage({
                title: `${editingDict ? '编辑' : '新增'}成功`,
                description: `字典"${data.dictName}"已${editingDict ? '更新' : '创建'}`
            })

            fetchDicts(true)
        } catch (error: any) {
            showError({
                title: `${editingDict ? '编辑' : '新增'}失败`,
                description: error.message || '请稍后重试'
            })
            throw error
        }
    }

    // 添加这三个函数
    const handleRefresh = () => fetchDicts(true)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setSelectedIds([])
    }

    const handleSearch = (value: string) => {
        setSearchKeyword(value)
        setCurrentPage(1)
        setSelectedIds([])
    }

    const handleDetail = (dict: Dict) => {
        setDetailDialog({
            open: true,
            dict
        })
    }

    // 然后是表格列配置
    const columns: TableColumn<Dict>[] = [
        {
            key: 'selection' as any,
            title: (
                <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length < dicts.length ? "indeterminate" : dicts.length > 0 && selectedIds.length === dicts.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="全选"
                />
            ) as any,
            width: 20,
            //fixed: 'left',
            align: 'center',
            render: (_, record) => (
                <Checkbox
                    checked={selectedIds.includes(record.dictId)}
                    onCheckedChange={(checked) => handleSelect(record.dictId, checked as boolean)}
                    aria-label={`选择${record.dictName}`}
                />
            )
        },
        {
            key: 'moduleName',
            title: '模块名称',
            width: 80,
            align: 'left',
            render: (value) => (
                <span className="truncate" title={value as string}>
                    {value}
                </span>
            )
        },
        {
            key: 'dictName',
            title: '字典名称',
            width: 80,
            align: 'left',
            render: (value) => (
                <span className="truncate" title={value as string}>
                    {value}
                </span>
            )
        },
        {
            key: 'dictCode',
            title: '字典编码',
            width: 80,
            align: 'left',
            render: (value) => (
                <span className="truncate" title={value as string}>
                    {value}
                </span>
            )
        },
        {
            key: 'dictDescribe',
            title: '字典描述',
            width: 100,
            align: 'left',
            render: (value) => (
                <span className="truncate" title={value as string}>
                    {value || '-'}
                </span>
            )
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
            width: 140,
            align: 'center',
            render: (_, record) => (
                <div className="flex gap-2 justify-center">
                    <Button variant="ghost" size="icon" onClick={() => handleDetail(record)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(record)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(record)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </div>
            )
        }
    ]

    // useEffect 保持不变
    useEffect(() => {
        setPageTitle('字典管理');
        fetchDicts()
    }, [setPageTitle, fetchDicts])

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
                                        dicts.find(d => d.dictId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                                            ? "text-yellow-500 hover:text-yellow-500"
                                            : "text-green-500 hover:text-green-500"
                                    )}
                                    onClick={() => {
                                        const firstDict = dicts.find(d => d.dictId === selectedIds[0])
                                        setConfirmDialog({
                                            open: true,
                                            dict: {
                                                ...firstDict!,
                                                dictName: `选中的 ${selectedIds.length} 个字典`
                                            }
                                        })
                                    }}
                                >
                                    批量{dicts.find(d => d.dictId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value ? '禁用' : '启用'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-500"
                                    onClick={() => {
                                        setDeleteDialog({
                                            open: true,
                                            dict: {
                                                ...dicts.find(d => d.dictId === selectedIds[0])!,
                                                dictName: `选中的 ${selectedIds.length} 个字典`
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
                        data={dicts}
                        columns={columns as any}
                        loading={loading}
                        rowKey="dictId"
                        scroll={{
                            x: 1200,
                            y: 'calc(100vh - 300px)'
                        }}
                        className="h-full [&_td]:py-2"
                        emptyText="暂无字典数据"
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
            <DictEdit
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingDict={editingDict}
                onSubmit={handleSubmit}
                loading={loading}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setConfirmDialog(prev => ({ ...prev, dict: undefined }))
                        }, 200)
                    }
                }}
                title={getForbiddenFlagConfig(confirmDialog.dict?.forbiddenFlag).confirmTitle}
                description={`确定要${getForbiddenFlagConfig(confirmDialog.dict?.forbiddenFlag).actionText}字典 "${confirmDialog.dict?.dictName}" 吗？`}
                type={getForbiddenFlagConfig(confirmDialog.dict?.forbiddenFlag).confirmType as any}
                confirmText={getForbiddenFlagConfig(confirmDialog.dict?.forbiddenFlag).confirmText}
                onConfirm={handleConfirmToggle}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setDeleteDialog(prev => ({ ...prev, dict: undefined }))
                        }, 200)
                    }
                }}
                title="删除确认"
                description={`确定要删除字典 "${deleteDialog.dict?.dictName}" 吗？`}
                type="danger"
                confirmText="确认删除"
                onConfirm={handleConfirmDelete}
                showWarning={true}
            />

            <DictDetail
                open={detailDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setDetailDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setDetailDialog(prev => ({ ...prev, dict: undefined }))
                        }, 200)
                    }
                }}
                dict={detailDialog.dict}
            />
        </div>
    )
}
