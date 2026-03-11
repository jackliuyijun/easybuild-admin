'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"
import type { GoodsItem, GoodsExplanation } from "@/types/goods"
import { editExplain } from "@/api/goods"
import { showMessage } from "@/components/custom/notifications"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// 定义表单验证schema
const formSchema = z.object({
  explainList: z.array(z.object({
    explainName: z.string().min(1, "说明名称不能为空"),
    explainContent: z.string().min(1, "说明内容不能为空"),
    sort: z.number().min(1, "排序值必须大于0")
  })).min(1, "至少需要一条说明")
})

type FormValues = z.infer<typeof formSchema>

interface Props {
  initialData?: Partial<GoodsItem>
  onSubmit: (data: Partial<GoodsItem>) => Promise<void>
  loading?: boolean
}

export function GoodsDescription({ initialData, onSubmit, loading: parentLoading }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [explanations, setExplanations] = useState<GoodsExplanation[]>([
    { explainName: '', explainContent: '', sort: 1 }
  ])

  // 合并loading状态
  const loading = parentLoading || isSubmitting

  // 初始化 form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      explainList: explanations
    },
    mode: "onTouched"
  })

  useEffect(() => {
    if (initialData?.explainList?.length) {
      // 如果回显数据中没有sort字段，则添加默认值
      const sortedList = initialData.explainList.map((item, index) => ({
        ...item,
        sort: item.sort ?? index + 1
      }))
      setExplanations(sortedList)
      form.reset({ explainList: sortedList })
    }
  }, [initialData, form])

  const handleAddExplanation = () => {
    // 获取当前最大排序值
    const maxSort = Math.max(...explanations.map(exp => exp.sort || 0), 0)
    const newExplanations = [
      ...explanations,
      { explainName: '', explainContent: '', sort: maxSort + 1 }
    ]
    setExplanations(newExplanations)
    form.reset({ explainList: newExplanations })
  }

  const handleDeleteExplanation = (index: number) => {
    if (explanations.length === 1) return
    const newExplanations = explanations.filter((_, i) => i !== index)
    setExplanations(newExplanations)
    form.reset({ explainList: newExplanations })
  }

  const handleExplanationChange = (index: number, field: keyof GoodsExplanation, value: string | number) => {
    const newExplanations = [...explanations]
    newExplanations[index] = {
      ...newExplanations[index],
      [field]: field === 'sort' ? Number(value) : value
    }
    setExplanations(newExplanations)
    form.reset({ explainList: newExplanations })
  }

  // 处理表单提交
  const handleSubmit = async (values: FormValues) => {
    if (!initialData?.goodsId) {
      showMessage({
        title: "错误",
        description: "商品ID不存在"
      })
      return
    }

    try {
      setIsSubmitting(true)
      // 构造提交数据
      const submitData = {
        goodsId: initialData.goodsId,
        explainList: values.explainList
      }

      // 调用编辑说明接口
      await editExplain(submitData)

      // 调用父组件的 onSubmit，传递最新数据
      await onSubmit(submitData)
    } catch (error) {
      console.error('保存商品说明失败:', error)
      showMessage({
        title: "保存失败",
        description: "保存商品说明失败，请稍后重试"
      })
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form id="custom-form" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="space-y-4">
          {explanations.map((explanation, index) => (
            <Card key={index} className="w-full relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDeleteExplanation(index)}
                disabled={loading || explanations.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`explainList.${index}.explainName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          说明名称 <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="请输入说明名称"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              handleExplanationChange(index, 'explainName', e.target.value)
                            }}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`explainList.${index}.sort`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          排序 <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="请输入排序值"
                            {...field}
                            onChange={(e) => {
                              field.onChange(Number(e.target.value))
                              handleExplanationChange(index, 'sort', e.target.value)
                            }}
                            disabled={loading}
                            min={1}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`explainList.${index}.explainContent`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        说明内容 <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="请输入说明内容"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            handleExplanationChange(index, 'explainContent', e.target.value)
                          }}
                          disabled={loading}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddExplanation}
            disabled={loading}
            className="w-full"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            增加说明
          </Button>
        </div>
      </form>
    </Form>
  )
} 