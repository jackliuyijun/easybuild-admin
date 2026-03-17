'use client'

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { cn } from "@/lib/utils"
import { GoodsBasicInfo } from "./steps/goods-basic-info"
import { GoodsSpuConfig } from "./steps/goods-spu-config"
import { GoodsSkuConfig } from "./steps/goods-sku-config"
import { GoodsDescription } from "./steps/goods-description"
import { GoodsDetail } from "./steps/goods-detail"
import type { GoodsItem } from "@/types/goods"
import { getDetail, editBasic, editSpu, editSku, editExplain, editDetail } from '@/api/goods'
import { CustomDialog } from "@/components/custom/custom-dialog"
import { Package2, Layers, Boxes, ScrollText, Image as ImageIcon, Package } from "lucide-react"

const iconMap: { [key: string]: any } = {
  Package2,
  Layers,
  Boxes,
  ScrollText,
  Image: ImageIcon,
  Package
}

const steps = [
  { title: "基本信息", description: "商品基础属性", required: true, icon: "Package2" },
  { title: "设置SPU", description: "配置SPU信息", required: false, icon: "Layers" },
  { title: "设置SKU", description: "配置SKU信息", required: false, icon: "Boxes" },
  { title: "设置说明", description: "添加商品说明", required: false, icon: "ScrollText" },
  { title: "设置详情", description: "编辑商品详情", required: true, icon: "Image" }
]

interface GoodsWizardProps {
  open: boolean
  onClose: () => void
  initialData?: GoodsItem
  onComplete?: () => void
}

