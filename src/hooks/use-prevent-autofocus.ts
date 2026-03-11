'use client'

import { useEffect } from 'react'

export function usePreventAutofocus() {
    useEffect(() => {
        // 延迟执行以确保在对话框完全打开后阻止自动聚焦
        const timeoutId = setTimeout(() => {
            // 移除所有元素的 autofocus 属性
            document.querySelectorAll('[autofocus]').forEach(element => {
                element.removeAttribute('autofocus')
            })

            // 如果有元素获得了焦点，让它失去焦点
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur()
            }
        }, 0)

        return () => clearTimeout(timeoutId)
    }, [])
}