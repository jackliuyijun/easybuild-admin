'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MultiSelect } from "@/components/custom/multi-select"
import type { CategoryDialogProps } from "./types"

export function CategoryDialog({
    open,
    onOpenChange,
    value,
    options,
    onFirstCategoryChange,
    onSecondCategoryChange,
    onThirdCategoryChange,
    onCategorySearch,
    onConfirm,
    maxLevel = 3
}: CategoryDialogProps) {
    const showSecondLevel = maxLevel >= 2
    const showThirdLevel = maxLevel >= 3

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>选择分类</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">一级分类</label>
                        <MultiSelect
                            value={value.firstCategoryId || ''}
                            onChange={onFirstCategoryChange}
                            options={options.first}
                            placeholder="选择一级分类"
                            multiple={false}
                            popoverProps={{
                                align: 'start',
                                className: 'w-full'
                            }}
                            onSearch={(keyword) => onCategorySearch(keyword, 'first')}
                            searchDebounce={800}
                        />
                    </div>

                    {showSecondLevel && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">二级分类</label>
                            <MultiSelect
                                value={value.secondCategoryId || ''}
                                onChange={onSecondCategoryChange}
                                options={options.second}
                                placeholder={value.firstCategoryId ? "选择二级分类" : "请先选择一级分类"}
                                multiple={false}
                                disabled={!value.firstCategoryId}
                                popoverProps={{
                                    align: 'start',
                                    className: 'w-full'
                                }}
                                onSearch={(keyword) => onCategorySearch(keyword, 'second')}
                                searchDebounce={800}
                            />
                        </div>
                    )}

                    {showThirdLevel && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">三级分类</label>
                            <MultiSelect
                                value={value.thirdCategoryId || ''}
                                onChange={onThirdCategoryChange}
                                options={options.third}
                                placeholder={value.secondCategoryId ? "选择三级分类" : "请先选择二级分类"}
                                multiple={false}
                                disabled={!value.secondCategoryId}
                                popoverProps={{
                                    align: 'start',
                                    className: 'w-full'
                                }}
                                onSearch={(keyword) => onCategorySearch(keyword, 'third')}
                                searchDebounce={800}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        取消
                    </Button>
                    <Button onClick={onConfirm}>
                        确定
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
