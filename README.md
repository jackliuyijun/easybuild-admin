# EasyBuild Admin 开发文档

> 本文档旨在为开发者提供 **EasyBuild Admin** (易构) 前端项目的技术全景视图，涵盖架构设计、技术栈选型、开发规范及核心逻辑实现细节。

---

## 一、 技术栈选型 (Tech Stack)

项目基于现代前端生态构建，坚持 **全链路类型安全** 与 **高性能** 原则：

| 领域 | 选型 | 说明 |
|------|------|------|
| **基础框架** | **Next.js 15 (App Router) + React 19** | 利用 React Server Components (RSC) 优化首屏并行渲染。 |
| **语言** | **TypeScript 5.x** | 严格模式，确保从 API 定义到 UI 组件的端到端类型安全。 |
| **样式体系** | **Tailwind CSS 3 + Lucide React** | 原子化 CSS，零运行时开销，配合 CSS Variables 实现动态主题。 |
| **组件库** | **Shadcn/ui (Radix UI)** | 无头 (Headless) 组件驱动，源码级可控，符合 WAI-ARIA 无障碍标准。 |
| **状态管理** | **Zustand** | 极简的状态流转，用于全局 UI 状态及同步的菜单数据管理。 |
| **异步数据流** | **TanStack React Query v5** | 自动化的服务端状态同步、缓存失效及并发请求控制。 |
| **表单方案** | **React Hook Form + Zod** | 基于非受控组件的高性能表单，通过 Zod 实现声明式 Schema 校验。 |
| **表格解析** | **TanStack Table v8** | 配置化表格逻辑，支持虚拟滚动、列排序及复杂元数据渲染。 |
| **包管理** | **Yarn 4 (Plug'n'Play)** | 提升依赖解析速度与磁盘占用率。 |

---

## 二、 核心架构设计 (Architecture)

项目采用 **六层解耦架构**，确保业务逻辑与基础能力的隔离：

1.  **Middleware 层**：负责全局路由守卫、JWT Token 校验与非法请求重定向。
2.  **Layout 系统**：基于 Next.js Layout 特性，实现嵌套布局、侧边栏自适应及平滑的主题切换引擎。
3.  **驱动架构 (Driver-Based)**：前端不维护静态路由表。菜单由后端下发 Resource Tree，前端运行时动态将其映射为应用路由。
4.  **业务组件层 (Higher-Order Components)**：对 Shadcn/ui 进行二次封装，提供 `CustomForm` 和 `CustomTable` 等配置化组件，覆盖 90% 的 CRUD 场景。
5.  **数据通信层 (API Internal)**：基于 Axios 的拦截器管道，统一处理 Token 注入、多环境 BaseURL 切换及全局异常捕获。
6.  **状态映射层 (State Matrix)**：Zustand 负责跨组件的同步状态，React Query 负责 Server State 的本地缓存副本。

---

## 三、 目录结构说明 (Project Structure)

```text
src/
├── api/             # API 模块化定义，按业务域拆分文件 (e.g., auth.ts, user.ts)
├── app/             # App Router 路由。包含 layout.tsx, page.tsx 及 api 路由
├── components/      # 组件库
│   ├── ui/          # 基类原子组件 (Shadcn/ui)
│   ├── custom/      # 核心业务高级组件 (CustomForm, CustomTable 等)
│   └── icons/       # 内部使用的图标资源
├── config/          # 全局静态配置文件 (如主题配色、环境常量)
├── constants/       # 业务常量声明 (枚举、响应码等)
├── hooks/           # 通用的自定义 Hooks 及 React Query 的封装
├── lib/             # 外部库实例化 (Axios, Lucide, Crypto-JS 等)
├── store/           # Zustand 状态切片定义
├── styles/          # Tailwind 指令、全局 CSS 变量、自定义 Animations
├── types/           # 全局 TypeScript 类型声明 (.d.ts)
└── middleware.ts    # Next.js 中间件逻辑
```

---

## 四、 开发规范 (Development Standards)

### 1. 编码约定
- **组件定义**：统一使用函数组件与 `Arrow Functions`。
- **文件命名**：组件目录使用 PascalCase；Hooks 使用 camelCase 且以 `use` 开头；类型文件以 `.types.ts` 结尾。
- **Props 调用**：必须声明接口 (Interface) 或类型 (Type)，严禁使用 `any`。

### 2. API 通信规范
- 所有接口必须定义请求参数与响应数据的 TS 类型。
- 业务异常必须通过 HTTP Interceptor 统一拦截处理，禁止在页面内重复编写 `try-catch`。

### 3. 组件封装原则
- **优先解耦**：尽量编写 Dumb Components (展示性组件)，将业务逻辑 (Side Effects) 抽离至自定义 Hooks。
- **配置驱动**：高级组件 (CustomForm/Table) 必须支持通过 JSON 配置项完全控制其渲染行为。

---

## 五、 核心技术实现细节 (Core Implementation)

### 动态菜单与路由映射
项目在初始化时调用 `queryMenu` 接口。通过递归算法解析后端返回的 `Resource[]` 数组：
1. 提取 `path` 与 `component` 的对应关系。
2. 注入 `Lucide` 图标动态加载。
3. 状态持久化至 Zustand 及本地 Storage，实现 30 分钟缓存机制。

### 配置化表单引擎 (CustomForm)
基于 `react-hook-form` 的 Controller 设计：
- 支持 `Grid` 布局自适应。
- 内置 `Zod` 进行异步/同步字段联动校验。
- 采用非受控模式，显著降低大表单输入的渲染延迟。

