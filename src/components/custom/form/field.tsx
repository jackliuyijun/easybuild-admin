import { FormControl, FormField as UIFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MultiSelect } from "@/components/custom/multi-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { FieldProps, FormField } from './types'
import type { ControllerRenderProps } from "react-hook-form"
import type { UseFormReturn } from "react-hook-form"
import { FileUpload } from "@/components/custom/file-upload"
import { Error } from './error'
import * as React from "react"

export const Field = React.memo(function Field({
  field,
  form,
  error,
  disabled,
  onRendered
}: FieldProps) {
  // 使用 useCallback 优化事件处理函数
  const handleFieldChange = React.useCallback((value: any) => {
    // 确保值为字符串类型
    const processedValue = value === null || value === undefined ? '' : String(value)

    // 先更新字段值
    form.setValue(field.name, processedValue, {
      shouldValidate: true
    })

    // 如果有自定义的 onChange，异步执行它
    if (field.onChange) {
      // 使用 queueMicrotask 确保在当前事件循环结束时执行
      queueMicrotask(() => {
        field.onChange?.(processedValue, form)
      })
    }
  }, [field, form])

  // 字段渲染完成后通知父组件
  React.useEffect(() => {
    onRendered?.(field.name)
  }, [field.name, onRendered])

  if (field.type === 'hidden') {
    return (
      <UIFormField
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormControl>
            {renderField(field, formField, disabled, form)}
          </FormControl>
        )}
      />
    )
  }

  return (
    <UIFormField
      control={form.control}
      name={field.name}
      render={({ field: formField }) => (
        <FormItem className={cn("relative h-[62px]", field.className)}>
          <div className="h-full space-y-0.5">
            <FormLabel>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </FormLabel>
            <FormControl>
              {renderField(
                field,
                {
                  ...formField,
                  onChange: handleFieldChange,
                  value: formField.value === null || formField.value === undefined ? '' : String(formField.value)
                },
                disabled || (typeof field.disabled === 'function' ? field.disabled(form) : field.disabled),
                form
              )}
            </FormControl>
          </div>
          <Error
            message={error}
            position={field.error?.position}
            offset={field.error?.offset}
            className={field.error?.className}
            render={field.error?.render}
          />
        </FormItem>
      )}
    />
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.field === nextProps.field &&
    prevProps.error === nextProps.error &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.form === nextProps.form &&
    !nextProps.forceUpdate
  )
})

function renderField(
  field: FormField,
  formField: ControllerRenderProps<any, string>,
  disabled?: boolean,
  form?: UseFormReturn<any>
) {
  if (field.render && form) {
    return field.render(formField, form)
  }

  if ((field.prefix || field.suffix)) {
    return (
      <div className="flex gap-2 items-start">
        {field.prefix}
        <div className="flex-1">
          {renderInputField(field, formField, disabled, form)}
        </div>
        {field.suffix}
      </div>
    )
  }

  return renderInputField(field, formField, disabled, form)
}

function renderInputField(
  field: FormField,
  formField: ControllerRenderProps<any, string>,
  disabled?: boolean,
  form?: UseFormReturn<any>
) {
  const processValue = (value: any) => {
    if (value === null || value === undefined) {
      return field.type === 'number' ? 0 : ''
    }
    return value
  }

  const value = processValue(formField.value)

  switch (field.type) {
    case 'text':
    case 'password':
      return (
        <Input
          {...formField}
          type={field.type}
          placeholder={field.placeholder}
          disabled={disabled}
          readOnly={field.readOnly}
          autoComplete="off"
          className={field.className}
          value={String(value)}
          onChange={(e) => formField.onChange(e.target.value)}
        />
      )
    case 'number':
      return (
        <Input
          {...formField}
          type="number"
          placeholder={field.placeholder}
          disabled={disabled}
          readOnly={field.readOnly}
          autoComplete="off"
          className={field.className}
          value={value}
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : Number(e.target.value)
            formField.onChange(val)
          }}
        />
      )
    case 'textarea':
      return (
        <Textarea
          {...formField}
          placeholder={field.placeholder}
          disabled={disabled}
          readOnly={field.readOnly}
          className={cn(
            "min-h-[38px] resize-none",
            field.className
          )}
          autoComplete="off"
          value={String(value)}
          onChange={(e) => formField.onChange(e.target.value)}
        />
      )
    case 'select':
      return (
        <Select
          defaultValue={field.defaultValue?.toString()}
          value={String(value)}
          onValueChange={(value) => {
            const option = field.options?.find(opt => String(opt.value) === value)
            if (option) {
              const val = field.type === 'number' ? Number(option.value) : option.value
              formField.onChange(val)
              if (field.onChange && form) {
                field.onChange(val, form)
              }
            }
          }}
          disabled={disabled || (typeof field.disabled === 'function' ? field.disabled(form!) : field.disabled)}
          {...field.selectProps}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case 'multiSelect':
      return (
        <MultiSelect
          {...formField}
          options={field.options || []}
          placeholder={field.placeholder}
          multiple={field.multiple}
          disabled={disabled || (typeof field.disabled === 'function' ? field.disabled(form!) : field.disabled)}
          onSearch={field.onSearch ? (keyword) => field.onSearch!(keyword, form) : undefined}
          searchDebounce={field.searchDebounce}
          value={String(value)}
          onChange={(value) => {
            form?.setValue(field.name, value, {
              shouldValidate: true
            })

            if (field.onChange) {
              queueMicrotask(() => {
                field.onChange?.(value, form!)
              })
            }
          }}
          {...field.popoverProps}
        />
      )
    case 'upload':
      return (
        <FileUpload
          {...formField}
          value={String(value)}
          onChange={(value) => {
            const processedValue = value === null || value === undefined ? '' : String(value)
            formField.onChange(processedValue)
            if (field.onChange && form) {
              field.onChange(processedValue, form)
            }
          }}
          {...field.uploadProps}
          maxLength={field.uploadProps?.maxCount || field.uploadProps?.maxLength}
          disabled={disabled}
        />
      )
    case 'hidden':
      return (
        <input
          type="hidden"
          {...formField}
          value={String(value)}
        />
      )
    case 'custom':
      return null
    default:
      return null
  }
}
