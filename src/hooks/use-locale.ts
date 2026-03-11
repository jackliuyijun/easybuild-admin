'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_LOCALE } from '@/config/pagination'
import type { LocaleType } from '@/config/i18n/pagination'

export function useLocale() {
    const [locale, setLocale] = useState<LocaleType>(DEFAULT_LOCALE)

    useEffect(() => {
        // 获取浏览器语言设置
        const browserLocale = navigator.language
        // 根据浏览器语言设置选择对应的语言
        // 这里可以根据需要添加更多的语言匹配规则
        if (browserLocale.startsWith('en')) {
            setLocale('en-US')
        } else if (browserLocale.startsWith('zh')) {
            setLocale('zh-CN')
        }
        // 如果没有匹配到，使用默认语言
    }, [])

    return locale
} 