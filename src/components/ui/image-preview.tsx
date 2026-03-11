'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Button } from './button'
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, X } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface ImagePreviewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    url?: string
    title?: string
}

export function ImagePreview({
    open,
    onOpenChange,
    url,
    title = '图片预览'
}: ImagePreviewProps) {
    // 图片旋转角度
    const [rotation, setRotation] = useState(0)
    // 图片缩放比例
    const [scale, setScale] = useState(1)

    // 重置状态
    const resetState = () => {
        setRotation(0)
        setScale(1)
    }

    // 监听open状态变化，重置状态
    useEffect(() => {
        if (!open) {
            resetState()
        }
    }, [open])

    // 处理旋转
    const handleRotateLeft = () => {
        setRotation((prev) => prev - 90)
    }

    const handleRotateRight = () => {
        setRotation((prev) => prev + 90)
    }

    // 处理缩放
    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.25, 3)) // 最大放大3倍
    }

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.25, 0.25)) // 最小缩小0.25倍
    }

    return (
        <Dialog.Root 
            open={open} 
            onOpenChange={onOpenChange}
        >
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/80 z-[99]" />
                <Dialog.Content className="fixed inset-0 flex flex-col z-[100]">
                    {/* 头部工具栏 */}
                    <div className="h-12 bg-black/40 backdrop-blur-sm px-4 flex items-center justify-between relative z-[102]">
                        <span className="text-white font-medium">{title}</span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white hover:text-white hover:bg-white/20 w-8 h-8 p-0"
                                onClick={handleRotateLeft}
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white hover:text-white hover:bg-white/20 w-8 h-8 p-0"
                                onClick={handleRotateRight}
                            >
                                <RotateCw className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white hover:text-white hover:bg-white/20 w-8 h-8 p-0"
                                onClick={handleZoomIn}
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white hover:text-white hover:bg-white/20 w-8 h-8 p-0"
                                onClick={handleZoomOut}
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Dialog.Close asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:text-white hover:bg-white/20 w-8 h-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </Dialog.Close>
                        </div>
                    </div>

                    {/* 图片预览区域 */}
                    <div className="flex-1 bg-transparent flex items-center justify-center p-4 relative z-[101]">
                        <div className="relative w-full h-full">
                            {url && (
                                <Image
                                    src={url}
                                    alt="Preview"
                                    fill
                                    className="object-contain transition-transform duration-200"
                                    unoptimized
                                    quality={100}
                                    sizes="100vw"
                                    priority
                                    style={{
                                        transform: `rotate(${rotation}deg) scale(${scale})`
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
} 