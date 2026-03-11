'use client'

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { GoodsItem, GoodsSku } from "@/types/goods"
import { FileUpload } from "@/components/custom/file-upload"
import { cn } from "@/lib/utils"
import { editSku } from "@/api/goods"
import { showMessage } from "@/components/custom/notifications"

interface Props {
  initialData?: Partial<GoodsItem>
  onSubmit: (data: Partial<GoodsItem>) => Promise<void>
  loading?: boolean
}

export function GoodsSkuConfig({ initialData, onSubmit, loading }: Props) {
  const [skuList, setSkuList] = useState<GoodsSku[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 初始化数据
  useEffect(() => {
    if (initialData?.skuList?.length) {
      setSkuList(initialData.skuList)
    }
  }, [initialData])

  // 处理表单提交
  const handleSubmit = async () => {
    if (!initialData?.goodsId) {
      showMessage({
        title: "错误",
        description: "商品ID不存在"
      })
      return
    }

    // 验证数据
    let hasError = false
    const newErrors: Record<string, string> = {}

    skuList.forEach(sku => {
      // 验证销售价格
      if (sku.salePrice < 0) {
        newErrors[`${sku.goodsSkuId}-salePrice`] = '销售价格不能小于0'
        hasError = true
      }
      // 验证成本价格
      if (sku.costPrice < 0) {
        newErrors[`${sku.goodsSkuId}-costPrice`] = '成本价格不能小于0'
        hasError = true
      }
      // 验证库存
      if (sku.surplusStock < 0) {
        newErrors[`${sku.goodsSkuId}`] = '库存不能小于0'
        hasError = true
      }
    })

    if (hasError) {
      setErrors(newErrors)
      return
    }

    try {
      // 构造提交数据
      const submitData = {
        goodsId: initialData.goodsId,
        skuList: skuList.map(sku => ({
          goodsSkuId: sku.goodsSkuId,
          goodsSkuNo: sku.goodsSkuNo,
          salePrice: sku.salePrice,
          costPrice: sku.costPrice,
          surplusStock: sku.surplusStock,
          coverImg: sku.coverImg
        }))
      }

      // 调用编辑SKU接口
      await editSku(submitData as any)

      // 调用父组件的 onSubmit，传递最新数据
      await onSubmit(submitData as any)
    } catch (error) {
      console.error('保存SKU配置失败:', error)
      showMessage({
        title: "保存失败",
        description: "保存SKU配置失败，请稍后重试"
      })
      throw error
    }
  }

  const handleSkuNoChange = (id: string, value: string) => {
    setSkuList(prev => prev.map(sku =>
      sku.goodsSkuId === id ? { ...sku, goodsSkuNo: value } : sku
    ))
  }

  const handleStockChange = (id: string, value: string) => {
    const numValue = parseInt(value) || 0

    if (numValue < 0) {
      setErrors(prev => ({ ...prev, [id]: '库存不能小于0' }))
      return
    }

    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[id]
      return newErrors
    })

    setSkuList(prev => prev.map(sku =>
      sku.goodsSkuId === id ? { ...sku, surplusStock: numValue } : sku
    ))
  }

  const handlePriceChange = (id: string, field: 'salePrice' | 'costPrice', value: string) => {
    const numValue = parseFloat(value) || 0

    if (numValue < 0) {
      setErrors(prev => ({ ...prev, [`${id}-${field}`]: '价格不能小于0' }))
      return
    }

    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[`${id}-${field}`]
      return newErrors
    })

    setSkuList(prev => prev.map(sku =>
      sku.goodsSkuId === id ? { ...sku, [field]: numValue } : sku
    ))
  }

  const handleImageUpload = async (id: string, fileOrUrl: File | string) => {
    try {
      setSkuList(prev => prev.map(sku =>
        sku.goodsSkuId === id ? { ...sku, coverImg: typeof fileOrUrl === 'string' ? fileOrUrl : '' } : sku
      ))
    } catch (error) {
      console.error('图片上传失败:', error)
    }
  }

  const handleDelete = (id: string) => {
    setSkuList(prev => prev.filter(sku => sku.goodsSkuId !== id))
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[id]
      delete newErrors[`${id}-salePrice`]
      delete newErrors[`${id}-costPrice`]
      return newErrors
    })
  }

  return (
    <form id="custom-form" onSubmit={(e) => {
      e.preventDefault()
      handleSubmit()
    }}>
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">封面图</TableHead>
              <TableHead className="w-[200px]">SKU名称</TableHead>
              <TableHead className="w-[120px]">销售价格</TableHead>
              <TableHead className="w-[120px]">成本价格</TableHead>
              <TableHead className="w-[100px]">剩余库存</TableHead>
              <TableHead className="w-[40px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skuList.map((sku) => (
              <TableRow key={sku.goodsSkuId}>
                <TableCell className="w-[120px]">
                  <FileUpload
                    value={sku.coverImg}
                    onChange={(fileOrUrl) => handleImageUpload(sku.goodsSkuId, fileOrUrl)}
                    accept="image/*"
                    placeholder="上传图片"
                    preview
                    folder="goods"
                    onUploading={(uploading) => {
                      console.log('Upload status:', uploading)
                    }}
                    hideError
                    className="w-20 h-20"
                  />
                </TableCell>
                <TableCell className="w-[200px]">{sku.goodsSkuName}</TableCell>
                <TableCell className="w-[120px]">
                  <div className="space-y-1">
                    <Input
                      type="number"
                      value={sku.salePrice}
                      onChange={(e) => handlePriceChange(sku.goodsSkuId, 'salePrice', e.target.value)}
                      className={cn("w-full", errors[`${sku.goodsSkuId}-salePrice`] && "border-red-500")}
                      required
                      min={0}
                      step={0.01}
                    />
                    {errors[`${sku.goodsSkuId}-salePrice`] && (
                      <p className="text-xs text-red-500">{errors[`${sku.goodsSkuId}-salePrice`]}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="w-[120px]">
                  <div className="space-y-1">
                    <Input
                      type="number"
                      value={sku.costPrice}
                      onChange={(e) => handlePriceChange(sku.goodsSkuId, 'costPrice', e.target.value)}
                      className={cn("w-full", errors[`${sku.goodsSkuId}-costPrice`] && "border-red-500")}
                      required
                      min={0}
                      step={0.01}
                    />
                    {errors[`${sku.goodsSkuId}-costPrice`] && (
                      <p className="text-xs text-red-500">{errors[`${sku.goodsSkuId}-costPrice`]}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="w-[100px]">
                  <div className="space-y-1">
                    <Input
                      type="number"
                      value={sku.surplusStock}
                      onChange={(e) => handleStockChange(sku.goodsSkuId, e.target.value)}
                      className={cn("w-full", errors[sku.goodsSkuId] && "border-red-500")}
                      required
                      min={0}
                    />
                    {errors[sku.goodsSkuId] && (
                      <p className="text-xs text-red-500">{errors[sku.goodsSkuId]}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="w-[40px]">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(sku.goodsSkuId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </form>
  )
} 