'use client'

import React, { useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { usePageTitle } from "@/store"
import { getUserInfo } from "@/lib/auth"
import {
  Layers,
  Zap,
  ShieldCheck,
  Cpu,
  LayoutTemplate,
  Terminal,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react'

const features = [
  { title: "业务无关", description: "菜单权限由后端动态下发，前端不硬编码任何业务逻辑。", icon: Layers, color: "text-blue-500", bg: "bg-blue-500/10" },
  { title: "即插即用", description: "新增模块只需创建页面 + 后端注册，侧边栏自动出现，无需改路由。", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  { title: "类型安全", description: "TypeScript 5 全链路类型覆盖，从 API 到组件一气呵成。", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { title: "现代化栈", description: "Next.js 15 + React 19 + Shadcn/ui，享受极致性能与开发体验。", icon: Cpu, color: "text-purple-500", bg: "bg-purple-500/10" },
]

export default function Home() {
  const { setPageTitle } = usePageTitle()
  const userInfo = getUserInfo()

  useEffect(() => {
    setPageTitle("系统首页")
  }, [setPageTitle])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00FF9D]/10 via-background to-background border p-8 md:p-12">
        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] text-xs font-bold tracking-widest uppercase">
            New Generation Scaffold
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            EasyBuild Admin — <span className="text-[#00FF9D] drop-shadow-[0_0_10px_rgba(0,255,157,0.3)]">易构</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            一款清爽、美观、开箱即用的现代化中后台前端框架，为全栈工程师、前端及后端工程师量身打造。遵循<b>业务无关、按需组装、即插即用</b>的核心理念。
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Card className="flex items-center gap-3 px-4 py-2 border-none bg-background/50 backdrop-blur-sm">
              <LayoutTemplate className="w-4 h-4 text-[#00FF9D]" />
              <span className="text-sm font-medium">响应式布局</span>
            </Card>
            <Card className="flex items-center gap-3 px-4 py-2 border-none bg-background/50 backdrop-blur-sm">
              <Terminal className="w-4 h-4 text-[#00FF9D]" />
              <span className="text-sm font-medium">标准化 API</span>
            </Card>
            <Card className="flex items-center gap-3 px-4 py-2 border-none bg-background/50 backdrop-blur-sm">
              <Info className="w-4 h-4 text-[#00FF9D]" />
              <span className="text-sm font-medium">动态路由缓存</span>
            </Card>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#00FF9D]/5 blur-[100px] rounded-full" />
      </div>

      {/* Core Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((item, index) => (
          <Card key={index} className="p-6 border-none bg-card/40 backdrop-blur-md hover:bg-card/60 transition-all group overflow-hidden relative">
            <div className="relative z-10 space-y-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Intro Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-none bg-card/40 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-6 bg-[#00FF9D] rounded-full" />
            <h2 className="text-xl font-bold italic tracking-tight uppercase">技术架构概览 / Tech Stack</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { name: "React 19", label: "框架核心" },
              { name: "Next.js 15", label: "应用框架" },
              { name: "TypeScript 5", label: "类型系统" },
              { name: "Tailwind CSS", label: "原子化样式" },
              { name: "Shadcn/ui", label: "组件库" },
              { name: "Zustand", label: "状态管理" },
              { name: "React Query", label: "服务端缓存" },
              { name: "Zod", label: "声明式校验" },
              { name: "Axios", label: "HTTP 通信" },
            ].map((tech) => (
              <div key={tech.name} className="p-4 rounded-xl bg-background/40 border border-border/50 group hover:border-[#00FF9D]/30 transition-colors">
                <div className="text-sm font-bold group-hover:text-[#00FF9D] transition-colors">{tech.name}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{tech.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6 border-none bg-primary/5 border border-primary/10 group cursor-pointer hover:bg-primary/10 transition-all">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-bold">快速上手指南</h3>
                <p className="text-sm text-muted-foreground">三步启动开发环境</p>
              </div>
              <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
          <Card className="p-6 border-none bg-card/40 backdrop-blur-md space-y-6">
            <h3 className="font-bold">产品价值</h3>
            <ul className="space-y-4">
              {[
                "业务解耦，接口驱动菜单",
                "标准 CRUD 模式，降低成本",
                "源码级组件，极致可维护性",
                "一键切换 20+ 预置主题色"
              ].map((text, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00FF9D] shrink-0" />
                  <span className="text-muted-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
