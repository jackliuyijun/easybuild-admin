import { ZodSchema } from "zod"
import { UseFormReturn } from "react-hook-form"
import type { ControllerRenderProps } from "react-hook-form"

// 错误消息位置
export type ErrorPosition = 'bottom' | 'right' | 'top' | 'custom'

// 字段类型
export type FieldType =
  | 'input'
  | 'select'
  | 'multiSelect'
  | 'textarea'
  | 'upload'
  | 'datePicker'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'slider'
  | 'rate'
  | 'cascader'
  | 'custom'   // 通用的自定义类型
  | 'text'
  | 'password'
  | 'number'
  | 'hidden'   // 隐藏字段类型

// 表单布局类型
export type LayoutType = 'grid' | 'vertical' | 'horizontal'

// 错误消息配置
export interface ErrorConfig {
  position?: ErrorPosition
  offset?: {
    x?: number
    y?: number
  }
  className?: string
  render?: (error: string) => React.ReactNode
}

// 字段布局配置
export interface FieldLayout {
  span?: 1 | 2 | 3 | 4
  offset?: 0 | 1 | 2 | 3
  labelAlign?: 'left' | 'right' | 'top'
  labelWidth?: number | string
}

// 字段选项配置
export interface FieldOptions {
  data?: Array<{ value: string | number, label: string }>
  remote?: boolean
  load?: (keyword?: string) => Promise<Array<{ value: string | number, label: string }>>
  searchable?: boolean
  debounce?: number
  multiple?: boolean
  cascade?: boolean  // 级联选择
  max?: number      // 多选最大数量
  min?: number      // 多选最小数量
}

// 自定义组件配置
export interface CustomComponent {
  type: 'custom'
  component: React.ComponentType<any>
  props?: Record<string, any>
}

// 字段配置
export interface FormField {
  name: string
  label?: string
  type: FieldType
  required?: boolean
  placeholder?: string
  className?: string
  disabled?: boolean | ((form: UseFormReturn) => boolean)
  readOnly?: boolean
  transform?: {
    input?: (value: any) => any
    output?: (value: any) => any
  }
  options?: Array<{
    label: string
    value: any
  }>
  // 自定义渲染相关
  render?: (field: ControllerRenderProps<any, string>, form: UseFormReturn) => React.ReactNode
  suffix?: React.ReactNode
  prefix?: React.ReactNode
  // 值变更时的回调
  onChange?: (value: any, form: UseFormReturn) => void // 字段值变更时的回调
  onSearch?: (keyword: string, form?: UseFormReturn) => Promise<Array<{ value: string, label: string }>> // 搜索回调
  searchDebounce?: number // 搜索防抖时间
  // 其他配置...
  error?: ErrorConfig
  multiple?: boolean
  popoverProps?: any
  // 扩展属性支持
  selectProps?: any
  inputProps?: any
  uploadProps?: any
  textareaProps?: any
  defaultValue?: any
}

// 字段属性
export interface FieldProps {
  field: FormField
  form: UseFormReturn
  error?: string
  disabled?: boolean
  forceUpdate?: boolean // 是否强制更新
  onRendered?: (fieldName: string) => void // 渲染完成回调
}

// 表单布局配置
export interface FormLayout {
  type?: LayoutType
  columns?: 1 | 2 | 3 | 4
  gutter?: {
    row?: number
    column?: number
  }
  labelAlign?: 'left' | 'right' | 'top'
  labelWidth?: number | string
}

// 增加表单引用类型
export interface CustomFormRef {
  form: UseFormReturn
  reset: () => void
}

// 表单属性
export interface CustomFormProps {
  id?: string
  schema: ZodSchema
  fields: FormField[]
  layout?: {
    className?: string
  }
  mode?: "onSubmit" | "onChange" | "onBlur" | "onTouched" | "all"
  criteriaMode?: "firstError" | "all"
  shouldUnregister?: boolean
  loading?: boolean
  disabled?: boolean
  autoComplete?: string
  className?: string
  defaultValues?: Record<string, any>
  initialData?: Record<string, any>
  onSubmit: (data: any) => Promise<void>
  onChange?: (data: any) => void
  onError?: (error: any) => void
  onInitialized?: () => void
  resetOnSubmit?: boolean // 是否在提交后重置表单，默认为 true
  watchFields?: string[]
  watchAll?: boolean
}
