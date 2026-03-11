'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Button } from './button'
import { X } from 'lucide-react'

interface VideoPreviewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    url?: string
    title?: string
}

export function VideoPreview({
    open,
    onOpenChange,
    url,
    title = '视频预览'
}: VideoPreviewProps) {
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

                    {/* 视频预览区域 */}
                    <div className="flex-1 bg-transparent flex items-center justify-center p-4 relative z-[101]">
                        <div className="relative w-full max-w-[1200px] mx-auto aspect-video">
                            {url && (
                                <video
                                    src={url}
                                    controls
                                    className="w-full h-full object-contain"
                                    controlsList="nodownload"
                                    playsInline
                                    preload="metadata"
                                />
                            )}
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
} 