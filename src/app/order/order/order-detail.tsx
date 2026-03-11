'use client'

import { useState, useEffect } from 'react'
import { getDetail } from '@/api/order'
import type { OrderInfo } from '@/types/order'
import {
  getOrderStatusConfig,
  getOrderTypeConfig,
  getOrderSourceConfig,
  getDispatchTypeConfig,
  getClientTypeConfig,
  getRefundStatusConfig
} from '@/types/order'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { showError } from '@/components/custom/notifications'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

interface OrderDetailProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function OrderDetail({ orderId, open, onOpenChange }: OrderDetailProps) {
  const [order, setOrder] = useState<OrderInfo | null>(null)
  const [loading, setLoading] = useState(false)

  // 获取订单详情
  const fetchOrderDetail = async () => {
    if (!orderId) return

    setLoading(true)
    try {
      const response = await getDetail({ id: orderId })
      if (response.data) {
        setOrder(response.data)
      }
    } catch (error: any) {
      console.error('Failed to fetch order detail:', error)
      showError({
        title: '获取订单详情失败',
        description: error.message || '请稍后重试'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetail()
    }
  }, [open, orderId])

  // 格式化金额
  const formatAmount = (amount: number | AmountInfo | undefined) => {
    if (amount === undefined) return '¥0.00'
    const value = typeof amount === 'object' ? amount.parsedValue : amount
    return `¥${Number(value || 0).toFixed(2)}`
  }

  // 格式化是否标志
  const formatFlag = (flag: number) => flag === 1 ? '是' : '否'

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!order) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>订单详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">基本信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">订单号:</span>
                    <span className="font-mono">{order.orderNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">订单状态:</span>
                    <Badge variant="outline" className={`border-${getOrderStatusConfig(order.orderStatus).color}-500`}>
                      {getOrderStatusConfig(order.orderStatus).label}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">订单类型:</span>
                    <Badge variant="secondary">{getOrderTypeConfig(order.orderType).label}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">订单来源:</span>
                    <Badge variant="outline">{getOrderSourceConfig(order.orderSource).label}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">配送方式:</span>
                    <Badge variant="outline">{getDispatchTypeConfig(order.dispatchType).label}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">下单日期:</span>
                    <span>{order.orderDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">下单时间:</span>
                    <span>{order.orderTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">客户端类型:</span>
                    <span>{getClientTypeConfig(order.clientType).label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">订单渠道:</span>
                    <span>{order.orderChannel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">是否推送:</span>
                    <span>{formatFlag(order.pushFlag)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 用户信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">用户信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">用户ID:</span>
                    <span>{order.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">手机号:</span>
                    <span>{order.userPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">第三方账号:</span>
                    <span>{order.userThirdAccount || '-'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">用户备注:</span>
                    <span className="text-right max-w-48 break-words">{order.userRemark || '-'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 商品信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">商品信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                {order.goodsPic && (
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={order.goodsPic}
                      alt={order.goodsName}
                    />
                    <AvatarFallback>
                      {order.goodsName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">商品名称:</span>
                    <span className="font-medium">{order.goodsName}</span>
                  </div>
                  {order.goodsSkuName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU名称:</span>
                      <span>{order.goodsSkuName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">商品数量:</span>
                    <span>{order.goodsCount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 金额信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">金额信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">订单总额:</span>
                    <span className="font-medium">{formatAmount(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">实付金额:</span>
                    <span className="font-medium text-green-600">{formatAmount(order.actualPayAmount || order.actualAmount)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">退款金额:</span>
                    <span className="font-medium text-red-600">{formatAmount(order.refundAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">退款状态:</span>
                    <Badge variant="outline">{getRefundStatusConfig(order.refundStatus).label}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 其他信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">其他信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">是否开票:</span>
                    <span>{formatFlag(order.invoiceFlag)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">退款申请:</span>
                    <span>{formatFlag(order.refundFlag)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">统计处理:</span>
                    <span>{formatFlag(order.statisticsFlag)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">商户ID:</span>
                    <span>{order.merchantId || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">商户名称:</span>
                    <span>{order.merchantName || '-'}</span>
                  </div>
                </div>
              </div>

              {/* 备注信息 */}
              <Separator className="my-4" />
              <div className="space-y-3">
                {order.orderRemark && (
                  <div>
                    <span className="text-muted-foreground text-sm">订单备注:</span>
                    <p className="mt-1 text-sm bg-muted p-2 rounded">{order.orderRemark}</p>
                  </div>
                )}
                {order.merchantRemark && (
                  <div>
                    <span className="text-muted-foreground text-sm">商户备注:</span>
                    <p className="mt-1 text-sm bg-muted p-2 rounded">{order.merchantRemark}</p>
                  </div>
                )}
                {order.tagRemark && (
                  <div>
                    <span className="text-muted-foreground text-sm">标签备注:</span>
                    <p className="mt-1 text-sm bg-muted p-2 rounded">{order.tagRemark}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 时间信息 */}
          {(order.createTime || order.updateTime) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">时间信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.createTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">创建时间:</span>
                      <span>{order.createTime}</span>
                    </div>
                  )}
                  {order.updateTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">更新时间:</span>
                      <span>{order.updateTime}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
