'use client'

import { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Upload, X, Eye, Trash2, Play } from 'lucide-react'
import Image from 'next/image'
import { uploadApi } from '@/api/upload'
import { ImagePreview } from "../ui/image-preview"
import { VideoPreview } from "../ui/video-preview"
import { Progress } from "@/components/ui/progress"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Types
interface FileUploadProps {
  value?: string | string[]
  onChange?: (value: string) => void
  accept?: string
  maxSize?: number
  placeholder?: string
  preview?: boolean
  folder?: string
  onUploading?: (uploading: boolean) => void
  className?: string
  hideError?: boolean
  mediaType?: 'image' | 'video' | 'file'
  multiple?: boolean
  multipleRender?: boolean
  maxLength?: number
  onProgress?: (progress: number) => void
}

interface FilePreviewProps {
  url: string
  onPreview: () => void
  onDelete: (e: React.MouseEvent) => void
  isLoading: boolean
  onLoad: (url: string) => void
  onError: (url: string) => void
}

type LoadingStates = Record<string, boolean>

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 添加文件类型常量
const ACCEPT_TYPES = {
  image: '.jpg,.jpeg,.png,.gif,.bmp,.webp',
  video: '.mp4,.webm,.ogg,.mov,.avi',
  file: '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.zip,.rar'
}

// 修改文件类型验证函数
const isValidFileType = (file: File, accept: string): boolean => {
  if (accept === '*') return true

  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()
  const acceptTypes = accept.split(',').map(type => type.trim().toLowerCase())

  return acceptTypes.some(type => {
    // 处理 MIME 类型
    if (type.includes('/')) {
      // 处理通配符，例如 image/*
      if (type.endsWith('/*')) {
        const mainType = type.split('/')[0]
        return fileType.startsWith(mainType + '/')
      }
      return fileType === type
    }
    // 处理文件扩展名
    if (type.startsWith('.')) {
      return fileName.endsWith(type)
    }
    // 处理其他通配符
    if (type.includes('*')) {
      const regex = new RegExp(type.replace('*', '.*'))
      return fileType.match(regex)
    }
    return false
  })
}

// 修改文件类型判断函数
const isVideoFile = (url: string | undefined | null): boolean => {
  if (!url || typeof url !== 'string') return false
  try {
    const urlLower = url.toLowerCase()
    return urlLower.match(/\.(mp4|webm|ogg|mov|avi)$/) !== null || urlLower.includes('video')
  } catch (error) {
    console.error('Error checking video file:', error)
    return false
  }
}

// 添加文件类型判断函数
const isImageFile = (url: string | undefined | null): boolean => {
  if (!url || typeof url !== 'string') return false
  try {
    const urlLower = url.toLowerCase()
    return urlLower.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) !== null || urlLower.includes('image')
  } catch (error) {
    console.error('Error checking image file:', error)
    return false
  }
}

const VideoPreviewContent = memo(({
  url,
  isLoading,
  onLoad,
  onError
}: {
  url: string
  isLoading: boolean
  onLoad: () => void
  onError: () => void
}) => (
  <div className="relative w-full h-full">
    {isLoading && (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )}
    <video
      src={url}
      className={cn(
        "object-cover rounded-md w-full h-full",
        isLoading && "opacity-50"
      )}
      controls={false}
      onLoadedData={onLoad}
      onError={onError}
    />
    <div className="absolute inset-0 flex items-center justify-center">
      <Play className="w-8 h-8 text-white/80" />
    </div>
  </div>
))

VideoPreviewContent.displayName = 'VideoPreviewContent'

const ImagePreviewContent = memo(({
  url,
  isLoading,
  onLoad,
  onError
}: {
  url: string
  isLoading: boolean
  onLoad: () => void
  onError: () => void
}) => (
  <>
    <Image
      src={url}
      alt="Preview"
      fill
      className={cn(
        "object-contain rounded-md",
        isLoading && "opacity-0"
      )}
      onLoad={onLoad}
      onError={onError}
      unoptimized
    />
    {isLoading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )}
  </>
))

ImagePreviewContent.displayName = 'ImagePreviewContent'

