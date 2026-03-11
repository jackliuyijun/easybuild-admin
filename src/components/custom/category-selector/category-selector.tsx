'use client'

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { getCategoryDropdownList } from "@/api/category"
import { CategoryDialog } from "./category-dialog"
import type { CategorySelectorProps, CategoryValue, CategoryOptions, CategoryOption } from "./types"

export function CategorySelector({
    value = {},
    onChange,
    groupId,
    placeholder = "选择分类...",
    className,
    disabled = false,
    maxLevel = 3,
    width = "240px"
}: CategorySelectorProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [tempValue, setTempValue] = useState<CategoryValue>({})
    const [categoryOptions, setCategoryOptions] = useState<CategoryOptions>({
        first: [],
        second: [],
        third: []
    })

    // 加载一级分类
    const loadFirstLevelCategories = useCallback(async () => {
        try {
            const options = await getCategoryDropdownList({
                level: 1,
                groupId
            })
            setCategoryOptions(prev => ({ ...prev, first: options }))
        } catch (error) {
            console.error('Failed to load first level categories:', error)
        }
    }, [groupId])

    // 加载二级分类
    const loadSecondLevelCategories = useCallback(async (parentId: string) => {
        if (!parentId) return
        try {
            const options = await getCategoryDropdownList({
                level: 2,
                parentId,
                groupId
            })
            setCategoryOptions(prev => ({ ...prev, second: options }))
        } catch (error) {
            console.error('Failed to load second level categories:', error)
        }
    }, [groupId])

    // 加载三级分类
    const loadThirdLevelCategories = useCallback(async (parentId: string) => {
        if (!parentId) return
        try {
            const options = await getCategoryDropdownList({
                level: 3,
                parentId,
                groupId
            })
            setCategoryOptions(prev => ({ ...prev, third: options }))
        } catch (error) {
            console.error('Failed to load third level categories:', error)
        }
    }, [groupId])

    // 搜索分类
    const handleCategorySearch = useCallback(async (keyword: string, level: 'first' | 'second' | 'third'): Promise<CategoryOption[]> => {
        let parentId: string | undefined

        if (level === 'second') {
            parentId = tempValue.firstCategoryId
        } else if (level === 'third') {
            parentId = tempValue.secondCategoryId
        }

        if ((level === 'second' && !parentId) || (level === 'third' && !parentId)) {
            return []
        }

        try {
            const data = await getCategoryDropdownList({
                name: keyword,
                level: level === 'first' ? 1 : level === 'second' ? 2 : 3,
                parentId,
                groupId
            })

            // 合并搜索结果到现有选项中
            setCategoryOptions(prev => ({
                ...prev,
                [level]: mergeOptions(prev[level], data)
            }))

            return data
        } catch (error) {
            console.error('Failed to search categories:', error)
            return []
        }
    }, [tempValue, groupId])

    // 合并选项（去重）
    const mergeOptions = (prevOptions: CategoryOption[], newOptions: CategoryOption[]): CategoryOption[] => {
        const merged = [...prevOptions]
        newOptions.forEach(item => {
            if (!merged.some(existing => existing.value === item.value)) {
                merged.push(item)
            }
        })
        return merged
    }

    // 初始化：加载一级分类
    useEffect(() => {
        loadFirstLevelCategories()
    }, [loadFirstLevelCategories])

    // 当传入的 value 变化时，加载对应的二级、三级分类（用于回显）
    useEffect(() => {
        if (value.firstCategoryId && categoryOptions.first.length > 0) {
            loadSecondLevelCategories(value.firstCategoryId)
        }
    }, [value.firstCategoryId, categoryOptions.first.length, loadSecondLevelCategories])

    useEffect(() => {
        if (value.secondCategoryId && categoryOptions.second.length > 0) {
            loadThirdLevelCategories(value.secondCategoryId)
        }
    }, [value.secondCategoryId, categoryOptions.second.length, loadThirdLevelCategories])

    // 打开弹框
    const handleOpenDialog = () => {
        if (disabled) return
        setTempValue(value)
        setDialogOpen(true)
    }

    // 一级分类变化
    const handleFirstCategoryChange = async (newValue: string) => {
        const selected = categoryOptions.first.find(opt => opt.value === newValue)
        const updates: CategoryValue = {
            firstCategoryId: newValue,
            firstCategoryName: selected?.label || '',
            secondCategoryId: '',
            secondCategoryName: '',
            thirdCategoryId: '',
            thirdCategoryName: ''
        }

        setCategoryOptions(prev => ({
            ...prev,
            second: [],
            third: []
        }))

        if (newValue) {
            await loadSecondLevelCategories(newValue)
        }

        setTempValue(updates)
    }

    // 二级分类变化
    const handleSecondCategoryChange = async (newValue: string) => {
        const selected = categoryOptions.second.find(opt => opt.value === newValue)
        const updates: CategoryValue = {
            ...tempValue,
            secondCategoryId: newValue,
            secondCategoryName: selected?.label || '',
            thirdCategoryId: '',
            thirdCategoryName: ''
        }

        setCategoryOptions(prev => ({
            ...prev,
            third: []
        }))

        if (newValue) {
            await loadThirdLevelCategories(newValue)
        }

        setTempValue(updates)
    }

    // 三级分类变化
    const handleThirdCategoryChange = (newValue: string) => {
        const selected = categoryOptions.third.find(opt => opt.value === newValue)
        setTempValue({
            ...tempValue,
            thirdCategoryId: newValue,
            thirdCategoryName: selected?.label || ''
        })
    }

    // 确认选择
    const handleConfirm = () => {
        onChange?.(tempValue)
        setDialogOpen(false)
    }

    // 清除选择
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        const clearedValue: CategoryValue = {
            firstCategoryId: '',
            firstCategoryName: '',
            secondCategoryId: '',
            secondCategoryName: '',
            thirdCategoryId: '',
            thirdCategoryName: ''
        }
        onChange?.(clearedValue)
        setTempValue(clearedValue)
        setCategoryOptions(prev => ({
            ...prev,
            second: [],
            third: []
        }))
    }

    // 获取显示文本（只显示最小级别的分类）
    const getDisplayText = (): string => {
        if (value.thirdCategoryId) {
            const third = categoryOptions.third.find(opt => opt.value === value.thirdCategoryId)
            return third?.label || ''
        }

        if (value.secondCategoryId) {
            const second = categoryOptions.second.find(opt => opt.value === value.secondCategoryId)
            return second?.label || ''
        }

        if (value.firstCategoryId) {
            const first = categoryOptions.first.find(opt => opt.value === value.firstCategoryId)
            return first?.label || ''
        }

        return ''
    }

    const displayText = getDisplayText()

    return (
        <>
            <div className={className} style={{ width }}>
                <div className="relative">
                    <Input
                        placeholder={placeholder}
                        value={displayText}
                        onClick={handleOpenDialog}
                        readOnly
                        disabled={disabled}
                        className="cursor-pointer pr-8"
                    />
                    {displayText && !disabled && (
                        <button
                            onClick={handleClear}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-sm opacity-70 hover:opacity-100 flex items-center justify-center"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            <CategoryDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                value={tempValue}
                options={categoryOptions}
                onFirstCategoryChange={handleFirstCategoryChange}
                onSecondCategoryChange={handleSecondCategoryChange}
                onThirdCategoryChange={handleThirdCategoryChange}
                onCategorySearch={handleCategorySearch}
                onConfirm={handleConfirm}
                maxLevel={maxLevel}
            />
        </>
    )
}
