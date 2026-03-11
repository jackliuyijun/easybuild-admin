'use client'

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, RotateCw, Search, ChevronDown, X, MoreHorizontal, Edit, Key, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import { Pagination } from "@/components/ui/pagination"
import { getEmployeeList, saveEmployee, toggleEmployeeForbiddenFlag, deleteEmployee } from "@/api/employee"
import type { Employee } from "@/types/employee"
import { useDebounce } from "@/hooks/use-debounce"
import { showMessage, showError } from '@/components/custom/notifications'
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { Input } from "@/components/ui/input"

import { getRoleSelectList } from "@/api/role"
import { MultiSelect } from "@/components/custom/multi-select"
import { FORBIDDEN_FLAG_CONFIG, FORBIDDEN_FLAG_OPTIONS, getForbiddenFlagConfig } from '@/config/forbidden-flag'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmployeeEdit } from "./emp-edit"
import { EditPwd } from "./emp-pwd"
import { DEFAULT_PAGE_SIZE } from "@/config/pagination"
import dynamic from 'next/dynamic'
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { usePageTitle } from '@/store'

// 动态导入表格组件，禁 SSR
const CustomTable = dynamic(
  () => import('@/components/custom/table').then(mod => mod.CustomTable),
  { ssr: false }
)

// 员工操作按钮组件 - 使用下拉菜单
function EmployeeActions({
  employee,
  onEdit,
  onDelete,
  onEditPwd
}: {
  employee: Employee
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
  onEditPwd: (employee: Employee) => void
}) {
  return (
    <div className="flex gap-2 justify-center">
      <Button variant="ghost" size="icon" onClick={() => onEdit(employee)}><Edit className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" onClick={() => onEditPwd(employee)}><Key className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete(employee)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
    </div>
  )
}

