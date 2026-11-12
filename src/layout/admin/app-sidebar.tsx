'use client';
import { isAdministrator } from '@/features/auth/utils/roles';
import {
  pendingInformationPages,
  policyDocuments,
} from '@/features/support/utils/policy-documents';

import * as React from 'react';
import {
  Newspaper,
  LayoutDashboard,
  Shield,
  Settings,
  LayoutTemplate,
  Tags,
  Users,
  UserRound,
  FolderTree,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/logo';

import { NavMain } from '@/layout/admin/nav-main';
import { NavUser } from '@/layout/admin/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
  user: {
    name: 'ShadcnStore',
    email: 'store@example.com',
    avatar: '',
  },
  navGroups: [
    {
      label: 'Tổng quan',
      items: [
        {
          title: 'Bảng điều khiển',
          url: '/auth/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: 'Ứng dụng',
      items: [
        {
          title: 'Danh mục',
          url: '/auth/categories',
          icon: FolderTree,
        },
        {
          title: 'Thương hiệu',
          url: '/auth/brands',
          icon: Tags,
        },

        { title: 'Sản phẩm', url: '/auth/products', icon: Package },
        { title: 'Quản trị AI', url: '/auth/ai', icon: Shield },
        {
          title: 'Người dùng',
          url: '/auth/users',
          icon: Users,
        },
        {
          title: 'Khách hàng',
          url: '/auth/customers',
          icon: UserRound,
        },
        { title: 'Đơn hàng', url: '/auth/orders', icon: ShoppingBag },
        {
          title: 'Tin tức & Blog',
          url: '/auth/articles',
          icon: Newspaper,
          items: [
            { title: 'Bài viết', url: '/auth/articles' },
            { title: 'Danh mục bài viết', url: '/auth/post-categories' },
          ],
        },
        {
          title: 'Chính sách cửa hàng',
          url: '/auth/policies',
          icon: Shield,
          items: [
            { title: 'Tất cả chính sách', url: '/auth/policies' },
            ...policyDocuments.map((document) => ({
              title: document.title,
              url: `/auth/policies/${document.key}`,
            })),
            ...pendingInformationPages.map((document) => ({
              title: document.title,
              url: `/auth/policies/${document.slug}`,
            })),
          ],
        },
        { title: 'Yêu cầu bảo hành', url: '/auth/warranties', icon: Shield },
      ],
    },
    {
      label: 'Các trang',
      items: [
        {
          title: 'Trang Bán hàng',
          url: '/',
          target: '_blank',
          icon: LayoutTemplate,
        },
        {
          title: 'Cài đặt',
          url: '#',
          icon: Settings,
          items: [
            {
              title: 'Hồ sơ người dùng',
              url: '/auth/settings/user',
            },
          ],
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);

  const groups = data.navGroups.map((group) => ({
    ...group,
    items: group.items
      .filter(
        (item) =>
          ![
            '/auth/users',
            '/auth/hero-slides',
            '/auth/articles',
            '/auth/post-categories',
            '/auth/policies',
          ].includes(item.url) || isAdministrator(user?.role)
      )
      .map((item) =>
        item.url === '/auth/categories' && isAdministrator(user?.role)
          ? {
              ...item,
              items: [
                { title: 'Danh sách danh mục', url: '/auth/categories' },
                { title: 'Hero trang chủ', url: '/auth/hero-slides' },
              ],
            }
          : item
      ),
  }));

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/auth/dashboard" />}>
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
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
        {user && (
          <NavUser
            user={{
              name: user.name,
              email: user.email,
              avatar: user.avatar || '',
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
