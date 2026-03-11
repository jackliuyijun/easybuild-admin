'use client'

import { MultiSelect } from "@/components/custom/multi-select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import type { GoodsItem } from "@/types/goods"
import { getSpuDropdownList } from "@/api/spuConfig"
import { editSpu } from "@/api/goods"
import { showMessage } from "@/components/custom/notifications"

// SPU选项接口
interface SpuOption {
  label: string
  value: string
  spuValue: string
}

interface SelectedSpuValue {
  spuId: string
  spuName: string
  values: string[]
}

interface Props {
  initialData?: Partial<GoodsItem>
  onSubmit: (data: Partial<GoodsItem>) => Promise<void>
  loading?: boolean
  // 添加分类参数
  categoryCode?: {
    firstCategoryCode?: string
    secondCategoryCode?: string
    thirdCategoryCode?: string
  }
}

export function GoodsSpuConfig({
  initialData,
  onSubmit,
  loading,
  categoryCode
}: Props) {
  const [spuOptions, setSpuOptions] = useState<SpuOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSpuIds, setSelectedSpuIds] = useState<string[]>([])
  const [selectedSpuValues, setSelectedSpuValues] = useState<SelectedSpuValue[]>([])

  // 获取SPU下拉列表数据
  useEffect(() => {
    const fetchSpuOptions = async () => {
      try {
        setIsLoading(true)
        const data = await getSpuDropdownList({
          ...categoryCode,
          spuName: ''
        })

        setSpuOptions(data)

        // 如果有商品详情数据，处理回显
        if ((initialData as any)?.spuList?.length) {
          const selectedSpus = (initialData as any).spuList.map((spu: any) => {
            // 根据 spuName 找到对应的选项
            const option = data.find((opt: any) => opt.label === spu.spuName)
            if (!option) return null

            return {
              spuId: spu.spuName,
              spuName: spu.spuName,
              values: spu.spuValue.split(',')
            }
          }).filter(Boolean) as SelectedSpuValue[]

          setSelectedSpuIds(selectedSpus.map(spu => spu.spuId))
          setSelectedSpuValues(selectedSpus)
        }
      } catch (error) {
        console.error('获取规格列表失败:', error)
        showMessage({
          title: "获取规格列表失败",
          description: "请稍后重试",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpuOptions()
  }, [categoryCode?.firstCategoryCode, categoryCode?.secondCategoryCode, categoryCode?.thirdCategoryCode, initialData])

  // 处理SPU选择变化
  const handleSpuChange = (value: string) => {
    const newSelectedIds = [value]
    setSelectedSpuIds(newSelectedIds)

    const updatedValues = newSelectedIds.map(id => {
      const option = spuOptions.find(opt => opt.label === id)
      // 保留已有的规格值选择
      const existingValues = selectedSpuValues.find(v => v.spuId === id)?.values || []

      return {
        spuId: id,
        spuName: option?.label || '',
        values: existingValues
      }
    })

    setSelectedSpuValues(updatedValues)
  }

  // 处理规格值选择变化
  const handleValueChange = (spuId: string, value: string, checked: boolean) => {
    setSelectedSpuValues(prev => prev.map(item => {
      if (item.spuId === spuId) {
        return {
          ...item,
          values: checked
            ? [...item.values, value]
            : item.values.filter(v => v !== value)
        }
      }
      return item
    }))
  }

  // 新增：处理全选功能
  const handleSelectAll = (spuId: string, checked: boolean) => {
    setSelectedSpuValues(prev => prev.map(item => {
      if (item.spuId === spuId) {
        const option = spuOptions.find(opt => opt.label === spuId)
        const allValues = option?.value.split(',') || []
        return {
          ...item,
          values: checked ? allValues : []
        }
      }
      return item
    }))
  }

  // 处理表单提交
  const handleSubmit = async () => {
    if (!initialData?.goodsId) {
      showMessage({
        title: "错误",
        description: "商品ID不存在"
      })
      return
    }

    // 验证是否选择了规格和规格值
    if (selectedSpuValues.length === 0) {
      showMessage({
        title: "提示",
        description: "请选择商品规格",
      })
      return
    }

    // 验证每个规格是否选择了规格值
    const hasEmptyValues = selectedSpuValues.some(spu => spu.values.length === 0)
    if (hasEmptyValues) {
      showMessage({
        title: "提示",
        description: "请为每个规格选择至一个规格值",
      })
      return
    }

    try {
      // 构造提交数据
      const submitData = {
        goodsId: initialData.goodsId,
        spuList: selectedSpuValues.map(spu => ({
          spuName: spu.spuName,
          spuValue: spu.values.join(',')
        }))
      }

      // 调用编辑SPU接口
      await editSpu(submitData)

      // 调用父组件的 onSubmit，传递最新数据
      await onSubmit(submitData)
    } catch (error) {
      console.error('保存SPU配置失败:', error)
      showMessage({
        title: "保存失败",
        description: "保存SPU配置失败，请稍后重试"
      })
      throw error // 向上抛出错误，让父组件也感知到错误
    }
  }

  return (
    <form id="custom-form" onSubmit={(e) => {
      e.preventDefault()
      handleSubmit()
    }}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>选择规格</Label>
          <MultiSelect
            options={spuOptions.map(opt => ({
              label: opt.label,
              value: opt.label // 使用 label 作为 value
            }))}
            value={selectedSpuIds}
            onChange={handleSpuChange}
            placeholder="请选择商品规格"
            disabled={isLoading || !categoryCode?.firstCategoryCode}
          />
        </div>

        {selectedSpuValues.map(spu => {
          const option = spuOptions.find(opt => opt.label === spu.spuName)
          const values = option?.value.split(',') || []

          const isAllSelected = values.length > 0 && values.every(value =>
            spu.values.includes(value)
          )

          return (
            <Card key={spu.spuId}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">规格组：{spu.spuName}</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${spu.spuId}-all`}
                        checked={isAllSelected}
                        onCheckedChange={(checked) =>
                          handleSelectAll(spu.spuId, checked as boolean)
                        }
                      />
                      <Label htmlFor={`${spu.spuId}-all`}>全选</Label>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="grid grid-cols-4 gap-4">
                    {values.map(value => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${spu.spuId}-${value}`}
                          checked={spu.values.includes(value)}
                          onCheckedChange={(checked) =>
                            handleValueChange(spu.spuId, value, checked as boolean)
                          }
                        />
                        <Label htmlFor={`${spu.spuId}-${value}`}>{value}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </form>
  )
} 