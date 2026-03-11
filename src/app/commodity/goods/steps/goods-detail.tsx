'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { RichEditor } from "@/components/ui/rich-editor"
import type { GoodsItem } from "@/types/goods"
import { showMessage } from "@/components/custom/notifications"

// 修改表单验证 schema
const formSchema = z.object({
  content: z.string().min(1, "商品详情不能为空"),
})

interface Props {
  initialData?: Partial<GoodsItem>
  onSubmit: (data: Partial<GoodsItem>) => Promise<void>
  loading?: boolean
}

export function GoodsDetail({ initialData, onSubmit, loading }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: (initialData as any)?.detail?.content || "",
    },
  })

  // 处理表单提交
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!initialData?.goodsId) {
      showMessage({
        title: "错误",
        description: "商品ID不存在"
      })
      return
    }

    try {
      // 构造提交数据
      const submitData = {
        goodsId: initialData.goodsId,
        detail: {
          goodsId: initialData.goodsId,
          content: values.content
        }
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('保存商品详情失败:', error)
      showMessage({
        title: "保存失败",
        description: "保存商品详情失败，请稍后重试"
      })
      throw error
    }
  }

  // 只更新表单值，不触发提交
  const handleChange = (value: string) => {
    form.setValue('content', value, {
      shouldValidate: true,
      shouldDirty: true
    })
  }

  return (
    <Form {...form}>
      <form
        id="custom-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="h-full flex flex-col"
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col">
              <FormLabel className="text-base flex-shrink-0">
                商品详情
                <span className="ml-1 text-destructive">*</span>
              </FormLabel>
              <FormControl className="flex-1">
                <RichEditor
                  value={field.value}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="请输入商品详情描述..."
                  className="h-full"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
} 