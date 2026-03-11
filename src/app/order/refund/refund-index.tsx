'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import type { TableColumn } from '@/components/custom/table'
import { Search, RotateCw, Eye, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { showMessage, showError } from '@/components/custom/notifications'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/custom/date-range-picker'
import { format } from 'date-fns'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { usePageTitle } from '@/store'
import { getRefundList } from '@/api/order'
import type { OrderRefund, OrderRefundQueryParams } from '@/types/order'
import {
  ORDER_REFUND_STATUS_OPTIONS,
  REFUND_TYPE_OPTIONS,
  REFUND_SOURCE_OPTIONS,
  getOrderRefundStatusConfig,
  getRefundTypeConfig,
  getRefundSourceConfig,
  getRefundChannelConfig
} from '@/types/order'
import { DEFAULT_PAGE_SIZE } from '@/config/pagination'

const CustomTable = dynamic(
  () => import('@/components/custom/table').then(mod => mod.CustomTable),
  { ssr: false }
)

export default function RefundPage() {
  const { setPageTitle } = usePageTitle()
  const [searchKeyWord, setSearchKeyWord] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [refunds, setRefunds] = useState<OrderRefund[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const debouncedKeyword = useDebounce(searchKeyWord, 800)
  const [refundStatus, setRefundStatus] = useState<string>('all')
  const [refundType, setRefundType] = useState<string>('all')
  const [startTime, setStartTime] = useState<Date>()
  const [endTime, setEndTime] = useState<Date>()
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // 设置页面标题
  useEffect(() => {
    setPageTitle('订单退款管理')
  }, [setPageTitle])

  const fetchRefunds = useCallback(async (isRefreshing = false) => {
    try {
      isRefreshing ? setRefreshing(true) : setLoading(true)
      const params: OrderRefundQueryParams = {
        page: currentPage,
        limit: pageSize,
        searchKeyWord: debouncedKeyword || undefined,
        refundStatus: refundStatus && refundStatus !== 'all' ? Number(refundStatus) : undefined,
        refundType: refundType && refundType !== 'all' ? Number(refundType) : undefined,
        startTime: startTime ? format(startTime, 'yyyy-MM-dd HH:mm:ss') : undefined,
        endTime: endTime ? format(endTime, 'yyyy-MM-dd HH:mm:ss') : undefined,
      }

      const response = await getRefundList(params) as any
      setRefunds(response.data.records || [])
      setTotal(response.data.total || 0)
    } catch (error: any) {
      console.error('Failed to fetch refunds:', error)
      showError({
        title: '获取退款列表失败',
        description: error.message || '请稍后重试'
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage, debouncedKeyword, refundStatus, refundType, startTime, endTime, pageSize])

  useEffect(() => {
    setPageTitle('订单退款管理')
    fetchRefunds()
  }, [setPageTitle, fetchRefunds])

  const handleRefresh = () => {
    fetchRefunds(true)
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
    setRefundStatus('all')
    setRefundType('all')
    setStartTime(undefined)
    setEndTime(undefined)
    setCurrentPage(1)
  }

  const handleViewDetail = (refundId: string) => {
    // TODO: 后续实现详情功能
    showMessage({
      title: '提示',
      description: '详情功能待实现'
    })
  }

  const columns: TableColumn<OrderRefund>[] = [
    {
      key: 'orderRefundNo',
      title: '退款单号',
      width: 160,
      fixed: 'left',
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'orderNo',
      title: '订单号',
      width: 160,
      render: (value) => (
        <span className="font-mono text-sm text-muted-foreground">{value}</span>
      )
    },
    {
      key: 'userPhone',
      title: '用户手机号',
      width: 110,
      align: 'center'
    },
    {
      key: 'refundAmount',
      title: '退款金额',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="font-medium text-red-600">¥{record.refundAmount.toFixed(2)}</div>
          {(record.refundFreightAmount > 0 || record.refundCreditAmount > 0 || record.refundCouponAmount > 0) && (
            <div className="text-xs text-muted-foreground">
              {record.refundFreightAmount > 0 && <div>运费: ¥{record.refundFreightAmount.toFixed(2)}</div>}
              {record.refundCreditAmount > 0 && <div>积分: ¥{record.refundCreditAmount.toFixed(2)}</div>}
              {record.refundCouponAmount > 0 && <div>优惠券: ¥{record.refundCouponAmount.toFixed(2)}</div>}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'refundType',
      title: '退款类型',
      width: 90,
      align: 'center',
      render: (_, record) => {
        const config = getRefundTypeConfig(record.refundType)
        return (
          <Badge variant="outline" className={`border-${config.color}-500 text-${config.color}-700`}>
            {config.label}
          </Badge>
        )
      }
    },
    {
      key: 'refundStatus',
      title: '退款状态',
      width: 90,
      align: 'center',
      render: (_, record) => {
        const config = getOrderRefundStatusConfig(record.refundStatus)
        return (
          <Badge variant="outline" className={`border-${config.color}-500 text-${config.color}-700`}>
            {config.label}
          </Badge>
        )
      }
    },

    {
      key: 'refundReason',
      title: '退款原因',
      width: 180,
      render: (value) => {
        const text = value ? String(value) : '-'
        return (
          <div className="truncate" title={text}>
            {text}
          </div>
        )
      }
    },
    {
      key: 'action' as any,
      title: '操作',
      width: 60,
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center">
          <Button variant="ghost" size="icon" onClick={() => handleViewDetail(record.orderRefundId)}><Eye className="h-4 w-4" /></Button>
        </div>
      )
    }
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-none">
        <div className="px-6 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索退款单号、订单号、用户手机号"
                value={searchKeyWord}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={refundStatus} onValueChange={setRefundStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="退款状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {ORDER_REFUND_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={refundType} onValueChange={setRefundType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="退款类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {REFUND_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">申请时间:</span>
              <DateRangePicker
                startDate={startTime}
                endDate={endTime}
                onRangeChange={(start, end) => {
                  setStartTime(start)
                  setEndTime(end)
                }}
                showTime={true}
                className="w-[320px]"
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

            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                重置
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0">
          <CustomTable
            config={{ rowHeight: 48, headerHeight: 48, footerHeight: 48 }}
            data={refunds}
            columns={columns as any}
            loading={loading}
            rowKey="orderRefundId"
            scroll={{
              x: 1500,
              y: 'calc(100vh - 300px)'
            }}
            className="h-full [&_td]:py-2"
            emptyText="暂无退款数据"
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
    </div>
  )
}

