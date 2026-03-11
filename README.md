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