// 搜索组件
function EmployeeSearch({
  searchKeyword,
  selectedRoleIds,
  onSearch,
  onRoleChange,
  onForbiddenFlagChange,
  onRefresh,
  loading,
  refreshing,
  roleOptions
}: {
  searchKeyword: string
  selectedRoleIds: string
  onSearch: (value: string) => void
  onRoleChange: (value: string) => void
  onForbiddenFlagChange: (value: number | undefined) => void
  onRefresh: () => void
  loading: boolean
  refreshing: boolean
  roleOptions: Array<{ value: string | number; label: string }>
}) {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="relative w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="请输入关键字"
            value={searchKeyword}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="w-[360px]">
          <MultiSelect
            value={selectedRoleIds ? selectedRoleIds.split(',') : []}
            onChange={onRoleChange}
            options={roleOptions}
            placeholder="选择角色"
            className="min-w-[360px]"
            popoverProps={{
              align: 'start',
              className: 'w-[360px]'
            }}
            onSearch={async (keyword) => {
              const data = await getRoleSelectList({ name: keyword })
              return data
            }}
            searchDebounce={800}
          />
        </div>

        <div className="flex items-center gap-2">
          {FORBIDDEN_FLAG_OPTIONS.map((option) => (
            <Button
              key={option.label}
              variant={option.value === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => onForbiddenFlagChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={loading || refreshing}
          className={cn(
            "transition-all duration-300 ml-auto",
            refreshing && "animate-spin"
          )}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}


// 主页面组件
export function EmployeePage() {
  const { setPageTitle } = usePageTitle();
  // 搜索关键词状态
  const [searchKeyword, setSearchKeyword] = useState("")
  // 当前页码
  const [currentPage, setCurrentPage] = useState(1)
  // 员工列数据
  const [employees, setEmployees] = useState<Employee[]>([])
  // 总数
  const [total, setTotal] = useState(0)
  // 加载状态
  const [loading, setLoading] = useState(false)
  // 刷新状态
  const [refreshing, setRefreshing] = useState(false)
  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false)
  // 当前编辑的员工数据
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>()
  // 状态筛选
  const [forbiddenFlagFilter, setForbiddenFlagFilter] = useState<number | undefined>(undefined)
  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    employee?: Employee;
  }>({ open: false })
  // 删除确认对话框状态
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    employee?: Employee;
  }>({ open: false })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [formValid, setFormValid] = useState(false)
  const [roleOptions, setRoleOptions] = useState<Array<{
    value: string | number
    label: string
  }>>([])


  // 防抖处理搜索关键词
  const debouncedKeyword = useDebounce(searchKeyword, 800)


  // 修改角色筛选状态为字符串
  const [roles, setRoles] = useState<string>('')

  // 添加 pageSize 状态
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // 添加选中项管理状态
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // 修改 fetchEmployees 函数，使用 pageSize 状态
  const fetchEmployees = useCallback(async (isRefreshing = false) => {
    try {
      isRefreshing ? setRefreshing(true) : setLoading(true)
      const res = await getEmployeeList({
        page: currentPage,
        limit: pageSize,  // 使用 pageSize 替换 PAGE_SIZE
        searchKeyword: debouncedKeyword || undefined,
        forbiddenFlag: forbiddenFlagFilter,
        roles: roles.length > 0 ? roles : undefined
      }) as any
      // 适配数据结构：优先取 res.data.records，如果 res.data 本身是数组，则直接使用
      const dataList = Array.isArray(res.data) ? res.data : (res.data?.records || [])
      setEmployees(dataList)
      // 适配总量字段：优先取 res.count，其次 res.data.total
      setTotal(res.count || res.data?.total || dataList.length || 0)
    } catch (error) {
      console.error('Failed to fetch employees:', error)
      setEmployees([])
      setTotal(0)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage, debouncedKeyword, forbiddenFlagFilter, roles, pageSize])  // 添加 pageSize 依赖

  // 监听依赖变化
  useEffect(() => {
    setPageTitle('员工管理');
    fetchEmployees()
  }, [setPageTitle, fetchEmployees])

  // 处理刷新
  const handleRefresh = () => {
    fetchEmployees(true)
  }

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedIds([])  // 重置选中状态
  }

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value)
    setCurrentPage(1)
    setSelectedIds([])  // 重置选中状态
  }

  // 处理状态筛选变化
  const handleForbiddenFlagChange = (value: number | undefined) => {
    setForbiddenFlagFilter(value)
    setCurrentPage(1)
  }

  // 处理新建
  const handleCreate = () => {
    setEditingEmployee(undefined)
    setDialogOpen(true)
  }

  // 处理编辑
  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setDialogOpen(true)
  }

  // 处理状态切换
  const handleToggleForbiddenFlag = (employee: Employee) => {
    setConfirmDialog({
      open: true,
      employee
    })
  }

  // 处理删除
  const handleDelete = (employee: Employee) => {
    setDeleteDialog({
      open: true,
      employee
    })
  }

  // 处理提交
  const handleSubmit = async (data: any) => {
    try {
      setSubmitLoading(true)
      await saveEmployee({
        ...(editingEmployee?.employeeId ? { employeeId: String(editingEmployee.employeeId) } : {}),
        loginName: data.loginName,
        employeeCode: data.employeeCode,
        employeeName: data.employeeName,
        mobile: data.mobile || '',
        email: data.email || '',
        departmentId: data.departmentId || '',
        departmentName: data.departmentName || '',
        position: data.position || '',
        roles: data.roles || '',
        rolesName: data.rolesName || ''
      })

      showMessage({
        title: `${editingEmployee ? '编辑' : '新增'}成功`,
        description: `员工"${data.employeeName}"已${editingEmployee ? '更新' : '创建'}`
      })

      setDialogOpen(false)
      fetchEmployees(true)
    } catch (error: any) {
      showError({
        title: `${editingEmployee ? '编辑' : '新增'}失败`,
        description: error.message || '请稍后重试'
      })
      throw error
    } finally {
      setSubmitLoading(false)
    }
  }

  // 确认状态切换
  const handleConfirmToggle = async () => {
    if (!confirmDialog.employee) return

    try {
      const employeeIds = selectedIds.length > 0
        ? selectedIds.join(',')
        : confirmDialog.employee.employeeId

      const newForbiddenFlag = confirmDialog.employee.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
        ? FORBIDDEN_FLAG_CONFIG.disable.value
        : FORBIDDEN_FLAG_CONFIG.enable.value

      await toggleEmployeeForbiddenFlag({
        ids: String(employeeIds),
        value: newForbiddenFlag
      })

      showMessage({
        title: "操作成功",
        description: `已${getForbiddenFlagConfig(newForbiddenFlag).actionText}选中员工`
      })

      setSelectedIds([])
      fetchEmployees(true)
    } catch (error: any) {
      showError({
        title: "操作失败",
        description: error.message || "请稍后重试"
      })
    } finally {
      setConfirmDialog({ open: false })
    }
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deleteDialog.employee) return

    try {
      const employeeIds = selectedIds.length > 0
        ? selectedIds.join(',')
        : deleteDialog.employee.employeeId

      await deleteEmployee(String(employeeIds))

      showMessage({
        title: "删除成功",
        description: "选中员工已删除"
      })

      setSelectedIds([])
      fetchEmployees(true)
    } catch (error: any) {
      showError({
        title: "删除失败",
        description: error.message || "请稍后重试"
      })
    } finally {
      setDeleteDialog(prev => ({ ...prev, open: false }))
      setTimeout(() => {
        setDeleteDialog(prev => ({ ...prev, employee: undefined }))
      }, 200)
    }
  }





  // 修改角色变处理函数
  const handleRoleChange = (value: string) => {
    setRoles(value)
    setCurrentPage(1)
    setSelectedIds([])  // 重置选中状态
  }

  // 修改获取角色列表的方法
  const fetchRoleOptions = useCallback(async () => {
    try {
      const data = await getRoleSelectList()
      if (Array.isArray(data)) {
        setRoleOptions(data)
      } else {
        console.error('Invalid role options data:', data)
        setRoleOptions([])
      }
    } catch (error) {
      console.error('Failed to fetch role options:', error)
      setRoleOptions([])
    }
  }, [])

  // 确保在组件挂载时获取角色列表
  useEffect(() => {
    fetchRoleOptions()
  }, [fetchRoleOptions])

  // 处理修改密码
  const [pwdDialog, setPwdDialog] = useState<{
    open: boolean;
    employee?: Employee;
  }>({ open: false })

  const handleEditPwd = (employee: Employee) => {
    setPwdDialog({
      open: true,
      employee
    })
  }

  // 添加处理每页条数变化的函数
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // 重置到第一页
  }

  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(employees.map(emp => String(emp.employeeId)))
    } else {
      setSelectedIds([])
    }
  }

  // 处理单个选择
  const handleSelect = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, employeeId])
    } else {
      setSelectedIds(prev => prev.filter(id => id !== employeeId))
    }
  }

  // 定义表格列配置
  const columns: any[] = [
    {
      key: 'selection',
      title: (
        <Checkbox
          checked={selectedIds.length > 0 && selectedIds.length < employees.length ? "indeterminate" : employees.length > 0 && selectedIds.length === employees.length}
          onCheckedChange={handleSelectAll}
          aria-label="全选"
        />
      ),
      width: 40,
      //fixed: 'left',
      align: 'center',
      render: (_: any, record: any) => (
        <Checkbox
          checked={selectedIds.includes(record.employeeId)}
          onCheckedChange={(checked: any) => handleSelect(record.employeeId, checked)}
          aria-label={`选择${record.employeeName}`}
        />
      )
    },
    {
      key: 'loginName',
      title: '登录名',
      // fixed: 'left',
      width: 120,
      align: 'left',
      render: (value: any) => (
        <span className="truncate" title={value}>
          {value}
        </span>
      )
    },
    {
      key: 'employeeCode',
      title: '工号',
      width: 120,
      render: (value: any) => (
        <span className="truncate" title={value}>
          {value}
        </span>
      )
    },
    {
      key: 'employeeName',
      title: '姓名',
      width: 120,
      align: 'left',
      render: (value: any) => (
        <span className="truncate" title={value}>
          {value}
        </span>
      )
    },
    {
      key: 'rolesName',
      title: '角色',
      width: 150,
      align: 'left',
      render: (value: any) => (
        <span className="whitespace-normal break-words">
          {value}
        </span>
      )
    },

    {
      key: 'forbiddenFlag',
      title: '状态',
      width: 100,
      align: 'center',
      render: (_: any, record: any) => {
        const isEnabled = record.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value;
        return (
          <Switch
            checked={isEnabled}
            onCheckedChange={() => handleToggleForbiddenFlag(record)}
          />
        )
      }
    },
    {
      key: 'action',
      title: '操作',
      width: 140,
      align: 'center',
      render: (_: any, record: any) => (
        <EmployeeActions
          employee={record}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onEditPwd={handleEditPwd}
        />
      )
    }
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-none">
        <div className="px-6 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="输入关键字搜索..."
                value={searchKeyword}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>



            <div className="flex items-center gap-2">
              {FORBIDDEN_FLAG_OPTIONS.map((option) => (
                <Button
                  key={option.label}
                  variant={option.value === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleForbiddenFlagChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className={cn(
                "px-2 transition-all duration-300",
                refreshing && "animate-spin"
              )}
            >
              <RotateCw className="h-4 w-4" />
            </Button>

            {selectedIds.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    employees.find(d => d.employeeId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value
                      ? "text-yellow-500 hover:text-yellow-500"
                      : "text-green-500 hover:text-green-500"
                  )}
                  onClick={() => {
                    const firstEmployee = employees.find(d => d.employeeId === selectedIds[0])
                    setConfirmDialog({
                      open: true,
                      employee: {
                        ...firstEmployee!,
                        employeeName: `选中的 ${selectedIds.length} 个员工`
                      }
                    })
                  }}
                >
                  批量{employees.find(d => d.employeeId === selectedIds[0])?.forbiddenFlag === FORBIDDEN_FLAG_CONFIG.enable.value ? '禁用' : '启用'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-500"
                  onClick={() => {
                    setDeleteDialog({
                      open: true,
                      employee: {
                        ...employees.find(d => d.employeeId === selectedIds[0])!,
                        employeeName: `选中的 ${selectedIds.length} 个员工`
                      }
                    })
                  }}
                >
                  批量删除
                </Button>
              </>
            )}

            <div className="ml-auto flex gap-2">
              <Button
                className="flex items-center gap-1"
                onClick={handleCreate}
              >
                <Plus className="h-4 w-4" />
                新建
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0">
          <CustomTable
            config={{ rowHeight: 48, headerHeight: 48, footerHeight: 48 }}
            data={employees}
            columns={columns as any}
            loading={loading}
            rowKey="employeeId"
            scroll={{
              x: 1520,
              y: 'calc(100vh - 300px)'
            }}
            className="h-full [&_td]:py-2"
            emptyText="暂无员工数据"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange
            }}
          />
        </div>
      </div>

      {/* 编辑对话框 */}
      <EmployeeEdit
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingEmployee={editingEmployee}
        onSubmit={handleSubmit}
        loading={submitLoading}
        roleOptions={roleOptions.map(opt => ({ value: String(opt.value), label: opt.label }))}
      />

      {/* 确认对话框 */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialog(prev => ({ ...prev, open: false }))
            setTimeout(() => {
              setConfirmDialog(prev => ({ ...prev, employee: undefined }))
            }, 200)
          }
        }}
        title={getForbiddenFlagConfig(confirmDialog.employee?.forbiddenFlag).confirmTitle}
        description={`确定要${getForbiddenFlagConfig(confirmDialog.employee?.forbiddenFlag).actionText}员工 "${confirmDialog.employee?.employeeName}" 吗？`}
        type={getForbiddenFlagConfig(confirmDialog.employee?.forbiddenFlag).confirmType as any}
        confirmText={getForbiddenFlagConfig(confirmDialog.employee?.forbiddenFlag).confirmText}
        onConfirm={handleConfirmToggle}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialog(prev => ({ ...prev, open: false }))
            setTimeout(() => {
              setDeleteDialog(prev => ({ ...prev, employee: undefined }))
            }, 200)
          }
        }}
        title="删除确认"
        description={`确定要删除员工 "${deleteDialog.employee?.employeeName}" 吗？`}
        type="danger"
        confirmText="确认删除"
        onConfirm={handleConfirmDelete}
        showWarning={true}
      />

      {/* 修改密码对话框 */}
      <EditPwd
        open={pwdDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setPwdDialog(prev => ({ ...prev, open: false }))
            setTimeout(() => {
              setPwdDialog(prev => ({ ...prev, employee: undefined }))
            }, 200)
          }
        }}
        employee={pwdDialog.employee}
      />
    </div>
  )
}
