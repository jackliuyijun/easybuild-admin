export interface CategoryValue {
    firstCategoryId?: string
    secondCategoryId?: string
    thirdCategoryId?: string
    firstCategoryName?: string
    secondCategoryName?: string
    thirdCategoryName?: string
}

export interface CategoryOption {
    value: string
    label: string
}

export interface CategoryOptions {
    first: CategoryOption[]
    second: CategoryOption[]
    third: CategoryOption[]
}

export interface CategorySelectorProps {
    /** 当前选中的值 */
    value?: CategoryValue

    /** 值变化回调 */
    onChange?: (value: CategoryValue) => void

    /** 分组代码，用于区分不同类型的分类（如商品分类 GOODS） */
    groupId?: string

    /** 占位符文本 */
    placeholder?: string

    /** 自定义样式类名 */
    className?: string

    /** 是否禁用 */
    disabled?: boolean

    /** 最大可选择级别，1=只能选一级, 2=最多选二级, 3=可选三级（默认3） */
    maxLevel?: 1 | 2 | 3

    /** 输入框宽度 */
    width?: string
}

export interface CategoryDialogProps {
    /** 弹框是否打开 */
    open: boolean

    /** 弹框开关状态变化回调 */
    onOpenChange: (open: boolean) => void

    /** 当前选中的分类 */
    value: CategoryValue

    /** 分类选项 */
    options: CategoryOptions

    /** 一级分类变化回调 */
    onFirstCategoryChange: (value: string) => void

    /** 二级分类变化回调 */
    onSecondCategoryChange: (value: string) => void

    /** 三级分类变化回调 */
    onThirdCategoryChange: (value: string) => void

    /** 分类搜索回调 */
    onCategorySearch: (keyword: string, level: 'first' | 'second' | 'third') => Promise<CategoryOption[]>

    /** 确认选择回调 */
    onConfirm: () => void

    /** 最大可选择级别 */
    maxLevel?: 1 | 2 | 3
}
