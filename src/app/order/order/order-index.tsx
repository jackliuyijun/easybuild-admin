'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import type { TableColumn } from '@/components/custom/table'
import { Search, RotateCw, Package, Calendar as CalendarIcon, MoreHorizontal, Truck, FileDown, ChevronUp, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { showMessage, showError } from '@/components/custom/notifications'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, startOfDay, endOfDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { DateRangePicker } from '@/components/custom/date-range-picker'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { usePageTitle, useSearchCollapse, useSearchArea } from '@/store'
import { getList } from '@/api/order'
import { getMerchantDropdownList } from '@/api/merchant'
import type { OrderInfo, OrderQueryParams, AmountInfo } from '@/types/order'
import {
  ORDER_STATUS_OPTIONS,
  getOrderStatusConfig,
  getDispatchTypeConfig
} from '@/types/order'
import { DEFAULT_PAGE_SIZE } from '@/config/pagination'

const CustomTable = dynamic(
  () => import('@/components/custom/table').then(mod => mod.CustomTable),
  { ssr: false }
)

const OrderGoods = dynamic(
  () => import('./order-goods'),
  { ssr: false }
)

export default function OrderPage() {
  const { setPageTitle } = usePageTitle()
  const [searchKeyWord, setSearchKeyWord] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [orders, setOrders] = useState<OrderInfo[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const debouncedKeyword = useDebounce(searchKeyWord, 800)
  const [orderStatus, setOrderStatus] = useState<string>('all')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [merchantId, setMerchantId] = useState<string>('all')
  const [merchants, setMerchants] = useState<{ value: string, label: string }[]>([])
  const { isSearchCollapsed, setIsSearchCollapsed } = useSearchCollapse()

  const { setHasSearchArea } = useSearchArea()

  // 设置页面标题和搜索区标记
  useEffect(() => {
    setPageTitle('订单管理')
    setHasSearchArea(true)
    setIsSearchCollapsed(true)
    return () => setHasSearchArea(false)
  }, [setPageTitle, setHasSearchArea, setIsSearchCollapsed])

  const fetchOrders = useCallback(async (isRefreshing = false) => {
    try {
      isRefreshing ? setRefreshing(true) : setLoading(true)
      const params: OrderQueryParams = {
        page: currentPage,
        limit: pageSize,
        searchKeyWord: debouncedKeyword || undefined,
        orderStatus: orderStatus && orderStatus !== 'all' ? Number(orderStatus) : undefined,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
        merchantId: merchantId !== 'all' ? merchantId : undefined,
      }

      const response = await getList(params) as any
      // 适配数据结构：优先取 response.data.records，如果 response.data 本身是数组，则直接使用
      const dataList = Array.isArray(response.data) ? response.data : (response.data?.records || [])
      setOrders(dataList)
      // 适配总量字段：优先取 response.count，其次 response.data.total
      setTotal(response.count || response.data?.total || dataList.length || 0)
    } catch (error: any) {
      console.error('Failed to fetch orders:', error)
      showError({
        title: '获取订单列表失败',
        description: error.message || '请稍后重试'
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage, debouncedKeyword, orderStatus, merchantId, startDate, endDate, pageSize])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])



  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const data = await getMerchantDropdownList()
        setMerchants(data)
      } catch (error) {
        console.error('Failed to fetch merchants:', error)
      }
    }
    fetchMerchants()
  }, [])

  const handleRefresh = () => {
    fetchOrders(true)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const handleSearch = (value: string) => {
    setSearchKeyWord(value)
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSearchKeyWord('')
    setOrderStatus('all')
    setStartDate(undefined)
    setEndDate(undefined)
    setMerchantId('all')
    setCurrentPage(1)
  }

  const handleViewDetail = (orderId: string) => {
    setSelectedOrderId(orderId)
    setDetailDialogOpen(true)
  }

  const columns: TableColumn<OrderInfo>[] = [
    {
      key: 'orderNo',
      title: '订单号',
      width: 180,
      fixed: 'left',
      render: (value) => <span>{String(value)}</span>
    },
    {
      key: 'userPhone',
      title: '用户手机号',
      width: 120,
      align: 'center'
    },
    {
      key: 'userName',
      title: '用户名称',
      width: 120,
      align: 'center'
    },
    {
      key: 'goodsName',
      title: '商品名称',
      width: 200,
      render: (_: string, record: OrderInfo) => (
        <div className="space-y-1">
          <div className="font-medium truncate" title={record.goodsName}>{record.goodsName}</div>
        </div>
      )
    },

    {
      key: 'totalAmount',
      title: '订单金额',
      width: 100,
      align: 'right',
      render: (_: number | AmountInfo, record: OrderInfo) => {
        const amount = typeof record.totalAmount === 'object'
          ? record.totalAmount.parsedValue
          : record.totalAmount
        return (
          <span className="font-medium">¥{Number(amount || 0).toFixed(2)}</span>
        )
      }
    },
    {
      key: 'orderStatus',
      title: '状态',
      width: 80,
      align: 'center',
      render: (_: number, record: OrderInfo) => {
        const config = getOrderStatusConfig(record.orderStatus)
        return (
          <Badge variant="outline" className={`border-${config.color}-500 text-${config.color}-700`}>
            {config.label}
          </Badge>
        )
      }
    },
    {
      key: 'orderDate',
      title: '下单日期',
      width: 120,
      align: 'center',
      render: (value) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      key: 'merchantName',
      title: '所属商户',
      width: 150,
      align: 'center',
      render: (value) => (
        <span className="text-sm">{value || '-'}</span>
      )
    },
    {
      key: 'action' as any,
      title: '操作',
      width: 60,
      fixed: 'right',
      align: 'center',
      render: (_: any, record: OrderInfo) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetail(record.orderId)}>
              <Package className="mr-2 h-4 w-4" />
              商品
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden relative">
      <div className="flex-none pr-16">
        <div className="px-6 py-3 space-y-3">
          {/* 第一行：始终显示 */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索订单号、手机号"
                value={searchKeyWord}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={orderStatus} onValueChange={setOrderStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="订单状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {ORDER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>



            <Select value={merchantId} onValueChange={setMerchantId}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="选择商户" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部商户</SelectItem>
                {merchants.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                重置
              </Button>
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
            </div>

            <div className="ml-auto flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Truck className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>批量发货</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <FileDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>导出发货单</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* 第二行：可折叠 */}
          <div className={cn(
            "flex items-center gap-4 flex-wrap transition-all duration-300 overflow-hidden",
            isSearchCollapsed ? "h-0 opacity-0 !mt-0" : "h-auto opacity-100"
          )}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">下单日期:</span>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onRangeChange={(start, end) => {
                  setStartDate(start)
                  setEndDate(end)
                }}
                showTime={false}
                className="w-[280px]"
              />
            </div>

          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0">
          <CustomTable
            config={{ rowHeight: 48, headerHeight: 48, footerHeight: 48 }}
            data={orders}
            columns={columns as any}
            loading={loading}
            rowKey="orderId"
            scroll={{
              x: 1300,
              y: 'calc(100vh - 300px)'
            }}
            className="h-full [&_td]:py-2"
            emptyText="暂无订单数据"
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

      {detailDialogOpen && (
        <OrderGoods
          orderId={selectedOrderId}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      )}
    </div>
  )
}