export function GoodsWizard({ open, onClose, initialData, onComplete }: GoodsWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<GoodsItem>>(initialData || {})
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<any>(null)

  // 修改初始化数据加载
  useEffect(() => {
    const loadDetail = async () => {
      if (initialData?.goodsId) {
        try {
          setLoading(true)
          const detail = await getDetail(initialData.goodsId)
          // 确保在组件挂载状态下更新数据
          const detailData = (detail as any).data || detail
          setFormData(detailData)

          // 重置表单数据
          if (formRef.current) {
            formRef.current.form.reset(detailData)
          }
        } catch (error) {
          console.error('Failed to load goods detail:', error)
        } finally {
          setLoading(false)
        }
      } else {
        // 新增时重置表单数据
        setFormData({})
        if (formRef.current) {
          formRef.current.form.reset({})
        }
      }
    }

    if (open) {
      loadDetail()
    }
  }, [open, initialData?.goodsId])

  // 处理步骤切换
  const handleStepChange = (targetStep: number) => {
    if (loading) return

    // 保存当前表单数据
    if (formRef.current) {
      const currentValues = formRef.current.form.getValues()
      setFormData(prev => ({ ...prev, ...currentValues }))
    }

    setCurrentStep(targetStep)
  }

  // 修改完成编辑处函数
  const handleFinishBasic = async () => {
    if (loading || !formRef.current || isSubmitting) return

    try {
      setIsSubmitting(true)  // 立即设置提交状态
      // 获取当前表单数据
      const currentValues = formRef.current.form.getValues()

      // 验证表单
      const isValid = await formRef.current.form.trigger()
      if (!isValid) {
        setIsSubmitting(false)  // 如果验证失败，取消提交状态
        return
      }

      // 提交表单并标记为完成编辑
      await handleStepSubmit(currentValues, true)
    } catch (error) {
      console.error('Failed to finish basic edit:', error)
      setIsSubmitting(false)  // 发生错误时取消提交状态
    }
  }

  // 处理步骤提交
  const handleStepSubmit = async (data: Partial<GoodsItem>, isFinishEdit = false) => {
    if (loading || isSubmitting) return  // 如果正在加载或已经在提交中，直接返回

    try {
      setIsSubmitting(true)  // 设置提交状态

      // 处理所有数字类型字段
      const numberFields = [
        'skuType', 'saleType', 'distributionType', 'newFlag',
        'recommendFlag', 'usedFlag', 'surplusStock', 'sort',
        'salePrice', 'costPrice', 'marketPrice', 'initSaleCount'
      ]

      const formValues = { ...data } as any
      numberFields.forEach(fieldName => {
        if (formValues[fieldName] !== undefined && formValues[fieldName] !== '') {
          formValues[fieldName] = Number(formValues[fieldName])
        }
      })

      // 合并数据
      const submitData = {
        ...formValues,
        goodsId: initialData?.goodsId || ''
      }

      let response;

      // 根据不同步骤调用不同的接口
      switch (currentStep) {
        case 0:
          response = await editBasic(submitData)
          break
        case 1:
          response = await editSpu(submitData)
          break
        case 2:
          response = await editSku(submitData)
          break
        case 3:
          response = await editExplain(submitData)
          break
        case 4:
          response = await editDetail(submitData)
          break
      }

      // 更新表单数据
      if (response) {
        const updatedData = (response as any).data || response
        setFormData(prev => ({
          ...prev,
          ...updatedData
        }))
      }

      // 如果是完成编辑，直接关闭对话框
      if (isFinishEdit) {
        onComplete?.()
        onClose()
        return
      }

      // 否则继续正常的步骤流程
      if (currentStep === steps.length - 1) {
        onComplete?.()
        onClose()
      } else {
        // 如果是单规格商品且当前在第一步，直接跳到商品说明
        if (currentStep === 0 && formValues.skuType === 1) {
          setCurrentStep(3)
        } else {
          setCurrentStep(prev => prev + 1)
        }
      }
    } catch (error) {
      console.error('Failed to save step:', error)
      throw error  // 向上抛出错误，让调用者处理
    } finally {
      setIsSubmitting(false)  // 重置提交状态
    }
  }

  // 添加跳过处理函数
  const handleSkip = () => {
    if (loading || currentStep === steps.length - 1) return

    // 如果是单规格商品且当前在第一步，直接跳到商品说明
    if (formData.skuType === 1 && currentStep === 0) {
      setCurrentStep(3)
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <GoodsBasicInfo
            ref={formRef}
            initialData={formData}
            onSubmit={handleStepSubmit}
            loading={loading}
          />
        )
      case 1:
        return (
          <GoodsSpuConfig
            initialData={formData}
            onSubmit={handleStepSubmit}
            loading={loading}
          />
        )
      case 2:
        return (
          <GoodsSkuConfig
            initialData={formData}
            onSubmit={handleStepSubmit}
            loading={loading}
          />
        )
      case 3:
        return (
          <GoodsDescription
            initialData={formData}
            onSubmit={handleStepSubmit}
            loading={loading}
          />
        )
      case 4:
        return (
          <GoodsDetail
            initialData={formData}
            onSubmit={handleStepSubmit}
            loading={loading}
          />
        )
      default:
        return null
    }
  }

  return (
    <CustomDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !loading && !isSubmitting) {
          onClose()
        }
      }}
      maxWidth="5xl"
      style={{
        height: 'min(90vh, 900px)',
        minHeight: '500px'
      }}
      className="flex-1 overflow-auto"
      loading={loading}
      submitting={isSubmitting}
      header={
        <>
          <VisuallyHidden>
            <DialogTitle>商品{initialData ? '编辑' : '新增'}向导</DialogTitle>
          </VisuallyHidden>
          <div className="flex flex-col w-full">
            {/* 标题栏 - 紧凑化 */}
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-lg font-bold tracking-tight">
                  商品{initialData ? '编辑' : '新增'}向导 - {steps[currentStep].title}
                </DialogTitle>
                <div className="text-xs text-muted-foreground mt-0">
                  {initialData ? "在这里修改商品详细信息。" : "请按照步骤填写商品信息。"}
                </div>
              </div>
            </div>

            {/* 步骤导航 - 紧凑化 */}
            <div className="relative flex items-center justify-between w-full px-2 py-2 mt-1">
              {/* 背景连线 */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-[18px] z-0" />
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-primary transition-all duration-500 ease-in-out -translate-y-[18px] z-0"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((step, index) => {
                const isActive = currentStep === index
                const isCompleted = currentStep > index

                return (
                  <div
                    key={step.title}
                    className={cn(
                      "relative flex flex-col items-center gap-2 z-10 select-none cursor-pointer group",
                      "transition-all duration-300"
                    )}
                    onClick={() => handleStepChange(index)}
                  >
                    {/* 圆圈图标 */}
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 z-20",
                        isActive
                          ? "p-1.5 bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-110"
                          : isCompleted
                            ? "bg-background border-primary text-primary relative"
                            : "bg-background border-muted text-muted-foreground group-hover:border-muted-foreground/50"
                      )}
                    >
                      {isCompleted && (
                        <div className="absolute inset-0 bg-primary/10 rounded-full -z-10" />
                      )}
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[3px]" />
                      ) : (() => {
                        const IconComponent = iconMap[step.icon];
                        return IconComponent ? <IconComponent className="w-4 h-4" /> : <span className="text-sm font-bold">{index + 1}</span>
                      })()}
                    </div>

                    {/* 文字信息 */}
                    <div className="flex flex-col items-center text-center">
                      <div className={cn(
                        "text-xs font-medium transition-colors flex items-center gap-1",
                        isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.title}
                        {step.required && <span className="text-destructive text-[10px] ml-0.5">*</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="h-px bg-border mt-1 -mx-6 -mb-3" />
          </div>
        </>
      }
      footer={
        <div className="flex flex-col w-full">
          <div className="h-px bg-border -mt-3 mb-4 -mx-6" />
          <div className="flex justify-between items-center w-full">
            <Button
              variant="outline"
              size="lg"
              onClick={currentStep === 0 ? onClose : () => handleStepChange(currentStep - 1)}
              disabled={isSubmitting}
              className="px-8 border-muted-foreground/20 hover:bg-muted"
            >
              {currentStep === 0 ? "取消" : "上一步"}
            </Button>

            <div className="flex gap-3">
              {currentStep === 0 && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleFinishBasic}
                  disabled={loading || isSubmitting}
                  data-action="finish"
                  className="px-6"
                >
                  完成编辑
                </Button>
              )}
              {currentStep >= 1 && currentStep <= 3 && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleSkip}
                  disabled={loading || isSubmitting}
                  className="px-6 hover:bg-muted"
                >
                  跳过
                </Button>
              )}
              <Button
                type="submit"
                form="custom-form"
                size="lg"
                disabled={loading || isSubmitting}
                className="px-10 shadow-sm transition-all active:scale-95"
              >
                {currentStep === steps.length - 1 ? "完成" : "下一步"}
              </Button>
            </div>
          </div>
        </div>
      }
    >
      {renderStep()}
    </CustomDialog>
  )
} 