const PreviewControls = memo(({
  isVideo,
  onPreview,
  onDelete
}: {
  isVideo: boolean
  onPreview: () => void
  onDelete: (e: React.MouseEvent) => void
}) => (
  <div
    className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
    onClick={(e) => e.stopPropagation()}
  >
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 text-white hover:text-primary hover:bg-white/20"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onPreview()
      }}
      type="button"
    >
      {isVideo ? <Play className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </Button>
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 text-white hover:text-destructive hover:bg-white/20"
      onClick={onDelete}
      type="button"
    >
      <Trash2 className="h-5 w-5" />
    </Button>
  </div>
))

PreviewControls.displayName = 'PreviewControls'

const FilePreview = memo(({
  url,
  onPreview,
  onDelete,
  isLoading,
  onLoad,
  onError
}: FilePreviewProps) => {
  const isVideo = isVideoFile(url)

  return (
    <div className="relative w-full h-full group">
      <div className="relative w-full h-full">
        {isVideo ? (
          <VideoPreviewContent
            url={url}
            isLoading={isLoading}
            onLoad={() => onLoad(url)}
            onError={() => onError(url)}
          />
        ) : (
          <ImagePreviewContent
            url={url}
            isLoading={isLoading}
            onLoad={() => onLoad(url)}
            onError={() => onError(url)}
          />
        )}
      </div>
      <PreviewControls
        isVideo={isVideo}
        onPreview={onPreview}
        onDelete={onDelete}
      />
    </div>
  )
})

FilePreview.displayName = 'FilePreview'

interface SortableItemProps {
  id: string;
  url: string;
  isLoading: boolean;
  onPreview: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onLoad: (url: string) => void;
  onError: (url: string) => void;
}

const SortableItem = memo(({ id, url, isLoading, onPreview, onDelete, onLoad, onError }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    data: {
      url
    }
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: 'relative',
        touchAction: 'none',
        opacity: isDragging ? 0.5 : 1,
      }}
      className={cn(
        "relative",
        isDragging && "z-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "relative flex flex-col items-center justify-center border border-dashed rounded-md",
          "w-[120px] h-[120px]",
          "transition-all duration-200 ease-in-out",
          "hover:border-primary hover:bg-background/80",
          "border-primary/50",
          isDragging && "ring-2 ring-primary ring-offset-2",
          "p-0"
        )}
      >
        <div className="relative w-full h-full group">
          <div className="relative w-full h-full">
            {isVideoFile(url) ? (
              <VideoPreviewContent
                url={url}
                isLoading={isLoading}
                onLoad={() => onLoad(url)}
                onError={() => onError(url)}
              />
            ) : (
              <ImagePreviewContent
                url={url}
                isLoading={isLoading}
                onLoad={() => onLoad(url)}
                onError={() => onError(url)}
              />
            )}
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white hover:text-primary hover:bg-white/20"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onPreview()
              }}
              type="button"
            >
              {isVideoFile(url) ? <Play className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white hover:text-destructive hover:bg-white/20"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete(e)
              }}
              type="button"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})

SortableItem.displayName = 'SortableItem'

// 添加日志工函数
const logger = {
  error: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(...args)
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(...args)
    }
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(...args)
    }
  }
}

