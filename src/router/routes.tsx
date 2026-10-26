
import type { ComponentType } from "react"
import { Navigate, type RouteObject } from "react-router-dom"

import { StoreLayout } from "@/layout/storefront/store-layout"
import { AccountLayout } from "@/layout/storefront/account-layout"

import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/router/protected-route"

function page(load: () => Promise<{ default: ComponentType }>) {
  return async () => ({
    Component: (await load()).default,
  })
}

export const routes: RouteObject[] = [
  // ==========================================
  // STOREFRONT
  // ==========================================
  {
    element: <StoreLayout />,
    children: [
      {
        path: "/",
        lazy: page(() =>
          import("@/pages/storefront/home/index")
        ),
      },
      {
        path: "/landing",
        lazy: page(() =>
          import("@/pages/public/landing/page")
        ),
      },

      {
        path: "/contact",
        lazy: page(() =>
          import("@/pages/storefront/contact/index")
        ),
      },

      {
        element: <PublicOnlyRoute storefront />,
        children: [
          { path: "/account/login", lazy: page(() => import("@/pages/storefront/auth/login")) },
          { path: "/register", lazy: page(() => import("@/pages/storefront/auth/register")) },
        ],
      },
      // CUSTOMER ACCOUNT - UI PREVIEW
      {
        path: "/account",
        element: <AccountLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="profile" replace />,
          },
          {
            path: "profile",
            lazy: page(() =>
              import("@/pages/storefront/account/profile")
            ),
          },
          {
            path: "orders",
            lazy: page(() =>
              import("@/pages/storefront/account/orders")
            ),
          },
          {
            path: "addresses",
            lazy: page(() =>
              import("@/pages/storefront/account/addresses")
            ),
          },
          {
            path: "change-password",
            lazy: page(() =>
              import("@/pages/storefront/account/change-password")
            ),
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
    children: [
      {
        path: "/login",
        lazy: page(() =>
          import("@/pages/auth/sign-in/page")
        ),
      },
      {
        path: "/forgot-password",
        lazy: page(() =>
          import("@/pages/auth/forgot-password/page")
        ),
      },
    ],
  },

  // Compatibility redirects for existing auth URLs
  ...[
    "/auth/sign-in",
    "/auth/sign-in-2",
    "/auth/sign-in-3",
    "/sign-in",
    "/auth/sign-up",
    "/auth/sign-up-2",
    "/auth/sign-up-3",
  ].map((path) => ({
    path,
    element: <Navigate to="/login" replace />,
  })),

  ...[
    "/auth/forgot-password",
    "/auth/forgot-password-2",
    "/auth/forgot-password-3",
  ].map((path) => ({
    path,
    element: <Navigate to="/forgot-password" replace />,
  })),

  // ==========================================
  // ADMIN / STAFF PROTECTED ROUTES
  // ==========================================
  {
    element: <ProtectedRoute allowedRoles={["admin", "staff"]} />,
    children: [
      { path: "/customers", lazy: page(() => import("@/pages/admin/customers/index")) },
      // MAIN DASHBOARD
      {
        path: "/dashboard",
        lazy: page(() =>
          import("@/pages/admin/dashboard/page")
        ),
      },

      // OLD DASHBOARD URL
      {
        path: "/admin/dashboard",
        element: <Navigate to="/dashboard" replace />,
      },

      {
        path: "/dashboard-2",
        element: <Navigate to="/dashboard" replace />,
      },

      // TEMPLATE PAGES
      {
        path: "/faqs",
        lazy: page(() =>
          import("@/pages/template/faqs/page")
        ),
      },
      {
        path: "/pricing",
        element: <Navigate to="/dashboard" replace />,
      },

      // CATEGORIES
      {
        path: "/categories",
        lazy: page(() =>
          import("@/pages/admin/categories/index")
        ),
      },
      {
        path: "/admin/categories",
        element: <Navigate to="/categories" replace />,
      },

      // PRODUCTS
      {
        path: "/products",
        lazy: page(() =>
          import("@/pages/admin/products/index")
        ),
      },
      {
        path: "/products/:id",
        lazy: page(() =>
          import("@/pages/admin/products/detail")
        ),
      },

      { path: "/brands", lazy: page(() => import("@/pages/admin/brands/index")) },
      // ORDERS
      { path: "/orders/new", lazy: page(() => import("@/pages/admin/orders/create")) },
      {
        path: "/orders",
        lazy: page(() =>
          import("@/pages/admin/orders/index")
        ),
      },
      {
        path: "/orders/:id",
        lazy: page(() =>
          import("@/pages/admin/orders/detail")
        ),
      },

      // CHANGE PASSWORD - ADMIN / STAFF
      {
        path: "/change-password",
        lazy: page(() =>
          import("@/pages/auth/change-password")
        ),
      },

      // SETTINGS
      {
        path: "/settings/user",
        lazy: page(() =>
          import("@/pages/admin/settings/user/page")
        ),
      },
      {
        path: "/settings/account",
        element: <Navigate to="/settings/user" replace />,
      },
      {
        path: "/settings/billing",
        element: <Navigate to="/settings/user" replace />,
      },
      {
        path: "/settings/appearance",
        lazy: page(() =>
          import("@/pages/admin/settings/appearance/page")
        ),
      },
      {
        path: "/settings/notifications",
        lazy: page(() =>
          import("@/pages/admin/settings/notifications/page")
        ),
      },
      {
        path: "/settings/connections",
        lazy: page(() =>
          import("@/pages/admin/settings/connections/page")
        ),
      },

      // ======================================
      // ADMIN ONLY
      // ======================================
      {
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
          // CATEGORIES
          {
            path: "/categories/new",
            lazy: page(() =>
              import("@/pages/admin/categories/create")
            ),
          },

          // BRANDS
          {
            path: "/brands/new",
            lazy: page(() =>
              import("@/pages/admin/brands/create")
            ),
          },

          // CUSTOMERS


          // USERS
          {
            path: "/users",
            lazy: page(() =>
              import("@/pages/admin/users/page")
            ),
          },
          {
            path: "/users/new",
            lazy: page(() =>
              import("@/pages/admin/users/create")
            ),
          },
          {
            path: "/admin/users",
            element: <Navigate to="/users" replace />,
          },

          // PRODUCTS MANAGEMENT
          {
            path: "/products/new",
            lazy: page(() =>
              import("@/pages/admin/products/create")
            ),
          },
          {
            path: "/products/:id/edit",
            lazy: page(() =>
              import("@/pages/admin/products/edit")
            ),
          },
        ],
      },
    ],
  },

  // ==========================================
  // ERROR PAGES
  // ==========================================
  {
    path: "/403",
    lazy: page(() =>
      import("@/pages/errors/forbidden/page")
    ),
  },
  {
    path: "/errors/forbidden",
    element: <Navigate to="/403" replace />,
  },
  {
    path: "/errors/unauthorized",
    lazy: page(() =>
      import("@/pages/errors/unauthorized/page")
    ),
  },
  {
    path: "/errors/not-found",
    lazy: page(() =>
      import("@/pages/errors/not-found/page")
    ),
  },
  {
    path: "/errors/internal-server-error",
    lazy: page(() =>
      import("@/pages/errors/internal-server-error/page")
    ),
  },
  {
    path: "/errors/under-maintenance",
    lazy: page(() =>
      import("@/pages/errors/under-maintenance/page")
    ),
  },

  // 404 FALLBACK
  {
    path: "*",
    lazy: page(() =>
      import("@/pages/errors/not-found/page")
    ),
  },
]
