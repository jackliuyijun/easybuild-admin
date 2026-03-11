export interface CategoryCascaderValue {
    firstCategoryId?: string
    secondCategoryId?: string
    thirdCategoryId?: string
    firstCategoryName?: string
    secondCategoryName?: string
    thirdCategoryName?: string
}

export interface CategoryCascaderOption {
    value: string
    label: string
}

export interface CategoryCascaderProps {
    /** 当前选中的值 */
    value?: CategoryCascaderValue

    /** 值变化回调 */
    onChange?: (value: CategoryCascaderValue) => void

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
