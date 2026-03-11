"use client"

import React, { useState, useCallback, useEffect, memo } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronsUpDown,
  KeyRound,
  LogOut,
  User,
} from "lucide-react"
import CryptoJS from "crypto-js"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/custom/confirm-dialog"
import { CustomDialog } from "@/components/custom/custom-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { clearAuth, getUserInfo } from "@/lib/auth"
import { showMessage, showError } from "@/components/custom/notifications"
import { API_URLS } from "@/config/api-url"
import http from "@/api/http"
import type { TokenContent } from "@/types/token"

// 密码验证 schema
const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "请输入原密码"),
    newPassword: z
      .string()
      .min(8, "密码不能少于8个字符")
      .max(20, "密码不能超过20个字符")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%])[A-Za-z\d!@#$%]{8,20}$/,
        "密码必须包含大小写字母、数字和特殊字符(!@#$%)"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: "新密码不能与原密码相同",
    path: ["newPassword"],
  })

export const NavUser = memo(function NavUser() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<TokenContent | null>(null)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  })

  // 获取用户信息
  useEffect(() => {
    const info = getUserInfo()
    if (info) {
      setUserInfo(info)
    }
  }, [])

  // 重置表单
  const resetForm = useCallback(() => {
    form.reset({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }, [form])

  // 关闭对话框时重置表单
  useEffect(() => {
    if (!showPasswordDialog) {
      resetForm()
    }
  }, [showPasswordDialog, resetForm])

  const handleLogout = async () => {
    try {
      await http.get(API_URLS.auth.logout)
      clearAuth()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      clearAuth()
      router.push("/login")
    }
  }

  const handlePasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      setLoading(true)
      await http.post(API_URLS.auth.resetPwd, {
        oldPwd: CryptoJS.MD5(data.oldPassword).toString(),
        newPwd: CryptoJS.MD5(data.newPassword).toString(),
      })

      showMessage({
        title: "密码修改成功",
        description: "请重新登录",
      })

      clearAuth()
      router.push("/login")
    } catch (error: any) {
      showError({
        title: "密码修改失败",
        description: error.message,
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 获取用户名首字母作为头像
  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name.charAt(0).toUpperCase()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2.5 px-2 hover:bg-accent/50 h-10 transition-all duration-200 group"
          >
            <Avatar className="h-7 w-7 border-2 border-background shadow-md transition-transform group-hover:scale-110 group-hover:rotate-3">
              <AvatarFallback 
                className="text-white shadow-inner border border-primary/20"
                style={{ 
                  background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))` 
                }}
              >
                <User className="h-4 w-4 drop-shadow-sm" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start leading-tight">
              <span className="truncate font-medium text-sm text-foreground/90 group-hover:text-foreground">
                {userInfo?.name || "用户"}
              </span>
            </div>
            <ChevronsUpDown className="size-3 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-lg"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2.5 px-1 py-2 text-left text-sm">
              <Avatar className="h-9 w-9 border-2 border-background shadow-lg">
                <AvatarFallback 
                  className="text-white shadow-inner border border-primary/20"
                  style={{ 
                    background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))` 
                  }}
                >
                  <User className="h-5 w-5 drop-shadow-md" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {userInfo?.name || "用户"}
                </span>
                <span className="truncate text-xs text-muted-foreground/70">
                  {userInfo?.code || ""}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => setShowPasswordDialog(true)}
              className="cursor-pointer"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              <span>修改密码</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowLogoutDialog(true)}
            className="text-red-600 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>退出登录</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 退出确认对话框 */}
      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="确认退出"
        description="您确定要退出登录吗？退出后需要重新登录才能访问系统。"
        confirmText="确认退出"
        cancelText="取消"
        onConfirm={handleLogout}
        type="danger"
        showWarning={false}
      />

      {/* 修改密码对话框 */}
      <CustomDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        header={<div className="text-lg font-normal">修改密码</div>}
        footer={
          <div className="flex justify-end gap-4 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              form="change-password-form"
              disabled={loading}
            >
              确定
            </Button>
          </div>
        }
        className="min-h-[50vh]"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-50">
            <LoadingSpinner />
          </div>
        )}

        <Form {...form}>
          <form
            id="change-password-form"
            onSubmit={form.handleSubmit(handlePasswordSubmit)}
            className={loading ? "pointer-events-none opacity-60" : ""}
            autoComplete="off"
          >
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem className="relative h-[70px]">
                    <div className="h-full space-y-2">
                      <FormLabel>
                        原密码 <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="请输入原密码"
                          disabled={loading}
                          autoComplete="current-password"
                        />
                      </FormControl>
                    </div>
                    <div className="absolute -bottom-6 left-0">
                      <FormMessage className="text-xs" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="relative h-[70px]">
                    <div className="h-full space-y-2">
                      <FormLabel>
                        新密码 <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="请输入新密码"
                          disabled={loading}
                          autoComplete="new-password"
                        />
                      </FormControl>
                    </div>
                    <div className="absolute -bottom-6 left-0">
                      <FormMessage className="text-xs" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="relative h-[70px]">
                    <div className="h-full space-y-2">
                      <FormLabel>
                        确认密码 <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="请再次输入新密码"
                          disabled={loading}
                          autoComplete="new-password"
                        />
                      </FormControl>
                    </div>
                    <div className="absolute -bottom-6 left-0">
                      <FormMessage className="text-xs" />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-8 text-sm text-muted-foreground">
              密码需包含：数字、大小写字母、特殊字符，位数至少8位，特殊字符须在&quot;!
              @ # $ %&quot;范围内选择。
            </div>
          </form>
        </Form>
      </CustomDialog>
    </>
  )
})
