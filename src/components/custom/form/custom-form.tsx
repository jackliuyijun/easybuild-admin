import { usePreventAutofocus } from "@/hooks/use-prevent-autofocus"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form as UIForm } from "@/components/ui/form"
import { Layout } from './layout'
import { Field } from './field'
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"
import type { CustomFormProps, CustomFormRef } from './types'

// 处理字段值的函数
const processFieldValue = (value: any, type?: string) => {
  // 如果值为null或undefined，根据字段类型返回默认值
  if (value === null || value === undefined) {
    return type === 'number' ? 0 : ''
  }

  // 只在特定场景下进行类型转换
  if (type === 'number' && typeof value !== 'number') {
    return Number(value)
  }

  // 其他情况保持原始值
  return value
}

export const CustomForm = React.forwardRef<CustomFormRef, CustomFormProps>((props, ref) => {
  const [isInitializing, setIsInitializing] = React.useState(false)
  const isFirstMount = React.useRef(true)
  const lastInitialDataRef = React.useRef(props.initialData)
  const formContainerRef = React.useRef<HTMLDivElement>(null)

  const [updatingFields, setUpdatingFields] = React.useState<Set<string>>(new Set())

  // @ts-ignore - Zod resolver type compatibility issue between versions
  const form = useForm<any>({
    // @ts-ignore
    resolver: zodResolver(props.schema),
    defaultValues: props.defaultValues,
    mode: props.mode,
    criteriaMode: props.criteriaMode || "firstError",
    shouldUnregister: props.shouldUnregister
  })

  React.useImperativeHandle(ref, () => ({
    form,
    reset: () => form.reset(props.defaultValues)
  }), [form, props.defaultValues])

  const triggerFieldUpdate = React.useCallback((fieldNames: string[]) => {
    setUpdatingFields(prev => {
      const next = new Set(prev)
      fieldNames.forEach(name => next.add(name))
      return next
    })
  }, [])

  const handleFieldRendered = React.useCallback((fieldName: string) => {
    setUpdatingFields(prev => {
      const next = new Set(prev)
      next.delete(fieldName)
      return next
    })
  }, [])

  const handleSubmit = React.useCallback(async (data: any) => {
    try {
      await props.onSubmit(data)
    } catch (error) {
      if (props.onError) {
        props.onError(error)
      } else {
        console.error('Form submission error:', error)
      }
    }
  }, [props.onSubmit, props.onError])

  React.useEffect(() => {
    if (!props.onChange) return

    if (props.watchFields && props.watchFields.length > 0) {
      const subscription = form.watch((value, { name, type }) => {
        if (name && props.watchFields && props.watchFields.includes(name)) {
          const field = props.fields.find(f => f.name === name)
          const processedValue = processFieldValue(value[name], field?.type)
          props.onChange?.({ [name]: processedValue })
        }
      })

      return () => subscription.unsubscribe()
    }

    if (props.watchAll) {
      const subscription = form.watch((value) => {
        const processedValue = Object.entries(value).reduce((acc, [key, val]) => {
          const field = props.fields.find(f => f.name === key)
          acc[key] = processFieldValue(val, field?.type)
          return acc
        }, {} as Record<string, any>)
        props.onChange?.(processedValue)
      })

      return () => subscription.unsubscribe()
    }
  }, [form, props.onChange, props.watchFields, props.watchAll, props.fields])

  React.useEffect(() => {
    if (!isFirstMount.current &&
      JSON.stringify(lastInitialDataRef.current) === JSON.stringify(props.initialData)) {
      return
    }

    const initializeForm = async () => {
      try {
        setIsInitializing(true)
        const initialValues = props.initialData || props.defaultValues
        const processedValues = Object.entries(initialValues || {}).reduce((acc, [key, value]) => {
          const field = props.fields.find(f => f.name === key)
          acc[key] = processFieldValue(value, field?.type)
          return acc
        }, {} as Record<string, any>)

        await form.reset(processedValues)
        lastInitialDataRef.current = props.initialData
        props.onInitialized?.()
      } catch (error) {
        if (props.onError) {
          props.onError(error)
        } else {
          console.error('Form initialization error:', error)
        }
      } finally {
        setIsInitializing(false)
        isFirstMount.current = false
      }
    }

    initializeForm()
  }, [props.initialData, form, props.defaultValues, props.onInitialized, props.onError, props.fields])

  usePreventAutofocus()

  const renderField = React.useCallback((field: any) => {
    const shouldUpdate = updatingFields.has(field.name)

    return (
      <Field
        key={field.name}
        field={field}
        form={form}
        error={form.formState.errors[field.name]?.message as string}
        disabled={props.disabled || props.loading || isInitializing}
        onRendered={handleFieldRendered}
        forceUpdate={shouldUpdate}
      />
    )
  }, [
    form,
    props.disabled,
    props.loading,
    isInitializing,
    updatingFields,
    handleFieldRendered
  ])

  return (
    <div className="relative" ref={formContainerRef}>
      <UIForm {...form}>
        <form
          id={props.id}
          onSubmit={form.handleSubmit(handleSubmit)}
          className={cn(
            "w-full",
            props.className,
            (props.loading || isInitializing) && "pointer-events-none opacity-60"
          )}
          noValidate
          autoComplete={props.autoComplete || "off"}
        >
          <Layout {...props.layout}>
            {props.fields.map(renderField)}
          </Layout>
        </form>
      </UIForm>
    </div>
  )
})

CustomForm.displayName = 'CustomForm'
