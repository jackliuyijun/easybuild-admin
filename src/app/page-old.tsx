'use client'

import { Card } from "@/components/ui/card"
import { usePageTitle } from "@/store"
import { useEffect } from "react"

const techCards = [
  {
    category: "前端",
    title: "React",
    description: "The library for web and native user interfaces",
    subtitle: "react-router-dom用于路由",
    textColor: "text-[#61DAFB]",
    borderColor: "border-[#61DAFB]/10"
  },
  {
    category: "前端框架",
    title: "Next.js",
    description: "Next.js 是一个超快速的前端构建工具，推动着下一代网络应用的发展",
    textColor: "text-[#BD34FE]",
    borderColor: "border-[#BD34FE]/10"
  },
  {
    category: "前端辅助",
    title: "Zustand",
    description: "一个轻量级、快速的状态管理组件",
    subtitle: "Axios用于做HTTP请求",
    textColor: "text-amber-400",
    borderColor: "border-amber-400/10"
  },
  {
    category: "UI",
    title: "Tailwindcss",
    description: "搭配Shadcn使用",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-400/10"
  },
  {
    category: "后端",
    title: "Java",
    description: "使用最新长期支持的版本: 21",
    textColor: "text-orange-400",
    borderColor: "border-orange-400/10"
  },
  {
    category: "数据库",
    title: "MySQL",
    description: "8.x",
    textColor: "text-blue-400",
    borderColor: "border-blue-400/10"
  },
  {
    category: "后端框架",
    title: "Spring",
    description: "包含Spring Boot, Spring Security, Spring Data JPA, Spring AI",
    textColor: "text-green-400",
    borderColor: "border-green-400/10"
  },
  {
    category: "智能",
    title: "智谱·AI",
    description: "让机器像人一样思考",
    textColor: "text-indigo-400",
    borderColor: "border-indigo-400/10"
  },
  {
    category: "工具",
    title: "ChatGPT",
    description: "前端会使用v0.dev帮助生成页面。其他情况下使用ChatGPT。",
    subtitle: "本系统50%以上代码由AI模型生成",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-400/10"
  }
]

export default function Home() {
  const { setPageTitle } = usePageTitle();
  useEffect(() => {
    setPageTitle("技术栈概览");
  }, [setPageTitle]);
  return (
    <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {techCards.map((card, index) => (
              <Card
                key={index}
                className={`bg-card/50 backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${card.borderColor} group`}
              >
                <div className="p-5 space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {card.category}
                    </p>
                    <h3 className={`text-xl font-semibold ${card.textColor} group-hover:text-opacity-80 transition-colors`}>
                      {card.title}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {card.description}
                    </p>
                    {card.subtitle && (
                      <p className="text-xs text-muted-foreground italic">
                        {card.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
  )
}
