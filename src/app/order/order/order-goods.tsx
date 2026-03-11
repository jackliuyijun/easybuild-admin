'use client'

import { useState, useEffect } from 'react'
import { getOrderGoods } from '@/api/order'
import type { OrderGoods, AmountInfo } from '@/types/order'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { showError } from '@/components/custom/notifications'
import dynamic from 'next/dynamic'
import type { TableColumn } from '@/components/custom/table'
import { Package, Hash, Layers, ShoppingBag } from 'lucide-react'

const CustomTable = dynamic(
    () => import('@/components/custom/table').then(mod => mod.CustomTable),
    { ssr: false }
)

interface OrderGoodsProps {
    orderId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function OrderGoodsDialog({ orderId, open, onOpenChange }: OrderGoodsProps) {
    const [goodsList, setGoodsList] = useState<OrderGoods[]>([])
    const [loading, setLoading] = useState(false)

    const fetchOrderGoods = async () => {
        if (!orderId) return
        setLoading(true)
        try {
            const response = await getOrderGoods({ orderId }) as any
            const data = response.data || []
            setGoodsList(data)
        } catch (error: any) {
            console.error('Failed to fetch order goods:', error)
            showError({
                title: '获取订单商品失败',
                description: error.message || '请稍后重试'
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open && orderId) {
            fetchOrderGoods()
        } else if (!open) {
            setGoodsList([])
        }
    }, [open, orderId])

    // 格式化金额
    const getPrice = (price: number | AmountInfo | undefined) => {
        if (price === undefined) return 0
        return typeof price === 'object' ? price.parsedValue : price
    }

    const columns: TableColumn<any, any>[] = [
        {
            key: 'goodsPicUrl',
            title: '商品图片',
            width: 100,
            align: 'left',
            render: (value: any) => (
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary/30 flex items-center justify-center border border-border/50 group transition-all hover:border-primary/30">
                    {value ? (
                        <img src={value} alt="goods" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                        <Package className="w-6 h-6 text-muted-foreground/20" />
                    )}
                </div>
            )
        },
        {
            key: 'goodsName',
            title: '商品信息',
            width: 400,
            render: (_: any, record: OrderGoods) => (
                <div className="font-semibold text-sm leading-tight text-foreground line-clamp-2 py-2" title={record.goodsName}>
                    {record.goodsName}
                </div>
            )
        },
        {
            key: 'goodsPrice',
            title: '售价',
            width: 130,
            align: 'left',
            render: (value: any) => (
                <span className="text-sm font-bold font-mono">
                    <span className="text-xs mr-0.5 text-muted-foreground font-normal">¥</span>
                    {Number(getPrice(value)).toFixed(2)}
                </span>
            )
        },
        {
            key: 'goodsCount',
            title: '数量',
            width: 100,
            align: 'left',
            render: (value: number) => (
                <div className="inline-flex items-center justify-center min-w-[48px] px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold font-mono">
                    x{value}
                </div>
            )
        },
        {
            key: '小计',
            title: '小计',
            width: 150,
            align: 'left',
            render: (_: any, record: OrderGoods) => {
                const price = getPrice(record.goodsPrice)
                const count = record.goodsCount || 0
                return (
                    <span className="text-base font-black text-primary font-mono drop-shadow-sm">
                        <span className="text-sm mr-0.5 font-normal text-muted-foreground/60">¥</span>
                        {(Number(price) * Number(count)).toFixed(2)}
                    </span>
                )
            }
        }
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[600px] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="px-6 py-4 flex-none bg-muted/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold">订单商品清单</DialogTitle>
                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                                Total {goodsList.length} items
                            </div>
                        </div>
                    </div>
                </DialogHeader>
                <div className="flex-1 min-h-0 bg-background">
                    <CustomTable
                        config={{ rowHeight: 80, headerHeight: 48, footerHeight: 0 }}
                        data={goodsList}
                        columns={columns as any}
                        loading={loading}
                        rowKey="orderGoodsId"
                        className="h-full border-none"
                        emptyText="暂无商品数据"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