---

## 六、 开发环境常用命令

```bash
# 安装依赖 (Yarn v4)
yarn install

# 启动开发服务器 (默认端口: 4000)
yarn dev

# 生成生产环境构建产物
yarn build:prod

# 静态代码检查与质量控制
yarn lint
```

环境要求：`Node.js >= 18.17.0`。

---

## 七、 模版使用指南 — 创建后需改动的文件

使用本模版创建新项目后，请按照以下清单逐一修改，完成项目初始化。

### 1. 项目基础信息

| 文件 | 需改动项 | 说明 |
|------|----------|------|
| `package.json` | `name`、`version` | 将 `"easybuild-admin"` 改为你的项目名称，版本号按需设置。 |
| `src/app/layout.tsx` | `metadata.title`、`metadata.description` | 修改浏览器标签页标题与 SEO 描述，替换 `"EasyBuild Admin - 易构"` 为你的项目名称。 |
| `src/config/login/login-config.ts` | `name`、`description`、`subDescription` | 登录页的品牌名称和描述文案，直接替换即可。 |
| `public/favicon.ico` | 网站图标 | 替换为你自己的 Favicon。 |

### 2. 环境变量与接口地址

| 文件 | 需改动项 | 说明 |
|------|----------|------|
| `.env.development` | `NEXT_PUBLIC_API_URL`、`NEXT_PUBLIC_APP_NAME`、`NEXT_PUBLIC_UPLOAD_API_URL` | 开发环境的后端 API 地址和文件上传地址。 |
| `.env.test` | 同上 | 测试环境配置。 |
| `.env.production` | 同上 | 生产环境配置。 |
| `src/config/api-url.ts` | `API_URLS` 对象 | **核心文件**。删除模版中的示例接口路径（如 `brand`、`banner`、`goods` 等），替换为你自己的业务接口地址。`auth` 部分如果后端遵循相同登录协议则可保留。 |

### 3. 业务页面与 API 模块（需删除 / 替换）

模版内置的以下目录包含 **示例业务代码**，创建新项目时应 **全部删除** 并替换为自己的业务模块：

| 目录 / 文件 | 说明 |
|-------------|------|
| `src/app/base/` | 示例：品牌、分类、分组、标签管理页面 |
| `src/app/commodity/` | 示例：商品、SPU 管理页面 |
| `src/app/operation/` | 示例：Banner 运营管理页面 |
| `src/app/order/` | 示例：订单、退款管理页面 |
| `src/app/customer/` | 示例：用户/会员管理页面 |
| `src/app/businesses/` | 示例：商超管理页面 |
| `src/app/system/` | 示例：字典管理页面 |
| `src/api/` 中的业务文件 | 如 `goods.ts`、`banner.ts`、`order.ts` 等，删除后按需新增自己的 API 模块。**保留** `http.ts`（Axios 封装）和 `upload.ts`（文件上传）。 |
| `src/types/` 中的业务类型 | 如 `goods.ts`、`order.ts`、`category.ts` 等，删除后新增自己的类型定义。**保留** `api.ts`（通用响应类型）和 `token.ts`（Token 类型）。 |

> **可保留的通用模块**：`src/app/auth/`（部门/角色/员工权限管理）和 `src/app/login/`（登录页）属于通用鉴权能力，如果后端接口兼容可直接复用。

### 4. 菜单图标与颜色映射

| 文件 | 需改动项 | 说明 |
|------|----------|------|
| `src/config/routes.ts` | `iconMap`、`colorMap` | 菜单图标和颜色由后端下发的 `resourceId` 匹配。删除模版中的示例映射（如 `brandManage`、`goodsInfoManage`），新增你自己的菜单 `resourceId` 对应的图标和颜色。图标从 `lucide-react` 中按需导入。 |

### 5. 可选调整项

| 文件 | 需改动项 | 说明 |
|------|----------|------|
| `src/config/constants.ts` | `API_CODE` | 如果后端返回的响应状态码字段不同（如用 `SUCCESS` 替代 `OK`），需要在此修改。 |
| `src/config/theme-colors.ts` | 主题色配置 | 可新增/删除主题配色方案，或修改默认主题。 |
| `src/config/pagination.ts` | `DEFAULT_PAGE_SIZE`、`PAGE_SIZE_OPTIONS` | 分页默认值，按业务需要调整。 |
| `src/middleware.ts` | 路由守卫规则 | 当前仅放行 `/login`，如需增加公开路由或加入 Token 校验逻辑，请在此修改。 |
| `src/lib/auth.ts` | Token 存储键名 | 如果 Token 的 `localStorage` 键名需与后端约定不同，在此修改 `access-token` 和 `user-info`。 |
| `src/api/http.ts` | 请求头 / 超时配置 | 如需调整 Token 请求头名称（默认 `Access-Token`）或超时时间（默认 `10000ms`），在此修改。 |

### 快速上手检查清单

```text
✅ 1. 修改 package.json 项目名
✅ 2. 配置三个 .env 文件的 API 地址
✅ 3. 修改 login-config.ts 和 layout.tsx 中的品牌信息
✅ 4. 删除 src/app/ 下的示例业务页面
✅ 5. 清理 src/api/ 和 src/types/ 中的示例文件
✅ 6. 在 api-url.ts 中定义自己的接口路径
✅ 7. 在 routes.ts 中配置菜单图标映射
✅ 8. 替换 public/favicon.ico
```
