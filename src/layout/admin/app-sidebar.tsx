"use client"
import { isAdministrator } from "@/features/auth/utils/roles"

import * as React from "react"
import {
  Newspaper,
  LayoutDashboard,
  Shield,
  AlertTriangle,
  Settings,
  LayoutTemplate,
  Tags,
  Users,
  UserRound,
  FolderTree,
  Package,
  ShoppingBag,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { Link } from "react-router-dom"
import { Logo } from "@/components/logo"

import { NavMain } from "@/layout/admin/nav-main"
import { NavUser } from "@/layout/admin/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "ShadcnStore",
    email: "store@example.com",
    avatar: "",
  },
  navGroups: [
    {
      label: "Tổng quan",
      items: [
        {
          title: "Bảng điều khiển",
          url: "/auth/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Ứng dụng",
      items: [
        {
          title: "Danh mục",
          url: "/auth/categories",
          icon: FolderTree,
        },
        { title: "Tin tức & Blog", url: "/auth/articles", icon: Newspaper, items: [{ title: "Bài viết", url: "/auth/articles" }, { title: "Danh mục bài viết", url: "/auth/post-categories" }] },
        { title: "Sản phẩm", url: "/auth/products", icon: Package },
        { title: "Đơn hàng", url: "/auth/orders", icon: ShoppingBag },
        {
          title: "Người dùng",
          url: "/auth/users",
          icon: Users,
        },
        {
          title: "Thương hiệu",
          url: "/auth/brands",
          icon: Tags,
        },
        {
          title: "Khách hàng",
          url: "/auth/customers",
          icon: UserRound,
        },
      ],
    },
    {
      label: "Các trang",
      items: [
        {
          title: "Trang Bán hàng",
          url: "/",
          target: "_blank",
          icon: LayoutTemplate,
        },
        {
          title: "Trang xác thực",
          url: "#",
          icon: Shield,
          items: [
            {
              title: "Đăng nhập 1",
              url: "/auth/sign-in",
            },
            {
              title: "Đăng nhập 2",
              url: "/auth/sign-in-2",
            },
            {
              title: "Đăng nhập 3",
              url: "/auth/sign-in-3",
            },
            {
              title: "Đăng ký 1",
              url: "/auth/sign-up",
            },
            {
              title: "Đăng ký 2",
              url: "/auth/sign-up-2",
            },
            {
              title: "Đăng ký 3",
              url: "/auth/sign-up-3",
            },
            {
              title: "Quên mật khẩu 1",
              url: "/auth/forgot-password",
            },
            {
              title: "Quên mật khẩu 2",
              url: "/auth/forgot-password-2",
            },
            {
              title: "Quên mật khẩu 3",
              url: "/auth/forgot-password-3",
            },
          ],
        },
        {
          title: "Trang lỗi",
          url: "#",
          icon: AlertTriangle,
          items: [
            {
              title: "Chưa xác thực",
              url: "/errors/unauthorized",
            },
            {
              title: "Không có quyền truy cập",
              url: "/errors/forbidden",
            },
            {
              title: "Không tìm thấy",
              url: "/errors/not-found",
            },
            {
              title: "Lỗi máy chủ",
              url: "/errors/internal-server-error",
            },
            {
              title: "Đang bảo trì",
              url: "/errors/under-maintenance",
            },
          ],
        },
        {
          title: "Cài đặt",
          url: "#",
          icon: Settings,
          items: [
            {
              title: "Hồ sơ người dùng",
              url: "/auth/settings/user",
            },
          ],
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user)
  
  const groups = data.navGroups.map((group) => ({
  ...group,
   items: group.items.filter(
    (item) =>
      item.title !== "Trang xác thực" &&
      item.title !== "Trang lỗi" &&
      (!["/auth/users", "/auth/hero-slides", "/auth/articles", "/auth/post-categories"].includes(item.url) ||
       isAdministrator(user?.role))
    ).map(item => item.url === "/auth/categories" && isAdministrator(user?.role) ? {
      ...item,
      items: [
        { title: "Danh sách danh mục", url: "/auth/categories" },
        { title: "Hero trang chủ", url: "/auth/hero-slides" },
      ],
    } : item),
  }))

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/auth/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Logo size={24} className="text-current" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">ShadcnStore</span>
                <span className="truncate text-xs">Quản trị cửa hàng</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={{ name: user.name, email: user.email, avatar: user.avatar || "" }} />}
      </SidebarFooter>
    </Sidebar>
  )
}
