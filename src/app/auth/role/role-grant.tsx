'use client'

import { useEffect, useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { Role } from "@/types/role"
import { showMessage, showError, showWarning } from "@/components/custom/notifications"
import { cn } from "@/lib/utils"
import { Search, X, ChevronDown, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getRoleResources, saveRoleResources } from "@/api/role"

// 修改接口数据类型定义
interface ResourceItem {
    id: string
    name: string
    checked?: boolean
    children?: ResourceItem[]
}

interface RoleGrantProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    role?: Role
    onSubmit?: () => Promise<void>
}

export function RoleGrant({
    open,
    onOpenChange,
    role,
    onSubmit
}: RoleGrantProps) {
    const [loading, setLoading] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
    const [searchInput, setSearchInput] = useState("")
    const [searchKeyword, setSearchKeyword] = useState("")
    const [isMaximized, setIsMaximized] = useState(false)
    // 添加资源数据状态
    const [resources, setResources] = useState<ResourceItem[]>([])

    // 修改获取所有子节点ID的函数
    const getAllChildrenIds = useCallback((nodeId: string): string[] => {
        const findNode = (items: ResourceItem[]): ResourceItem | undefined => {
            for (const item of items) {
                if (item.id === nodeId) return item
                if (item.children) {
                    const found = findNode(item.children)
                    if (found) return found
                }
            }
        }

        const getChildIds = (node: ResourceItem): string[] => {
            const ids: string[] = []
            if (node.children) {
                node.children.forEach(child => {
                    ids.push(child.id)
                    if (child.children) {
                        ids.push(...getChildIds(child))
                    }
                })
            }
            return ids
        }

        const node = findNode(resources)
        return node ? getChildIds(node) : []
    }, [resources])

    // 修改 getParentIds 函数，递归获取所有层级的父节点
    const getParentIds = useCallback((id: string): string[] => {
        const parentIds: string[] = []

        // 递归查找所有父节点
        const findAllParents = (items: ResourceItem[], targetId: string) => {
            for (const item of items) {
                // 检查当前节点的直接子节点
                if (item.children?.some(child => child.id === targetId)) {
                    parentIds.push(item.id)
                    // 继续向上查找
                    return true
                }

                // 检查当前节点的所有子节点
                if (item.children) {
                    for (const child of item.children) {
                        // 检查子节点的子节点（权限）
                        if (child.children?.some(perm => perm.id === targetId)) {
                            parentIds.push(item.id)  // 添加顶级节点
                            parentIds.push(child.id) // 添加子模块节点
                            return true
                        }

                        // 递归检查子节点
                        if (findAllParents([child], targetId)) {
                            parentIds.push(item.id)
                            return true
                        }
                    }
                }
            }
            return false
        }

        findAllParents(resources, id)
        return parentIds
    }, [resources])

    // 修改获取角色权限的函数
    const fetchRolePermissions = useCallback(async (roleId: string | number) => {
        try {
            setLoading(true)
            const res = await getRoleResources(roleId)

            if (res.data) {
                setResources(res.data as any)

                // 处理选中状态
                const newSelectedIds = new Set<string>()
                const newExpandedIds = new Set<string>()

                // 只处理第一个资源的展开状态
                if ((res.data as any).length > 0) {
                    const firstResource = (res.data as any)[0]

                    // 递归处理第一个资源的所有层级
                    const processFirstResource = (node: ResourceItem) => {
                        // 将当前节点添加到展开集合中
                        newExpandedIds.add(node.id)
                        // 递归处理子节点
                        node.children?.forEach(processFirstResource)
                    }

                    // 从第一个资源开始递归处理
                    processFirstResource(firstResource)
                }

                // 处理所有节点的选中状态
                const processCheckedState = (node: ResourceItem) => {
                    if (node.checked) {
                        newSelectedIds.add(node.id)
                    }
                    node.children?.forEach(processCheckedState)
                }

                (res.data as any).forEach(processCheckedState)
                setSelectedIds(newSelectedIds)
                setExpandedIds(newExpandedIds)
            }
        } catch (error: any) {
            console.error('Failed to fetch role permissions:', error)
            setResources([])
            setSelectedIds(new Set())
            setExpandedIds(new Set())
        } finally {
            setLoading(false)
        }
    }, [])

    // 修改 handleCheckChange 函数中的父节点处理逻辑
    const handleCheckChange = useCallback((id: string, checked: boolean) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev)

            if (checked) {
                // 选中当前节点
                newSet.add(id)

                // 选中所有子节点
                const childrenIds = getAllChildrenIds(id)
                childrenIds.forEach(childId => newSet.add(childId))

                // 递归选中所有父节点
                const parentIds = getParentIds(id)
                parentIds.forEach(parentId => newSet.add(parentId))
            } else {
                // 取消当前节点
                newSet.delete(id)

                // 取消所有子节点
                const childrenIds = getAllChildrenIds(id)
                childrenIds.forEach(childId => newSet.delete(childId))

                // 归检查并更新所有父节点状态
                const updateParentStatus = (nodeId: string) => {
                    const parentIds = getParentIds(nodeId)

                    parentIds.forEach(parentId => {
                        // 获取该父节点的所有子节点（包括孙节点）
                        const allChildrenIds = getAllChildrenIds(parentId)

                        // 检查是否还有任何子节点被选中
                        const hasSelectedChildren = allChildrenIds.some(childId =>
                            childId !== nodeId && newSet.has(childId)
                        )

                        // 如果没有任何子节点被选中，取消父节点的��中状态并继续向上检查
                        if (!hasSelectedChildren) {
                            newSet.delete(parentId)
                            // 递归检查上层父节点
                            updateParentStatus(parentId)
                        }
                    })
                }

                // 开始递归检查父节点状态
                updateParentStatus(id)
            }

            return newSet
        })
    }, [getAllChildrenIds, getParentIds])

    // 处理展开/折叠
    const handleExpand = (id: string) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }

    // 修改搜索处理函数
    const handleSearch = useCallback((keyword: string) => {
        setSearchKeyword(keyword)

        if (!keyword.trim()) {
            return
        }

        const toExpand = new Set<string>()
        const lowerKeyword = keyword.toLowerCase()
        let found = false

        const searchNode = (node: ResourceItem) => {
            if (found) return

            if (node.name.toLowerCase().includes(lowerKeyword)) {
                toExpand.add(node.id)
                found = true
                return
            }

            node.children?.forEach(child => {
                if (found) return
                if (child.name.toLowerCase().includes(lowerKeyword)) {
                    toExpand.add(node.id)
                    toExpand.add(child.id)
                    found = true
                }
            })
        }

        resources.forEach(searchNode)

        // 使用 showWarning 显示顶部警告提示
        if (!found) {
            showWarning({
                title: "未找到匹配内容",
                description: `未找到包含 "${keyword}" 的相关权限`,
                duration: 3000,
            })
        } else {
            setExpandedIds(toExpand)
        }
    }, [resources])

    // 修改搜索框清空处理函数
    const handleSearchClear = () => {
        setSearchInput("")
        setSearchKeyword("") // 只清除搜索关键字，不改变展开状态
    }

    // 处理搜索框按键事件
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch(searchInput)
        }
    }

    // 修改初始化逻辑
    useEffect(() => {
        if (open && role?.roleId) {
            fetchRolePermissions(role.roleId)
            // 重置搜索状态
            setSearchInput("")
            setSearchKeyword("")
        } else {
            setSelectedIds(new Set())
            setExpandedIds(new Set())
            setSearchInput("")
            setSearchKeyword("")
        }
    }, [open, role?.roleId, fetchRolePermissions])

    // 修改 handleSubmit 函数
    const handleSubmit = async () => {
        if (!role) return

        try {
            setLoading(true)

            // 将 Set 转换为逗号分隔的字符串
            const resourceIds = Array.from(selectedIds).join(',')

            await saveRoleResources({
                id: role.roleId,
                resourceIds
            })

            showMessage({
                title: "保存成功",
                description: `角色"${role.roleName}"的权限已更新`
            })

            if (onSubmit) {
                await onSubmit()
            }
            onOpenChange(false)
        } catch (error: any) {
            showError({
                title: "保存失败",
                description: error.message || "请稍后重试"
            })
        } finally {
            setLoading(false)
        }
    }

    // 添加全部展开/折叠处理函数
    const handleExpandAll = useCallback(() => {
        const allIds = new Set<string>()

        // 递归收集所有可展开节点的ID
        const collectExpandableIds = (items: ResourceItem[]) => {
            items.forEach(item => {
                if (item.children && item.children.length > 0) {
                    allIds.add(item.id)
                    item.children.forEach(child => {
                        if (child.children && child.children.length > 0) {
                            allIds.add(child.id)
                        }
                    })
                }
            })
        }

        collectExpandableIds(resources)
        setExpandedIds(allIds)
    }, [resources])

    // 添加全部折叠处理函数
    const handleCollapseAll = useCallback(() => {
        setExpandedIds(new Set())
    }, [])

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            modal={true}
        >
            <DialogContent
                className={cn(
                    "flex flex-col p-0 gap-0 overflow-hidden border-none shadow-2xl transition-all duration-300",
                    isMaximized
                        ? "w-screen h-screen max-w-none rounded-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        : "max-w-[850px] w-[90vw] h-[85vh] rounded-xl"
                )}
                onPointerDownOutside={e => e.preventDefault()}
                onEscapeKeyDown={e => e.preventDefault()}
            >
                {/* 顶部标题栏 - 参照系统统一风格 */}
                <div className="flex-shrink-0 border-b">
                    <div className="px-6 flex items-center py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight">权限分配</DialogTitle>
                                <div className="text-sm text-muted-foreground mt-0.5">正在为角色【 <span className="text-primary font-medium">{role?.roleName}</span> 】配置资源访问权限</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 最大化按钮 - 位置参考 CustomDialog 控制在 right-11 对齐 */}
                <button
                    onClick={() => setIsMaximized(prev => !prev)}
                    className="absolute right-11 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    title={isMaximized ? "还原" : "最大化"}
                >
                    <div className="h-4 w-4 flex items-center justify-center">
                        {isMaximized ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><path d="M9 9h6v6H9z" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
                        )}
                    </div>
                </button>

                {/* 搜索与工具栏 */}
                <div className="px-6 py-4 bg-muted/30 flex items-center justify-between gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="搜索权限资源..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className="pl-9 pr-9 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20 transition-all h-10"
                        />
                        {searchInput && (
                            <button
                                onClick={handleSearchClear}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 hover:bg-accent rounded-full transition-all"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={expandedIds.size > 0 ? handleCollapseAll : handleExpandAll}
                        className="h-10 text-sm font-medium gap-2 px-4 border-muted-foreground/20 hover:bg-accent/50 transition-all rounded-lg"
                    >
                        {expandedIds.size > 0 ? (
                            <>
                                <ChevronDown className="h-4 w-4 rotate-180 transition-transform" />
                                全部收起
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                全部展开
                            </>
                        )}
                    </Button>
                </div>

                {/* 内容区域 - 树形结构优化 */}
                <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-custom bg-background/20">
                    <div className="space-y-4">
                        {resources.map((module) => (
                            <div
                                key={module.id}
                                className={cn(
                                    "rounded-xl border bg-card transition-all duration-200 overflow-hidden",
                                    expandedIds.has(module.id) ? "shadow-md ring-1 ring-primary/5" : "hover:border-primary/20"
                                )}
                            >
                                {/* 模块头部 */}
                                <div
                                    className={cn(
                                        "flex items-center px-4 py-3.5 cursor-pointer transition-colors select-none",
                                        expandedIds.has(module.id) ? "bg-primary/5" : "hover:bg-accent/30"
                                    )}
                                    onClick={() => handleExpand(module.id)}
                                >
                                    <div
                                        className="flex items-center gap-3 flex-1"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <Checkbox
                                            id={module.id}
                                            checked={selectedIds.has(module.id)}
                                            onCheckedChange={(checked) => handleCheckChange(module.id, checked as boolean)}
                                            className="w-5 h-5"
                                        />
                                        <label
                                            htmlFor={module.id}
                                            className="text-[15px] font-semibold cursor-pointer group flex items-center gap-2"
                                        >
                                            {module.name}
                                            {module.children && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-normal">
                                                    {module.children.length} 子项
                                                </span>
                                            )}
                                        </label>
                                    </div>
                                    <div className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                                        expandedIds.has(module.id) ? "bg-primary/10 text-primary rotate-180" : "text-muted-foreground hover:bg-accent"
                                    )}>
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>

                                {/* 子模块列表 */}
                                {module.children && (
                                    <div className={cn(
                                        "overflow-hidden transition-all duration-300 ease-in-out",
                                        expandedIds.has(module.id) ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                                    )}>
                                        <div className="px-4 pb-4 pt-1 space-y-4">
                                            {module.children.map((subModule) => (
                                                <div
                                                    key={subModule.id}
                                                    className="bg-accent/15 rounded-lg border border-border/40 p-3 space-y-3"
                                                >
                                                    {/* 子模块标题 */}
                                                    <div className="flex items-center justify-between">
                                                        <div
                                                            className="flex items-center gap-2.5"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            <Checkbox
                                                                id={subModule.id}
                                                                checked={selectedIds.has(subModule.id)}
                                                                onCheckedChange={(checked) => handleCheckChange(subModule.id, checked as boolean)}
                                                                className="w-4 h-4"
                                                            />
                                                            <label
                                                                htmlFor={subModule.id}
                                                                className="text-sm font-bold cursor-pointer hover:text-primary transition-colors"
                                                            >
                                                                {subModule.name}
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* 权限选项网格 - 取消折叠状态，始终显示 */}
                                                    {subModule.children && (
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                            {subModule.children.map((permission) => (
                                                                <div
                                                                    key={permission.id}
                                                                    className={cn(
                                                                        "flex items-center gap-2.5 p-2 rounded-md border border-transparent transition-all group",
                                                                        selectedIds.has(permission.id) ? "bg-primary/5 border-primary/20" : "hover:bg-background/80 hover:border-border"
                                                                    )}
                                                                >
                                                                    <Checkbox
                                                                        id={permission.id}
                                                                        checked={selectedIds.has(permission.id)}
                                                                        onCheckedChange={(checked) => handleCheckChange(permission.id, checked as boolean)}
                                                                        className="w-3.5 h-3.5 transition-transform active:scale-95"
                                                                    />
                                                                    <label
                                                                        htmlFor={permission.id}
                                                                        className={cn(
                                                                            "text-sm cursor-pointer transition-colors truncate",
                                                                            selectedIds.has(permission.id) ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground"
                                                                        )}
                                                                        title={permission.name}
                                                                    >
                                                                        {permission.name}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 底部按钮栏 */}
                <div className="p-6 bg-muted/20 border-t flex items-center justify-between gap-4">
                    <div className="hidden sm:flex flex-col">
                        <span className="text-xs text-muted-foreground">已选择资源</span>
                        <span className="text-sm font-semibold text-primary">{selectedIds.size} 个项目</span>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="px-6 h-10 border-muted-foreground/20 hover:bg-background transition-all"
                        >
                            取消配置
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 h-10 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all bg-primary hover:bg-primary/90"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>保存中...</span>
                                </div>
                            ) : (
                                "保存权限配置"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 