'use client'

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import type { TableColumn } from "@/components/custom/table"
import { Plus, Search, RotateCw, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useCallback, useEffect } from "react"
import { getList, save, remove, toggleSaleFlag } from "@/api/goods"
import { useDebounce } from "@/hooks/use-debounce"
import { showMessage, showError } from '@/components/custom/notifications'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { DEFAULT_PAGE_SIZE } from "@/config/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { GoodsWizard } from "./goods-wizard"
import { cn } from "@/lib/utils"
import type { GoodsItem, GoodsQueryParams, GoodsListResponse } from "@/types/goods"
import { CategorySelector, CategoryValue } from "@/components/custom/category-selector"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePageTitle } from '@/store'

const CustomTable = dynamic(
    () => import('@/components/custom/table').then(mod => mod.CustomTable),
    { ssr: false }
)

export function GoodsPage() {
    const { setPageTitle } = usePageTitle();
    const [searchKeyword, setSearchKeyword] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [goods, setGoods] = useState<GoodsItem[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [editingGoods, setEditingGoods] = useState<GoodsItem | undefined>()
    const debouncedKeyword = useDebounce(searchKeyword, 800)
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        goods?: GoodsItem;
    }>({ open: false })
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [categoryValue, setCategoryValue] = useState<CategoryValue>({
        firstCategoryId: '',
        secondCategoryId: '',
        thirdCategoryId: ''
    })
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [needRefresh, setNeedRefresh] = useState(false)
    const [saleFlagFilter, setSaleFlagFilter] = useState<number | undefined>(undefined)
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        goods?: GoodsItem;
    }>({ open: false })

    const fetchGoods = useCallback(async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true)
            const res = await getList({
                page: currentPage,
                limit: pageSize,
                searchKeyWord: debouncedKeyword || undefined,
                firstCategoryId: categoryValue.firstCategoryId || undefined,
                secondCategoryId: categoryValue.secondCategoryId || undefined,
                thirdCategoryId: categoryValue.thirdCategoryId || undefined,
                saleFlag: saleFlagFilter
            })
            setGoods(res.data)
            setTotal(res.count)
        } catch (error) {
            // 错误处理
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, debouncedKeyword, pageSize, categoryValue, saleFlagFilter])

    useEffect(() => {
        setPageTitle('商品管理');
        fetchGoods()
    }, [setPageTitle, fetchGoods])

    const handleRefresh = () => {
        fetchGoods(true)
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

    const handleAdd = () => {
        setEditingGoods(undefined)
        setEditDialogOpen(true)
    }

    const handleEdit = (goods: GoodsItem) => {
        setEditingGoods(goods)
        setEditDialogOpen(true)
    }

    const handleSubmit = async (data: any) => {
        try {
            await save({
                ...(editingGoods?.goodsId ? { goodsId: editingGoods.goodsId } : {}),
                ...data
            })

            showMessage({
                title: `${editingGoods ? '编辑' : '新增'}成功`,
                description: `商品"${data.goodsName}"已${editingGoods ? '更新' : '创建'}`
            })

            fetchGoods(true)
            setEditDialogOpen(false)
        } catch (error: any) {
            showError({
                title: `${editingGoods ? '编辑' : '新增'}失败`,
                description: error.message || '请稍后重试'
            })
            throw error
        }
    }

    const handleDelete = (goods: GoodsItem) => {
        setDeleteDialog({
            open: true,
            goods
        })
    }

    const handleConfirmDelete = async () => {
        if (!deleteDialog.goods) return

        try {
            const ids = selectedIds.length > 0
                ? selectedIds.join(',')
                : deleteDialog.goods.goodsId

            await remove(ids)

            showMessage({
                title: "删除成功",
                description: "选中商品已删除"
            })

            setSelectedIds([])
            fetchGoods(true)
        } catch (error: any) {
            showError({
                title: "删除失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setDeleteDialog({ open: false })
        }
    }

    const handleSaleFlagChange = async (checked: boolean, goods: GoodsItem) => {
        setConfirmDialog({
            open: true,
            goods: {
                ...goods,
                saleFlag: checked ? 1 : 0
            }
        })
    }

    const handleConfirmToggle = async () => {
        if (!confirmDialog.goods) return

        try {
            const goodsIds = selectedIds.length > 0
                ? selectedIds.join(',')
                : confirmDialog.goods.goodsId

            await toggleSaleFlag({
                ids: goodsIds,
                value: confirmDialog.goods.saleFlag === 1 ? 1 : 0
            })

            showMessage({
                title: "状态更新成功",
                description: `${selectedIds.length > 0 ? '选中商品' : `商品"${confirmDialog.goods.goodsName}"`}已${confirmDialog.goods.saleFlag === 1 ? '上架' : '下架'}`
            })

            setSelectedIds([]) // 清空选中项
            fetchGoods(true)
        } catch (error: any) {
            showError({
                title: "状态更新失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setConfirmDialog({ open: false })
        }
    }

    const columns: TableColumn<GoodsItem>[] = [
        {
            key: 'selection' as keyof GoodsItem,
            title: (
                <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length < goods.length ? "indeterminate" : goods.length > 0 && selectedIds.length === goods.length}

                    onCheckedChange={(checked) => {
                        if (checked) {
                            setSelectedIds(goods.map(item => item.goodsId))
                        } else {
                            setSelectedIds([])
                        }
                    }}
                    aria-label="全选"
                />
            ) as any,
            width: 50,
            fixed: 'left',
            align: 'center',
            render: (_, record) => (
                <Checkbox
                    checked={selectedIds.includes(record.goodsId)}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            setSelectedIds(prev => [...prev, record.goodsId])
                        } else {
                            setSelectedIds(prev => prev.filter(id => id !== record.goodsId))
                        }
                    }}
                    aria-label={`选择${record.goodsName}`}
                />
            )
        },
        // {
        //     key: 'index' as keyof GoodsItem,
        //     title: '序号',
        //     width: 60,
        //     fixed: 'left',
        //     align: 'center',
        //     render: (_, __, index) => (currentPage - 1) * pageSize + index + 1
        // },
        {
            key: 'goodsName',
            title: '商品名称',
            width: 180,
            fixed: 'left',
            align: 'left'
        },
        {
            key: 'goodsNo',
            title: '商品编号',
            width: 120,
            align: 'center'
        },

        {
            key: 'salePrice',
            title: '销售价格',
            width: 100,
            align: 'center',
            render: (value) => {
                if (typeof value !== 'number') return '¥0.00'
                return `¥${value.toFixed(2)}`
            }
        },
        {
            key: 'surplusStock',
            title: '剩余库存',
            width: 100,
            align: 'center'
        },
        {
            key: 'firstCategoryName',
            title: '一级分类',
            width: 120,
            align: 'center'
        },
        {
            key: 'secondCategoryName',
            title: '二级分类',
            width: 120,
            align: 'center'
        },
        {
            key: 'thirdCategoryName',
            title: '三级分类',
            width: 120,
            align: 'center'
        },
        {
            key: 'brandName',
            title: '品牌',
            width: 120,
            align: 'center'
        },
        {
            key: 'saleFlag',
            title: '上架状态',
            width: 100,
            align: 'center',
            render: (value, record) => (
                <Switch
                    checked={value === 1}
                    onCheckedChange={(checked) => handleSaleFlagChange(checked, record)}
                    disabled={loading || refreshing}
                    aria-label={`${record.goodsName}上架状态`}
                />
            )
        },
        {
            key: 'action' as keyof GoodsItem,
            title: '操作',
            width: 80,
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(record)}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleDelete(record)}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    const handleCategoryChange = (value: CategoryValue) => {
        setCategoryValue(value)
        setCurrentPage(1)
        setSelectedIds([])
    }

    const handleOpenChange = (open: boolean) => {
        if (!open && needRefresh) {
            fetchGoods()
            setNeedRefresh(false)
        }
        setEditDialogOpen(open)
        if (!open) {
            setEditingGoods(undefined)
        }
    }

    const handleSaleFlagFilterChange = (value: string) => {
        setSaleFlagFilter(value === '-1' ? undefined : Number(value))
        setCurrentPage(1)
        setSelectedIds([])
    }

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

                        <div className="w-[160px]">
                            <Select value={saleFlagFilter?.toString() ?? '-1'} onValueChange={handleSaleFlagFilterChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="上架状态" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="-1">全部</SelectItem>
                                    <SelectItem value="1">已上架</SelectItem>
                                    <SelectItem value="0">待上架</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-[240px]">
                            <CategorySelector
                                value={categoryValue}
                                onChange={handleCategoryChange}
                                groupId="goods"
                                placeholder="选择分类..."
                                maxLevel={3}
                                width="240px"
                            />
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
                                        goods.find(d => d.goodsId === selectedIds[0])?.saleFlag === 1
                                            ? "text-yellow-500 hover:text-yellow-500"  // 下架时使用警告色
                                            : "text-green-500 hover:text-green-500"    // 上架时使用绿色
                                    )}
                                    onClick={() => {
                                        const firstGoods = goods.find(d => d.goodsId === selectedIds[0])
                                        const checked = firstGoods?.saleFlag !== 1
                                        handleSaleFlagChange(checked, {
                                            ...firstGoods!,
                                            goodsName: `选中的 ${selectedIds.length} 个商品`
                                        })
                                    }}
                                >
                                    批量{goods.find(d => d.goodsId === selectedIds[0])?.saleFlag === 1 ? '下架' : '上架'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-500"
                                    onClick={() => {
                                        setDeleteDialog({
                                            open: true,
                                            goods: {
                                                ...goods.find(d => d.goodsId === selectedIds[0])!,
                                                goodsName: `选中的 ${selectedIds.length} 个商品`
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
                                onClick={handleAdd}
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
                        data={goods}
                        columns={columns as any}
                        loading={loading}
                        rowKey="goodsId"
                        scroll={{
                            x: 1800,
                            y: 'calc(100vh - 300px)'
                        }}
                        className="h-full [&_td]:py-2"
                        emptyText="暂无商品数据"
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

            <GoodsWizard
                open={editDialogOpen}
                onClose={() => handleOpenChange(false)}
                initialData={editingGoods}
                onComplete={() => fetchGoods(true)}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setConfirmDialog(prev => ({ ...prev, goods: undefined }))
                        }, 200)
                    }
                }}
                title={`${confirmDialog.goods?.saleFlag === 1 ? '上架' : '下架'}确认`}
                description={`确定要${confirmDialog.goods?.saleFlag === 1 ? '上架' : '下架'}商品 "${confirmDialog.goods?.goodsName}" 吗？`}
                type={confirmDialog.goods?.saleFlag === 1 ? "success" : "warning"}
                confirmText={`确认${confirmDialog.goods?.saleFlag === 1 ? '上架' : '下架'}`}
                onConfirm={handleConfirmToggle}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteDialog(prev => ({ ...prev, open: false }))
                        setTimeout(() => {
                            setDeleteDialog(prev => ({ ...prev, goods: undefined }))
                        }, 200)
                    }
                }}
                title="删除确认"
                description={`确定要删除商品 "${deleteDialog.goods?.goodsName}" 吗？`}
                type="danger"
                confirmText="确认删除"
                onConfirm={handleConfirmDelete}
                showWarning={true}
            />
        </div>
    )
}
