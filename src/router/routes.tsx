import type { ComponentType } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { StoreLayout } from '@/layout/storefront/store-layout';
import { AccountLayout } from '@/layout/storefront/account-layout';

import { ProtectedRoute } from '@/router/protected-route';
import { PublicOnlyRoute } from '@/router/public-only-route';
import { LegacyAdminRedirect } from '@/router/legacy-admin-redirect';
import { managedDocuments } from '@/features/support/utils/managed-documents';

function page(load: () => Promise<{ default: ComponentType }>) {
  return async () => ({
    Component: (await load()).default,
  });
}

export const routes: RouteObject[] = [
  // ==========================================
  // STOREFRONT
  // ==========================================
  {
    element: <StoreLayout />,
    handle: { area: 'storefront' },
    children: [
      ...managedDocuments.map((document) => ({
        path: document.path,
        lazy: page(() => import('@/pages/storefront/support/document')),
      })),
      {
        path: '/',
        lazy: page(() => import('@/pages/storefront/home/index')),
      },

      {
        path: '/bai-viet',
        lazy: page(() => import('@/pages/storefront/articles/index')),
      },
      {
        path: '/about',
        element: <Navigate to="/gioi-thieu" replace />,
      },
      {
        path: '/faq',
        element: <Navigate to="/cau-hoi-thuong-gap" replace />,
      },
      {
        path: '/bai-viet/:slug',
        lazy: page(() => import('@/pages/storefront/articles/detail')),
      },
      {
        path: '/shop',
        lazy: page(() => import('@/pages/storefront/products/index')),
      },
      {
        path: '/shop/:slug',
        lazy: page(() => import('@/pages/storefront/products/detail')),
      },
      {
        path: '/contact',
        lazy: page(() => import('@/pages/storefront/contact/index')),
      },
      {
        path: '/cart',
        lazy: page(() => import('@/pages/storefront/cart/index')),
      },
      {
        path: '/checkout',
        lazy: page(() => import('@/pages/storefront/checkout/index')),
      },

      {
        element: <PublicOnlyRoute storefront />,
        children: [
          {
            path: '/quen-mat-khau',
            lazy: page(() => import('@/pages/storefront/auth/forgot-password')),
          },
          {
            path: '/thanh-vien',
            lazy: page(() => import('@/pages/storefront/auth/member')),
          },
          {
            path: '/account/login',
            element: <Navigate to="/thanh-vien?act=login" replace />,
          },
          {
            path: '/register',
            element: <Navigate to="/thanh-vien?act=register" replace />,
          },
        ],
      },
      // Customer account requires a customer session.
      {
        element: <ProtectedRoute storefront />,
        children: [
          {
            path: '/account',
            element: <AccountLayout />,
            children: [
              {
                index: true,
                element: <Navigate to="profile" replace />,
              },
              {
                path: 'profile',
                lazy: page(() => import('@/pages/storefront/account/profile')),
              },
              {
                path: 'orders',
                lazy: page(() => import('@/pages/storefront/account/orders')),
              },
              {
                path: 'warranty',
                lazy: page(() => import('@/pages/storefront/account/warranty')),
              },
              {
                path: 'addresses',
                lazy: page(
                  () => import('@/pages/storefront/account/addresses')
                ),
              },
              {
                path: 'change-password',
                lazy: page(
                  () => import('@/pages/storefront/account/change-password')
                ),
              },
            ],
          },
        ],
      },
    ],
  },

  // ==========================================
  // ADMIN / STAFF LOGIN
  // ==========================================
  {
    element: <PublicOnlyRoute />,
    handle: { area: 'admin' },
    children: [
      {
        path: '/auth/login',
        lazy: page(() => import('@/pages/auth/sign-in/page')),
      },
      {
        path: '/auth/forgot-password',
        lazy: page(() => import('@/pages/auth/forgot-password/page')),
      },
    ],
  },

  // Common existing login bookmarks still resolve to the canonical login page.
  ...['/auth/sign-in', '/sign-in'].map((path) => ({
    path,
    element: <Navigate to="/auth/login" replace />,
  })),

  // ==========================================
  // ADMIN / STAFF PROTECTED ROUTES
  // ==========================================
  {
    element: (
      <ProtectedRoute allowedRoles={['super_admin', 'admin', 'staff']} />
    ),
    handle: { area: 'admin' },
    children: [
      {
        path: '/auth/customers',
        lazy: page(() => import('@/pages/admin/customers/index')),
      },
      {
        path: '/auth/warranties',
        lazy: page(() => import('@/pages/admin/support/warranties')),
      },
      // MAIN DASHBOARD
      {
        path: '/auth/dashboard',
        lazy: page(() => import('@/pages/admin/dashboard/page')),
      },
      // CATEGORIES
      {
        path: '/auth/categories',
        lazy: page(() => import('@/pages/admin/categories/index')),
      },

      // PRODUCTS
      {
        path: '/auth/products',
        lazy: page(() => import('@/pages/admin/products/index')),
      },
      {
        path: '/auth/products/:id',
        lazy: page(() => import('@/pages/admin/products/detail')),
      },
      {
        path: '/auth/products/:id/inventory',
        lazy: page(() => import('@/pages/admin/products/inventory')),
      },

      {
        path: '/auth/brands',
        lazy: page(() => import('@/pages/admin/brands/index')),
      },
      // ORDERS
      {
        path: '/auth/orders/new',
        lazy: page(() => import('@/pages/admin/orders/create')),
      },
      {
        path: '/auth/orders',
        lazy: page(() => import('@/pages/admin/orders/index')),
      },
      {
        path: '/auth/orders/:id',
        lazy: page(() => import('@/pages/admin/orders/detail')),
      },

      // CHANGE PASSWORD - ADMIN / STAFF
      {
        path: '/auth/change-password',
        lazy: page(() => import('@/pages/auth/change-password')),
      },

      // SETTINGS
      {
        path: '/auth/settings/user',
        lazy: page(() => import('@/pages/admin/settings/user/page')),
      },

      // ======================================
      // ADMIN ONLY
      // ======================================
      {
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin']} />,
        children: [
          {
            path: '/auth/articles',
            lazy: page(() => import('@/pages/admin/articles')),
          },
          {
            path: '/auth/policies',
            lazy: page(() => import('@/pages/admin/support/documents')),
          },
          ...managedDocuments.map((document) => ({
            path: `/auth/policies/${document.key}`,
            lazy: page(() => import('@/pages/admin/support/document-editor')),
          })),
          {
            path: '/auth/post-categories',
            lazy: page(() => import('@/pages/admin/post-categories')),
          },
          {
            path: '/auth/hero-slides',
            lazy: page(() => import('@/pages/admin/hero-slides')),
          },
          // CATEGORIES
          {
            path: '/auth/categories/new',
            lazy: page(() => import('@/pages/admin/categories/create')),
          },

          // BRANDS
          {
            path: '/auth/brands/new',
            lazy: page(() => import('@/pages/admin/brands/create')),
          },

          // CUSTOMERS

          // USERS
          {
            path: '/auth/users',
            lazy: page(() => import('@/pages/admin/users/page')),
          },
          {
            path: '/auth/users/new',
            lazy: page(() => import('@/pages/admin/users/create')),
          },

          // PRODUCTS MANAGEMENT
          {
            path: '/auth/products/new',
            lazy: page(() => import('@/pages/admin/products/create')),
          },
          {
            path: '/auth/products/:id/edit',
            lazy: page(() => import('@/pages/admin/products/edit')),
          },
        ],
      },
    ],
  },

  // ==========================================
  // ERROR PAGES
  // ==========================================
  {
    path: '/403',
    lazy: page(() => import('@/pages/errors/forbidden/page')),
  },
  {
    path: '/errors/forbidden',
    element: <Navigate to="/403" replace />,
  },

  // Old bookmarks resolve to the canonical admin URL before any protected page renders.
  ...[
    'dashboard',
    'products',
    'categories',
    'brands',
    'orders',
    'users',
    'customers',
    'settings',
    'login',
    'forgot-password',
    'change-password',
  ].map((segment) => ({
    path: `/${segment}/*`,
    handle: { area: 'admin' },
    element: <LegacyAdminRedirect />,
  })),
  {
    path: '/admin/*',
    handle: { area: 'admin' },
    element: <LegacyAdminRedirect />,
  },
  {
    path: '/auth',
    handle: { area: 'admin' },
    element: <Navigate to="/auth/dashboard" replace />,
  },
  {
    path: '/auth/*',
    handle: { area: 'admin' },
    lazy: page(() => import('@/pages/errors/not-found/page')),
  },

  {
    path: '/auth/403',
    handle: { area: 'admin' },
    lazy: page(() => import('@/pages/errors/forbidden/page')),
  },

  // Storefront fallback keeps the store shell and route-area metadata.
  {
    element: <StoreLayout />,
    handle: { area: 'storefront' },
    children: [
      {
        path: '/errors/not-found',
        lazy: page(() => import('@/pages/storefront/not-found')),
      },
      { path: '*', lazy: page(() => import('@/pages/storefront/not-found')) },
    ],
  },
];
