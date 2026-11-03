'use client';
import { isAdministrator } from '@/features/auth/utils/roles';
import {
  pendingInformationPages,
  policyDocuments,
} from '@/features/support/utils/policy-documents';

import { useNavigate } from 'react-router-dom';
import {
  Search,
  Package,
  LayoutDashboard,
  Shield,
  Users,
  User,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import { useAuthStore } from '@/stores/auth.store';

interface SearchItem {
  title: string;
  url: string;
  group: string;
  icon?: LucideIcon;
}

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);

  const searchItems: SearchItem[] = [
    {
      title: 'Chính sách cửa hàng',
      url: '/auth/policies',
      group: 'Ứng dụng',
      icon: Shield,
    },
    ...policyDocuments.map((document) => ({
      title: document.title,
      url: `/auth/policies/${document.key}`,
      group: 'Chính sách cửa hàng',
      icon: Shield,
    })),
    ...pendingInformationPages.map((document) => ({
      title: document.title,
      url: `/auth/policies/${document.slug}`,
      group: 'Chính sách cửa hàng',
      icon: Shield,
    })),
    {
      title: 'Yêu cầu bảo hành',
      url: '/auth/warranties',
      group: 'Ứng dụng',
      icon: Shield,
    },
    // Overview
    {
      title: 'Bảng điều khiển',
      url: '/auth/dashboard',
      group: 'Tổng quan',
      icon: LayoutDashboard,
    },

    // Apps
    {
      title: 'Tin tức & Blog',
      url: '/auth/articles',
      group: 'Ứng dụng',
      icon: Package,
    },
    {
      title: 'Danh mục bài viết',
      url: '/auth/post-categories',
      group: 'Ứng dụng',
      icon: Package,
    },
    {
      title: 'Danh mục: Hero trang chủ',
      url: '/auth/hero-slides',
      group: 'Ứng dụng',
      icon: Package,
    },
    {
      title: 'Sản phẩm',
      url: '/auth/products',
      group: 'Ứng dụng',
      icon: Package,
    },
    {
      title: 'Đơn hàng',
      url: '/auth/orders',
      group: 'Ứng dụng',
      icon: Package,
    },
    {
      title: 'Danh mục',
      url: '/auth/categories',
      group: 'Ứng dụng',
      icon: Package,
    },
    {
      title: 'Thương hiệu',
      url: '/auth/brands',
      group: 'Ứng dụng',
      icon: Package,
    },
    {
      title: 'Khách hàng',
      url: '/auth/customers',
      group: 'Ứng dụng',
      icon: Users,
    },
    {
      title: 'Quản lý người dùng',
      url: '/auth/users',
      group: 'Ứng dụng',
      icon: Users,
    },
    {
      title: 'Đổi mật khẩu',
      url: '/auth/change-password',
      group: 'Cài đặt',
      icon: Shield,
    },

    // Settings
    {
      title: 'Hồ sơ người dùng',
      url: '/auth/settings/user',
      group: 'Cài đặt',
      icon: User,
    },

    // Pages
  ];

  const groupedItems = searchItems
    .filter(
      (item) =>
        (!item.url.startsWith('/auth/policies/') || isAdministrator(role)) &&
        (![
          '/auth/users',
          '/auth/hero-slides',
          '/auth/articles',
          '/auth/post-categories',
          '/auth/policies',
        ].includes(item.url) ||
          isAdministrator(role))
    )
    .reduce(
      (acc, item) => {
        if (!acc[item.group]) {
          acc[item.group] = [];
        }
        acc[item.group].push(item);
        return acc;
      },
      {} as Record<string, SearchItem[]>
    );

  const handleSelect = (url: string) => {
    navigate(url);
    onOpenChange(false);
  };

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
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.url}
                    value={item.title}
                    onSelect={() => handleSelect(item.url)}
                  >
                    {Icon && <Icon />}
                    {item.title}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="text-muted-foreground relative w-full justify-start font-normal sm:pr-12 md:w-36 lg:w-56"
    >
      <Search data-icon="inline-start" />
      Tìm kiếm...
      <Kbd className="absolute top-1/2 right-1.5 hidden -translate-y-1/2 sm:inline-flex">
        ⌘K
      </Kbd>
    </Button>
  );
}
