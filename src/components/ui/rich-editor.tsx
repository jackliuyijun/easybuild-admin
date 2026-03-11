'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { uploadApi } from '@/api/upload'

export interface RichEditorProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
  placeholder?: string
}

export function RichEditor({
  value = '',
  onChange,
  className,
  disabled = false,
  placeholder = '请输入内容...'
}: RichEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  const handleImageUpload = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      try {
        const imageUrl = await uploadApi.uploadEditorImage(file)
        editor?.chain().focus().setImage({ src: imageUrl }).run()
      } catch (error) {
        console.error('图片上传失败:', error)
      }
    }
  }

  const handleAddLink = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLinkDialogOpen(true)
  }

  if (!editor) return null

  return (
    <>
      <div 
        className={cn(
          "relative rounded-md border bg-background flex flex-col h-[550px]",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
        }}
      >
        <div className="flex flex-wrap items-center gap-1 p-1 border-b shrink-0">
          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('underline')}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            disabled={disabled}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'left' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
            disabled={disabled}
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'center' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
            disabled={disabled}
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'right' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
            disabled={disabled}
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImageUpload}
            className="h-8 w-8 p-0"
            disabled={disabled}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddLink}
            className="h-8 w-8 p-0"
            disabled={disabled}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <EditorContent 
            editor={editor} 
            className={cn(
              "prose prose-sm dark:prose-invert",
              "prose-p:my-2 prose-headings:my-3",
              "prose-img:my-3 prose-img:rounded-md prose-img:max-h-[300px]",
              "focus-visible:outline-none"
            )}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          />
        </div>
        <style jsx global>{`
          .ProseMirror {
            outline: none;
            min-height: 100%;
          }
          .ProseMirror > * + * {
            margin-top: 0.75em;
          }
          .ProseMirror ul,
          .ProseMirror ol {
            padding: 0 1rem;
          }
          .ProseMirror img {
            display: inline-block;
            height: auto;
            max-width: 100%;
          }
          .ProseMirror p.is-editor-empty:first-child::before {
            color: #666;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
        `}</style>
      </div>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent 
          className="sm:max-w-[425px]"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>添加链接</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="link"
                placeholder="请输入链接地址"
                className="col-span-4"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                setLinkDialogOpen(false)
                setLinkUrl('')
              }}
            >
              取消
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                if (linkUrl) {
                  editor?.chain().focus().setLink({ href: linkUrl }).run()
                }
                setLinkDialogOpen(false)
                setLinkUrl('')
              }}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 