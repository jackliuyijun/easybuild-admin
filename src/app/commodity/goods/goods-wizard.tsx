'use client'

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
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

const steps = [
  { title: "基本信息", description: "设置商品的基本属性", required: true },
  { title: "设置SPU", description: "配置商品SPU信息", required: false },
  { title: "设置SKU", description: "配置商品SKU信息", required: false },
  { title: "设置说明", description: "添加商品说明", required: false },
  { title: "设置详情", description: "编辑商品详", required: true }
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
      headerHeight="6.5rem"
      footerHeight="4rem"
      className="flex-1 overflow-auto"
      loading={loading}
      submitting={isSubmitting}
      header={
        <>
          <VisuallyHidden>
            <DialogTitle>商品{initialData ? '编辑' : '新增'}向导</DialogTitle>
          </VisuallyHidden>
          <div className="flex flex-col w-full">
            {/* 标题栏 */}
            <div className="h-[52px] flex items-center">
              <div className="leading-[32px] font-semibold">
                商品{initialData ? '编辑' : '新增'}向导 - {steps[currentStep].title}
              </div>
            </div>

            {/* 步骤导航 */}
            <div className="h-[52px] flex items-center gap-4 overflow-x-auto">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className={cn(
                    "flex items-center gap-2 py-1.5 px-3 rounded-md cursor-pointer select-none",
                    "transition-all duration-300 ease-in-out",
                    currentStep === index
                      ? "text-primary bg-muted/30"
                      : "hover:bg-muted/20"
                  )}
                  onClick={() => handleStepChange(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleStepChange(index)
                    }
                  }}
                  aria-current={currentStep === index ? 'step' : undefined}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium",
                      "transition-all duration-300 ease-in-out",
                      currentStep === index
                        ? "bg-primary text-primary-foreground scale-110"
                        : index < currentStep
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="font-medium text-sm flex items-center whitespace-nowrap">
                      {step.title}
                      {step.required && (
                        <span className="text-destructive text-[13px] ml-0.5">*</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      }
      footer={
        <div className="flex justify-between w-full">
          <Button
            variant="outline"
            size="lg"
            onClick={currentStep === 0 ? onClose : () => handleStepChange(currentStep - 1)}
            disabled={isSubmitting}
          >
            {currentStep === 0 ? "取消" : "上一步"}
          </Button>

          <div className="flex gap-2">
            {currentStep === 0 && (
              <Button
                variant="secondary"
                size="lg"
                onClick={handleFinishBasic}
                disabled={loading || isSubmitting}
                data-action="finish"
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
              >
                跳过
              </Button>
            )}
            <Button
              type="submit"
              form="custom-form"
              size="lg"
              disabled={loading || isSubmitting}
            >
              {currentStep === steps.length - 1 ? "完成" : "下一步"}
            </Button>
          </div>
        </div>
      }
    >
      {renderStep()}
    </CustomDialog>
  )
} 