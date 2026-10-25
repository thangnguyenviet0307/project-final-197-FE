"use client"

import { useNavigate } from "react-router-dom"
import {
  Search,
  Package,
  LayoutDashboard,
  Mail,
  CheckSquare,
  MessageCircle,
  Calendar,
  Shield,
  AlertTriangle,
  HelpCircle,
  Users,
  User,
  Bell,
  Link2,
  Palette,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import { useAuthStore } from "@/stores/auth.store"

interface SearchItem {
  title: string
  url: string
  group: string
  icon?: LucideIcon
}

interface CommandSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const navigate = useNavigate()
  const role = useAuthStore((state) => state.user?.role)

  const searchItems: SearchItem[] = [
    // Overview
    {
      title: "Bảng điều khiển",
      url: "/admin/dashboard",
      group: "Tổng quan",
      icon: LayoutDashboard,
    },

    // Apps
    { title: "Sản phẩm", url: "/products", group: "Ứng dụng", icon: Package },
    { title: "Đơn hàng", url: "/orders", group: "Ứng dụng", icon: Package },
    { title: "Danh mục", url: "/categories", group: "Ứng dụng", icon: Package },
    { title: "Thương hiệu", url: "/brands", group: "Ứng dụng", icon: Package },
    { title: "Khách hàng", url: "/customers", group: "Ứng dụng", icon: Users },
    { title: "Thư", url: "/mail", group: "Ứng dụng", icon: Mail },
    { title: "Công việc", url: "/tasks", group: "Ứng dụng", icon: CheckSquare },
    { title: "Trò chuyện", url: "/chat", group: "Ứng dụng", icon: MessageCircle },
    { title: "Lịch", url: "/calendar", group: "Ứng dụng", icon: Calendar },
    { title: "Quản lý người dùng", url: "/users", group: "Ứng dụng", icon: Users },
    { title: "Đổi mật khẩu", url: "/change-password", group: "Cài đặt", icon: Shield },

    // Auth Pages
    {
      title: "Đăng nhập 1",
      url: "/auth/sign-in",
      group: "Trang xác thực",
      icon: Shield,
    },
    {
      title: "Đăng nhập 2",
      url: "/auth/sign-in-2",
      group: "Trang xác thực",
      icon: Shield,
    },
    {
      title: "Đăng ký 1",
      url: "/auth/sign-up",
      group: "Trang xác thực",
      icon: Shield,
    },
    {
      title: "Đăng ký 2",
      url: "/auth/sign-up-2",
      group: "Trang xác thực",
      icon: Shield,
    },
    {
      title: "Quên mật khẩu 1",
      url: "/auth/forgot-password",
      group: "Trang xác thực",
      icon: Shield,
    },
    {
      title: "Quên mật khẩu 2",
      url: "/auth/forgot-password-2",
      group: "Trang xác thực",
      icon: Shield,
    },

    // Errors
    {
      title: "Chưa xác thực",
      url: "/errors/unauthorized",
      group: "Trang lỗi",
      icon: AlertTriangle,
    },
    {
      title: "Không có quyền truy cập",
      url: "/errors/forbidden",
      group: "Trang lỗi",
      icon: AlertTriangle,
    },
    {
      title: "Không tìm thấy",
      url: "/errors/not-found",
      group: "Trang lỗi",
      icon: AlertTriangle,
    },
    {
      title: "Lỗi máy chủ",
      url: "/errors/internal-server-error",
      group: "Trang lỗi",
      icon: AlertTriangle,
    },
    {
      title: "Đang bảo trì",
      url: "/errors/under-maintenance",
      group: "Trang lỗi",
      icon: AlertTriangle,
    },

    // Settings
    {
      title: "Hồ sơ người dùng",
      url: "/settings/user",
      group: "Cài đặt",
      icon: User,
    },
    {
      title: "Giao diện",
      url: "/settings/appearance",
      group: "Cài đặt",
      icon: Palette,
    },
    {
      title: "Thông báo",
      url: "/settings/notifications",
      group: "Cài đặt",
      icon: Bell,
    },
    {
      title: "Kết nối",
      url: "/settings/connections",
      group: "Cài đặt",
      icon: Link2,
    },

    // Pages
    { title: "Câu hỏi thường gặp", url: "/faqs", group: "Các trang", icon: HelpCircle },
  ]

  const groupedItems = searchItems.filter((item) =>
    item.group !== "Trang xác thực" && item.group !== "Trang lỗi" &&
    (!["/users", "/brands", "/customers"].includes(item.url) || role === "admin")
  ).reduce(
    (acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = []
      }
      acc[item.group].push(item)
      return acc
    },
    {} as Record<string, SearchItem[]>
  )

  const handleSelect = (url: string) => {
    navigate(url)
    onOpenChange(false)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Tìm kiếm nhanh"
      description="Tìm trang và cài đặt"
      className="sm:max-w-[640px]"
    >
      <Command>
        <CommandInput placeholder="Bạn cần tìm gì?" autoFocus />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
          {Object.entries(groupedItems).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => {
                const Icon = item.icon
                return (
                  <CommandItem
                    key={item.url}
                    value={item.title}
                    onSelect={() => handleSelect(item.url)}
                  >
                    {Icon && <Icon />}
                    {item.title}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="relative w-full justify-start font-normal text-muted-foreground sm:pr-12 md:w-36 lg:w-56"
    >
      <Search data-icon="inline-start" />
      Tìm kiếm...
      <Kbd className="absolute top-1/2 right-1.5 hidden -translate-y-1/2 sm:inline-flex">
        ⌘K
      </Kbd>
    </Button>
  )
}
