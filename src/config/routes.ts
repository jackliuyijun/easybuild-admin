import {
  LayoutDashboard,  // 仪表盘
  Settings,         // 系统设置
  Layers,          // 基础设置
  Image,           // Banner管理
  Briefcase,       // 品牌管理
  FolderTree,      // 分类分组管理
  FolderOpen,      // 分类管理
  Tags,            // 标签管理
  Building2,       // 部门管理
  Shield,          // 角色管理
  Users,           // 员工管理
  BookOpen,        // 字典管理
  ShoppingCart,    // 订单管理
  Package,         // 商品管理
  ShoppingBag,     // 购物袋
  RotateCcw,       // 退款管理
  Store,           // 超市管理
  Box,             // 货柜管理
  // 新增图标
  Sparkles,        // 运营管理
  UserCircle,      // 用户管理
  UsersRound,      // 会员管理
  Warehouse,       // 存放管理
  PackageSearch,   // 商品项管理
  ShieldCheck,     // 权限管理
  Key,             // 密钥/权限
  Building,        // 企业/商超
  Boxes,           // 商品模块
  ClipboardList,   // 订单模块
  Home,            // 首页
  Archive,         // 存放
  Trophy,          // 运营
  CircleDot,       // 默认/未匹配
  Database,        // 存放
  Lock,            // 权限
  BoxSelect,       // 商品
  ScrollText,      // 订单项
  ReceiptText,     // 订单管理
  ClipboardCheck,  // 订单核销
  UserCog,         // 用户设置
  Package2,        // 商品项
  ListOrdered      // 列表
} from "lucide-react"

// 定义菜单资源的接口类型
export interface MenuResource {
  resourceId: string
  name: string
  title: string
  path: string
  sort: number
  actions?: string[]
  children?: MenuResource[]
}

export interface RouteConfig {
  label: string
  icon: any
  href: string
  color: string
  children?: RouteConfig[]
}

// 只保留首页路由
export const routes: RouteConfig[] = [
  {
    label: '首页',
    icon: Home,
    href: '/',
    color: "text-sky-500"
  }
]

// 图标映射配置
const iconMap: { [key: string]: any } = {
  // 首页
  dashboard: Home,
  home: Home,

  // 基础设置 (baseSetting)
  baseSetting: Layers,
  categoryManage: FolderOpen,
  brandManage: Briefcase,
  groupManage: FolderTree,
  tagManage: Tags,

  // 运营管理 (operationSetting)
  operationSetting: Sparkles,
  bannerManage: Image,

  // 订单管理 (orderManage)
  orderManage: ClipboardList,      // 顶层
  orderInfoManage: ReceiptText,     // 订单子项
  orderRefundManage: RotateCcw,    // 退款项

  // 商超管理 (businessesManage)
  businessesManage: Building,      // 顶层
  merchantManage: Store,           // 超市子项

  // 商品管理 (commodityManage)
  commodityManage: Boxes,          // 顶层
  goodsInfoManage: Package,        // 商品子项
  spuConfig: PackageSearch,

  // 会员管理 (customerManage)
  customerManage: UsersRound,      // 顶层
  userInfoManage: UserCircle,      // 用户子项

  // 存放管理 (storageSetting)
  storageSetting: Warehouse,       // 顶层
  containerManage: Box,            // 货柜项

  // 权限管理 (authManage)
  authManage: ShieldCheck,         // 顶层
  roleManage: Shield,              // 角色
  departmentManage: Building2,     // 部门
  employeeManage: Users,           // 员工
  permissionManage: Key,
  dictManage: BookOpen,

  // 系统/其他兼容 ID
  dashboard_info: Home,
  dashboard_manage: Home,
  order_info: ReceiptText,
  refund_manage: RotateCcw,
  user_info: UserCircle,
  goods_info: Package,

  // 默认图标
  default: LayoutDashboard
}

// 颜色映射配置
const colorMap: { [key: string]: string } = {
  // 首页
  dashboard: "text-blue-500",
  home: "text-blue-500",

  // 基础设置
  baseSetting: "text-amber-500",
  categoryManage: "text-indigo-500",

  // 运营管理
  operationSetting: "text-purple-500",
  bannerManage: "text-purple-500",

  // 订单管理
  orderManage: "text-orange-600",
  orderInfoManage: "text-red-500",
  orderRefundManage: "text-purple-600",

  // 商超管理
  businessesManage: "text-emerald-600",
  merchantManage: "text-emerald-500",

  // 商品管理
  commodityManage: "text-blue-600",
  goodsInfoManage: "text-yellow-600",

  // 会员管理
  customerManage: "text-cyan-600",
  userInfoManage: "text-blue-600",

  // 存放管理
  storageSetting: "text-indigo-600",
  containerManage: "text-blue-500",

  // 权限管理
  authManage: "text-red-700",
  roleManage: "text-violet-500",
  departmentManage: "text-teal-500",
  employeeManage: "text-green-500",

  // 默认颜色
  default: "text-slate-500"
}

// 转换菜单资源为路由配置的函数
export const convertMenuToRoutes = (menus: MenuResource[] | undefined): RouteConfig[] => {
  if (!menus || !Array.isArray(menus)) {
    return []
  }

  const convert = (menu: MenuResource): RouteConfig => {
    // 根据 resourceId 获取图标和颜色
    const menuIcon = iconMap[menu.resourceId] || iconMap.default
    const menuColor = colorMap[menu.resourceId] || colorMap.default

    const route: RouteConfig = {
      label: menu.title || menu.name,
      icon: menuIcon,
      href: menu.path,
      color: menuColor
    }

    // 处理子菜单
    if (menu.children && Array.isArray(menu.children) && menu.children.length > 0) {
      // 按 sort 字段排序
      const sortedChildren = [...menu.children].sort((a, b) => (a.sort || 0) - (b.sort || 0))
      route.children = sortedChildren.map(child => convert(child))
    }

    return route
  }

  try {
    // 对顶层菜单也进行排序
    const sortedMenus = [...menus].sort((a, b) => (a.sort || 0) - (b.sort || 0))
    return sortedMenus.map(menu => convert(menu))
  } catch (error) {
    console.error('Error converting menu resources:', error)
    return []
  }
}

export const MENU_ITEMS = routes
