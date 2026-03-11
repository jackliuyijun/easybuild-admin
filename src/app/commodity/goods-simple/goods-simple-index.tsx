'use client'

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import type { TableColumn } from "@/components/custom/table"
import { Plus, Search, RotateCw, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useCallback, useEffect, SetStateAction } from "react"
import { getList, remove, toggleSaleFlag } from "@/api/goods"
import { getMerchantDropdownList } from "@/api/merchant"
import { getCategoryDropdownList } from "@/api/category"
import { useDebounce } from "@/hooks/use-debounce"
import { showMessage, showError } from '@/components/custom/notifications'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { DEFAULT_PAGE_SIZE } from "@/config/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { GoodsSimpleEdit } from "./goods-simple-edit"
import { cn } from "@/lib/utils"
import type { GoodsItem } from "@/types/goods"
import { CategoryCascader, type CategoryCascaderValue } from "@/components/custom/category-cascader"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePageTitle } from '@/store'

const CustomTable = dynamic(
    () => import('@/components/custom/table').then(mod => mod.CustomTable),
    { ssr: false }
)

export function GoodsSimplePage() {
    const { setPageTitle } = usePageTitle();
    const [searchKeyword, setSearchKeyword] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [goods, setGoods] = useState<GoodsItem[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [editingGoods, setEditingGoods] = useState<GoodsItem | undefined>()
    const debouncedKeyword = useDebounce(searchKeyword, 800)
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; goods?: GoodsItem }>({ open: false })
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const [merchantIdFilter, setMerchantIdFilter] = useState<string>('all')
    const [categoryValue, setCategoryValue] = useState<CategoryCascaderValue>({})
    const [saleFlagFilter, setSaleFlagFilter] = useState<number | undefined>(undefined)

    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; goods?: GoodsItem }>({ open: false })

    const fetchGoods = useCallback(async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true)
            const res = await getList({
                page: currentPage,
                limit: pageSize,
                searchKeyWord: debouncedKeyword || undefined,
                merchantId: merchantIdFilter === 'all' ? undefined : merchantIdFilter,
                firstCategoryId: categoryValue.firstCategoryId || undefined,
                secondCategoryId: categoryValue.secondCategoryId || undefined,
                saleFlag: saleFlagFilter
            })
            setGoods(res.data)
            setTotal(res.count)
        } catch (error) {
            console.error("Failed to fetch goods:", error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [currentPage, debouncedKeyword, pageSize, merchantIdFilter, categoryValue.firstCategoryId, categoryValue.secondCategoryId, saleFlagFilter])

    useEffect(() => {
        setPageTitle('商品管理');
        fetchGoods()
    }, [setPageTitle, fetchGoods])

    // 加载超市下拉
    const [merchantOptions, setMerchantOptions] = useState<{ value: string; label: string }[]>([])
    useEffect(() => {
        const loadMerchants = async () => {
            try {
                const res = await getMerchantDropdownList() as any
                setMerchantOptions(res || [])
            } catch (error) {
                console.error("Failed to load merchants:", error)
            }
        }
        loadMerchants()
    }, [])


    const handleRefresh = () => fetchGoods(true)
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

    const handleDelete = (goods: GoodsItem) => setDeleteDialog({ open: true, goods })

    const handleConfirmDelete = async () => {
        if (!deleteDialog.goods) return
        try {
            const ids = selectedIds.length > 0 ? selectedIds.join(',') : deleteDialog.goods.goodsId
            await remove(ids)
            showMessage({ title: "删除成功", description: "选中商品已删除" })
            setSelectedIds([])
            fetchGoods(true)
        } catch (error: any) {
            showError({ title: "删除失败", description: error.message || "请稍后重试" })
        } finally {
            setDeleteDialog({ open: false })
        }
    }

    const handleSaleFlagChange = async (checked: boolean, goods: GoodsItem) => {
        setConfirmDialog({ open: true, goods: { ...goods, saleFlag: checked ? 1 : 0 } })
    }

    const handleConfirmToggle = async () => {
        if (!confirmDialog.goods) return
        try {
            const goodsIds = selectedIds.length > 0 ? selectedIds.join(',') : confirmDialog.goods.goodsId
            await toggleSaleFlag({ ids: goodsIds, value: confirmDialog.goods.saleFlag === 1 ? 1 : 0 })
            showMessage({
                title: "状态更新成功",
                description: `${selectedIds.length > 0 ? '选中商品' : `商品"${confirmDialog.goods.goodsName}"`}已${confirmDialog.goods.saleFlag === 1 ? '上架' : '下架'}`
            })
            setSelectedIds([])
            fetchGoods(true)
        } catch (error: any) {
            showError({ title: "状态更新失败", description: error.message || "请稍后重试" })
        } finally {
            setConfirmDialog({ open: false })
        }
    }

    const columns: TableColumn<GoodsItem>[] = [
        {
            key: 'selection' as any,
            title: (
                <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length < goods.length ? "indeterminate" : goods.length > 0 && selectedIds.length === goods.length}
                    onCheckedChange={(checked) => setSelectedIds(checked ? goods.map(item => item.goodsId) : [])}
                />
            ) as any,
            width: 50,
            align: 'center',
            render: (_, record) => (
                <Checkbox
                    checked={selectedIds.includes(record.goodsId)}
                    onCheckedChange={(checked) => setSelectedIds(prev => checked ? [...prev, record.goodsId] : prev.filter(id => id !== record.goodsId))}
                />
            )
        },
        {
            key: 'coverImg' as any,
            title: '封面',
            width: 100,
            align: 'center',
            render: (value: any) => (
                <div className="w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                    {value ? <img src={value} alt="cover" className="w-full h-full object-cover" /> : <div className="text-[10px] text-muted-foreground text-center leading-tight">暂无<br />图片</div>}
                </div>
            )
        },
        { key: 'goodsName', title: '商品名称', width: 200, align: 'center' },
        {
            key: 'salePrice',
            title: '价格',
            width: 100,
            align: 'center',
            render: (v) => `¥${Number(v || 0).toFixed(2)}`
        },
        { key: 'surplusStock', title: '库存', width: 100, align: 'center' },
        {
            key: 'saleFlag',
            title: '上架',
            width: 80,
            align: 'center',
            render: (v, record) => (
                <Switch checked={v === 1} onCheckedChange={(c) => handleSaleFlagChange(c, record)} />
            )
        },
        { key: 'firstCategoryName', title: '分类', width: 100, align: 'center' },
        { key: 'merchantName', title: '所属超市', width: 150, align: 'left' },
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
            <div className="flex-none px-6 py-3 flex items-center gap-4 flex-wrap">
                <div className="relative w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="商品名称/编码..." value={searchKeyword} onChange={(e) => handleSearch(e.target.value)} className="pl-9" />
                </div>

                <div className="w-[150px]">
                    <Select value={merchantIdFilter} onValueChange={setMerchantIdFilter}>
                        <SelectTrigger className="h-[40px]"><SelectValue placeholder="超市筛选" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部超市</SelectItem>
                            {merchantOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-[120px]">
                    <Select value={saleFlagFilter?.toString() ?? '-1'} onValueChange={(v) => setSaleFlagFilter(v === '-1' ? undefined : Number(v))}>
                        <SelectTrigger className="h-[40px]"><SelectValue placeholder="状态" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="-1">全部状态</SelectItem>
                            <SelectItem value="1">已上架</SelectItem>
                            <SelectItem value="0">待上架</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-[240px]">
                    <CategoryCascader
                        value={categoryValue}
                        onChange={(v: SetStateAction<CategoryCascaderValue>) => { setCategoryValue(v); setCurrentPage(1); }}
                        placeholder="选择分类"
                        maxLevel={1}
                        width="240px"
                    />
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                    className={cn(
                        "px-2 h-[40px] transition-all duration-300",
                        refreshing && "animate-spin"
                    )}
                >
                    <RotateCw className="h-4 w-4" />
                </Button>

                <div className="ml-auto flex gap-2">
                    <Button onClick={handleAdd} className="h-[40px]"><Plus className="h-4 w-4 mr-1" />新建</Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <CustomTable
                    config={{ rowHeight: 48, headerHeight: 48, footerHeight: 48 }}
                    data={goods}
                    columns={columns as any}
                    loading={loading}
                    rowKey="goodsId"
                    scroll={{ x: 1000, y: 'calc(100vh - 280px)' }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        onChange: handlePageChange,
                        onPageSizeChange: handlePageSizeChange
                    }}
                />
            </div>

            <GoodsSimpleEdit
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                initialData={editingGoods}
                onComplete={() => fetchGoods(true)}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(o) => setConfirmDialog(p => ({ ...p, open: o }))}
                title={`${confirmDialog.goods?.saleFlag === 1 ? '上架' : '下架'}确认`}
                description={`确定要${confirmDialog.goods?.saleFlag === 1 ? '上架' : '下架'}商品 "${confirmDialog.goods?.goodsName}" 吗？`}
                onConfirm={handleConfirmToggle}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(o) => setDeleteDialog(p => ({ ...p, open: o }))}
                title="删除确认"
                description={`确定要删除商品 "${deleteDialog.goods?.goodsName}" 吗？`}
                onConfirm={handleConfirmDelete}
                type="danger"
            />
        </div >
    )
}
