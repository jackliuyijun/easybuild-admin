import { http } from './http'
import { API_URLS } from '@/config/api-url'
import type { Role, RoleQuery, RoleForm } from '@/types/role'
import type { ApiResponse } from '@/types/api'

// 定义角色权限接口的返回数据类型
interface ResourceItem {
    id: string;
    name: string;
    checked?: boolean;
    children?: ResourceItem[];
}

// 获取角色列表
export const getRoleList = async (params: RoleQuery): Promise<ApiResponse<Role[]>> => {
    return await http.get(API_URLS.role.list, { params })
}

// 新增或编辑角色
export const saveRole = async (data: RoleForm): Promise<ApiResponse<null>> => {
    return await http.post(API_URLS.role.save, data)
}

// 切换角色状态
export const toggleRoleForbiddenFlag = async (params: { ids: string, value: number }): Promise<ApiResponse<null>> => {
    return await http.post(API_URLS.role.disable, params)
}

// 删除角色
export const deleteRole = async (ids: string): Promise<ApiResponse<null>> => {
    return await http.post(API_URLS.role.delete, { ids })
}

// 获取角色下拉列表
export async function getRoleSelectList(params?: { name?: string }) {
    try {
        const requestParams = params?.name ? { name: params.name } : undefined
        const res = await http.get(API_URLS.role.dropdownList,
            requestParams ? { params: requestParams } : undefined
        )
        if (!res.data) {
            return []
        }
        return res.data.map((item: any) => ({
            value: item.roleId,
            label: item.roleName
        }))
    } catch (error) {
        console.error('Error fetching role list:', error)
        return []
    }
}

// 修改获取角色权限的接口
export async function getRoleResources(roleId: string | number) {
    return http.get<ApiResponse<ResourceItem[]>>(API_URLS.role.roleResource, {
        params: { roleId }
    })
}

// 添加保存角色权限的接口
export async function saveRoleResources(params: {
    id: string | number;
    resourceIds: string;
}) {
    return http.post<ApiResponse<null>>(API_URLS.role.saveRoleResource, params)
} 