export function FileUpload({
  value,
  onChange,
  accept,
  maxSize = 10 * 1024 * 1024,
  placeholder = '点击或拖拽上传文件',
  preview = false,
  className,
  folder = 'common',
  onUploading,
  hideError = false,
  mediaType = 'image',
  multipleRender,
  maxLength = 10,
  onProgress
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>()
  const [uploading, setUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState(0)

  // 统一使用数组管理文件列表
  const [fileList, setFileList] = useState<string[]>(() => {
    if (!value) return []
    if (Array.isArray(value)) return value
    return value.split(',').filter(Boolean)
  })

  // 当外部 value 变化时更新 fileList
  useEffect(() => {
    if (value === '') {
      setFileList([])
    } else if (value) {
      const newList = Array.isArray(value) ? value : value.split(',').filter(Boolean)
      setFileList(newList)
    }
  }, [value])

  const [loadingStates, setLoadingStates] = useState<LoadingStates>(() => {
    if (!value) return {}
    const urls = Array.isArray(value) ? value : [value]
    return urls.reduce((acc, url) => ({ ...acc, [url]: false }), {})
  })

  // 更新 loadingStates 的副作用
  useEffect(() => {
    if (!multipleRender) return

    if (value) {
      const urls = Array.isArray(value) ? value : [value]
      setLoadingStates(prev => {
        const newStates = { ...prev }
        urls.forEach(url => {
          if (!(url in newStates)) {
            newStates[url] = false
          }
        })
        return newStates
      })
    }
  }, [value, multipleRender])

  const handleError = useCallback((error: unknown, context: string) => {
    logger.error(`${context}:`, error)
    const errorMessage = error instanceof Error ? error.message : '操作失败'
    setError(errorMessage)
    setUploading(false)
    onUploading?.(false)
    setUploadProgress(0)
  }, [onUploading])

  // 根据 mediaType 设置默认的 accept
  const defaultAccept = mediaType === 'file' ? ACCEPT_TYPES.file :
    mediaType === 'video' ? ACCEPT_TYPES.video :
      ACCEPT_TYPES.image

  // 使用传入的 accept 或默认值
  const acceptTypes = accept || defaultAccept

  const validateFile = useCallback((file: File): boolean => {
    console.log('开始验证文件:', {
      fileName: file.name,
      fileSize: file.size,
      maxSize: maxSize,
      fileType: file.type,
      acceptTypes: acceptTypes
    })

    if (maxSize && file.size > maxSize) {
      const errorMsg = `文件大小不能超过 ${formatFileSize(maxSize)}`
      console.log('文件大小验证失败:', errorMsg)
      setError(errorMsg)
      return false
    }

    if (!isValidFileType(file, acceptTypes)) {
      const errorMsg = `不支持的文件类型，支持的类型：${acceptTypes}`
      console.log('文件类型验证失败:', errorMsg)
      setError(errorMsg)
      return false
    }

    console.log('文件验证通过')
    return true
  }, [maxSize, acceptTypes])

  const handleImageLoad = useCallback((url: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [url]: false
    }))
  }, [])

  const handleImageError = useCallback((url: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [url]: false
    }))
    logger.error(`图片加载失败: ${url}`)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    document.body.style.cursor = ''
    if (window.navigator.vibrate) {
      window.navigator.vibrate(30)
    }

    const { active, over } = event
    if (!over || active.id === over.id) return

    // 先计算新的列表
    const oldIndex = fileList.findIndex(url => url === active.id)
    const newIndex = fileList.findIndex(url => url === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // 生成新的列表
    const newList = arrayMove([...fileList], oldIndex, newIndex)

    // 先触发 onChange
    onChange?.(newList.join(','))

    // 再更新内部状态
    setFileList(newList)
  }, [onChange, fileList])

  const handleDelete = useCallback((e: React.MouseEvent, url?: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (url) {
      setFileList(prev => {
        const newList = prev.filter(item => item !== url)
        onChange?.(newList.join(','))
        return newList
      })
    } else {
      setFileList([])
      onChange?.('')
    }
  }, [onChange])

  const handleFile = useCallback(async (file: File) => {
    if (!validateFile(file)) {
      return
    }

    try {
      setUploading(true)
      onUploading?.(true)
      setError(undefined)
      setUploadProgress(0)

      const url = await uploadApi.uploadFile(file, folder, (progress: number) => {
        const progressValue = Math.round(progress)
        setUploadProgress(progressValue)
        onProgress?.(progressValue)
      })

      setLoadingStates(prev => ({
        ...prev,
        [url]: false
      }))

      setFileList(prev => {
        const newList = multipleRender ? [...prev, url] : [url]
        onChange?.(newList.join(','))
        return newList
      })
    } catch (err) {
      handleError(err, '上传失败')
    } finally {
      setUploading(false)
      onUploading?.(false)
      setUploadProgress(0)
    }
  }, [validateFile, folder, multipleRender, onChange, onUploading, onProgress, handleError])

  // 将 sensors 移到组件顶层，避免 React Hook 规则问题
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
        distance: 8,
        pressure: 0,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const renderContent = () => {
    if (multipleRender) {

      return (
        <div className="flex flex-wrap gap-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={() => {
              document.body.style.cursor = 'grabbing'
              if (window.navigator.vibrate) {
                window.navigator.vibrate(50)
              }
            }}
            onDragEnd={handleDragEnd}
            onDragCancel={() => {
              document.body.style.cursor = ''
            }}
          >
            <SortableContext
              items={fileList}
              strategy={rectSortingStrategy}
            >
              {fileList.map((url) => (
                <SortableItem
                  key={url}
                  id={url}
                  url={url}
                  isLoading={loadingStates[url]}
                  onPreview={() => {
                    setPreviewUrl(url)
                    setShowPreview(true)
                  }}
                  onDelete={(e) => handleDelete(e, url)}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              ))}
            </SortableContext>
          </DndContext>

          {fileList.length < maxLength && (
            <div className="relative">
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center border border-dashed rounded-md",
                  "w-[120px] h-[120px]",
                  "transition-all duration-200 ease-in-out",
                  "hover:border-primary hover:bg-background/80",
                  isDragging && "border-primary bg-background/80",
                  error && "border-destructive",
                  uploading && "pointer-events-none opacity-70",
                  "p-0"
                )}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  const file = e.dataTransfer.files[0]
                  if (file) handleFile(file)
                }}
              >
                <UploadBox
                  isDragging={isDragging}
                  setIsDragging={setIsDragging}
                  handleFile={handleFile}
                  uploading={uploading}
                  uploadProgress={uploadProgress}
                  error={error}
                  accept={acceptTypes}
                />
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="relative w-full">
        <div
          className={cn(
            "relative flex flex-col items-center justify-center border border-dashed rounded-md",
            "w-[120px] h-[120px]",
            "transition-all duration-200 ease-in-out",
            "hover:border-primary hover:bg-background/80",
            isDragging && "border-primary bg-background/80",
            error && "border-destructive",
            !error && value && "border-primary/50",
            uploading && "pointer-events-none opacity-70",
            "p-0",
            className
          )}
        >
          {value && preview ? (
            <FilePreview
              url={value as string}
              isLoading={loadingStates[value as string]}
              onPreview={() => {
                setPreviewUrl(value as string)
                setShowPreview(true)
              }}
              onDelete={handleDelete}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <UploadBox
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              handleFile={handleFile}
              uploading={uploading}
              uploadProgress={uploadProgress}
              error={error}
              accept={acceptTypes}
            />
          )}
        </div>
      </div>
    )
  }

  const UploadBox = memo(({
    isDragging,
    setIsDragging,
    handleFile,
    uploading,
    uploadProgress,
    error,
    accept
  }: {
    isDragging: boolean
    setIsDragging: (isDragging: boolean) => void
    handleFile: (file: File) => void
    uploading: boolean
    uploadProgress: number
    error: string | undefined
    accept: string
  }) => (
    <>
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept={accept}
        onChange={(e) => {
          console.log('文件选择事件触发', {
            files: e.target.files,
            hasFile: e.target.files && e.target.files.length > 0
          })
          const file = e.target.files?.[0]
          if (file) {
            console.log('选择的文件信息:', {
              name: file.name,
              size: file.size,
              type: file.type
            })
            handleFile(file)
          }
        }}
        disabled={uploading}
      />
      <div className="flex flex-col items-center justify-center space-y-1">
        <div className="w-8 h-8 flex items-center justify-center">
          <Upload className={cn(
            "w-5 h-5 text-muted-foreground",
            uploading && "animate-bounce"
          )} />
        </div>
        <div className="flex flex-col items-center space-y-0.5">
          <p className="text-sm text-muted-foreground">
            {uploading ? "正在上传..." : "上传文件"}
          </p>
          <p className="text-xs text-muted-foreground">
            ({formatFileSize(maxSize)})
          </p>
        </div>
        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
            <Progress value={uploadProgress} className="h-1" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {uploadProgress > 0 ? `${uploadProgress}%` : '准备上传...'}
            </p>
          </div>
        )}
      </div>
    </>
  ))

  UploadBox.displayName = 'UploadBox'

  return (
    <>
      <div className="w-full">
        {renderContent()}
        {error && !hideError && (
          <p className="text-sm text-destructive font-medium absolute -bottom-4 left-0">{error}</p>
        )}
      </div>

      {previewUrl && (
        isVideoFile(previewUrl) ? (
          <VideoPreview
            open={showPreview}
            onOpenChange={setShowPreview}
            url={previewUrl}
          />
        ) : (
          <ImagePreview
            open={showPreview}
            onOpenChange={setShowPreview}
            url={previewUrl}
          />
        )
      )}
    </>
  )
} 