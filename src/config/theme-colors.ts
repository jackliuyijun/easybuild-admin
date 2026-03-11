// 主题颜色配置
export const themeColors = {
  // --- 基础 & 中性 ---
  'original-cyan': { 
    name: '经典青 (默认)', 
    light: { primary: '173 80% 40%', 'primary-foreground': '210 40% 98%', ring: '173 80% 40%' }, 
    dark: { primary: '173 80% 40%', 'primary-foreground': '210 40% 98%', ring: '173 80% 40%' } 
  },
  slate: { name: '现代灰', light: { primary: '215.4 16.3% 46.9%', 'primary-foreground': '210 40% 98%', ring: '215.4 16.3% 46.9%' }, dark: { primary: '215.4 16.3% 56.9%', 'primary-foreground': '222.2 47.4% 11.2%', ring: '215.4 16.3% 56.9%' } },
  zinc: { name: '极客灰', light: { primary: '240 5.9% 10%', 'primary-foreground': '0 0% 98%', ring: '240 5.9% 10%' }, dark: { primary: '0 0% 98%', 'primary-foreground': '240 5.9% 10%', ring: '0 0% 98%' } },
  
  // --- 暖色调 ---
  red: { name: '活力红', light: { primary: '0 84.2% 60.2%', 'primary-foreground': '210 40% 98%', ring: '0 84.2% 60.2%' }, dark: { primary: '0 72.2% 50.6%', 'primary-foreground': '0 0% 100%', ring: '0 72.2% 50.6%' } },
  rose: { name: '玫瑰色', light: { primary: '346.8 77.2% 49.8%', 'primary-foreground': '355.7 100% 97.3%', ring: '346.8 77.2% 49.8%' }, dark: { primary: '346.8 77.2% 49.8%', 'primary-foreground': '355.7 100% 97.3%', ring: '346.8 77.2% 49.8%' } },
  pink: { name: '仙女粉', light: { primary: '330 81% 60%', 'primary-foreground': '0 0% 100%', ring: '330 81% 60%' }, dark: { primary: '330 81% 60%', 'primary-foreground': '0 0% 100%', ring: '330 81% 60%' } },
  fuchsia: { name: '魅惑紫', light: { primary: '292 91% 65%', 'primary-foreground': '0 0% 100%', ring: '292 91% 65%' }, dark: { primary: '292 91% 65%', 'primary-foreground': '0 0% 100%', ring: '292 91% 65%' } },
  orange: { name: '落日橙', light: { primary: '24.6 95% 53.1%', 'primary-foreground': '60 9.1% 97.8%', ring: '24.6 95% 53.1%' }, dark: { primary: '20.5 90.2% 48.2%', 'primary-foreground': '60 9.1% 97.8%', ring: '20.5 90.2% 48.2%' } },
  amber: { name: '琥珀金', light: { primary: '37.9 94.1% 52.7%', 'primary-foreground': '26 83.3% 14.1%', ring: '37.9 94.1% 52.7%' }, dark: { primary: '37.9 94.1% 52.7%', 'primary-foreground': '26 83.3% 14.1%', ring: '37.9 94.1% 52.7%' } },
  yellow: { name: '明亮黄', light: { primary: '47.9 95.8% 53.1%', 'primary-foreground': '26 83.3% 14.1%', ring: '47.9 95.8% 53.1%' }, dark: { primary: '47.9 95.8% 53.1%', 'primary-foreground': '26 83.3% 14.1%', ring: '47.9 95.8% 53.1%' } },

  // --- 冷色调 ---
  lime: { name: '青柠色', light: { primary: '75 94% 53%', 'primary-foreground': '0 0% 0%', ring: '75 94% 53%' }, dark: { primary: '75 94% 53%', 'primary-foreground': '0 0% 0%', ring: '75 94% 53%' } },
  green: { name: '翡翠绿', light: { primary: '142.1 76.2% 36.3%', 'primary-foreground': '355.7 100% 97.3%', ring: '142.1 76.2% 36.3%' }, dark: { primary: '142.1 70.6% 45.3%', 'primary-foreground': '144.9 80.4% 10%', ring: '142.1 70.6% 45.3%' } },
  emerald: { name: '薄荷绿', light: { primary: '160 84% 39%', 'primary-foreground': '0 0% 100%', ring: '160 84% 39%' }, dark: { primary: '160 84% 39%', 'primary-foreground': '0 0% 100%', ring: '160 84% 39%' } },
  teal: { name: '松石绿', light: { primary: '173 80% 40%', 'primary-foreground': '0 0% 100%', ring: '173 80% 40%' }, dark: { primary: '173 80% 40%', 'primary-foreground': '0 0% 100%', ring: '173 80% 40%' } },
  cyan: { name: '蒂芙尼', light: { primary: '188.7 94.5% 42.7%', 'primary-foreground': '210 40% 98%', ring: '188.7 94.5% 42.7%' }, dark: { primary: '188.7 94.5% 42.7%', 'primary-foreground': '210 40% 98%', ring: '188.7 94.5% 42.7%' } },
  sky: { name: '天空蓝', light: { primary: '199 89% 48%', 'primary-foreground': '0 0% 100%', ring: '199 89% 48%' }, dark: { primary: '199 89% 48%', 'primary-foreground': '0 0% 100%', ring: '199 89% 48%' } },
  blue: { name: '海洋蓝', light: { primary: '221.2 83.2% 53.3%', 'primary-foreground': '210 40% 98%', ring: '221.2 83.2% 53.3%' }, dark: { primary: '217.2 91.2% 59.8%', 'primary-foreground': '222.2 47.4% 11.2%', ring: '217.2 91.2% 59.8%' } },
  indigo: { name: '靛蓝色', light: { primary: '239 84% 67%', 'primary-foreground': '210 40% 98%', ring: '239 84% 67%' }, dark: { primary: '239 84% 67%', 'primary-foreground': '210 40% 98%', ring: '239 84% 67%' } },
  violet: { name: '罗兰紫', light: { primary: '262.1 83.3% 57.8%', 'primary-foreground': '210 40% 98%', ring: '262.1 83.3% 57.8%' }, dark: { primary: '263.4 70% 50.4%', 'primary-foreground': '210 40% 98%', ring: '263.4 70% 50.4%' } },
  purple: { name: '幻影紫', light: { primary: '270 100% 60%', 'primary-foreground': '0 0% 100%', ring: '270 100% 60%' }, dark: { primary: '270 100% 70%', 'primary-foreground': '0 0% 0%', ring: '270 100% 70%' } },
  cobalt: { name: '克莱因蓝', light: { primary: '231 99% 51%', 'primary-foreground': '0 0% 100%', ring: '231 99% 51%' }, dark: { primary: '231 99% 61%', 'primary-foreground': '0 0% 100%', ring: '231 99% 61%' } },

  // --- 特殊色 ---
  coffee: { name: '摩卡咖', light: { primary: '25 30% 40%', 'primary-foreground': '0 0% 100%', ring: '25 30% 40%' }, dark: { primary: '25 30% 50%', 'primary-foreground': '0 0% 100%', ring: '25 30% 50%' } },
  forest: { name: '深林绿', light: { primary: '145 45% 30%', 'primary-foreground': '0 0% 100%', ring: '145 45% 30%' }, dark: { primary: '145 45% 45%', 'primary-foreground': '0 0% 100%', ring: '145 45% 45%' } },
  // --- 品牌特色色 ---
  neon: { 
    name: '易构绿', 
    light: { primary: '157 100% 45%', 'primary-foreground': '0 0% 0%', ring: '157 100% 45%' }, 
    dark: { primary: '157 100% 50%', 'primary-foreground': '0 0% 0%', ring: '157 100% 50%' } 
  },
  bronze: { 
    name: '古铜金', 
    light: { primary: '28 50% 45%', 'primary-foreground': '0 0% 100%', ring: '28 50% 45%' }, 
    dark: { primary: '28 50% 60%', 'primary-foreground': '0 0% 0%', ring: '28 50% 60%' } 
  },
} as const

export type ThemeColor = keyof typeof themeColors

export const themeColorOptions = Object.entries(themeColors).map(([key, value]) => ({
  value: key as ThemeColor,
  label: value.name,
}))
