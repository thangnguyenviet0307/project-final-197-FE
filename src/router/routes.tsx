
import type { ComponentType } from "react"
import { Navigate, type RouteObject } from "react-router-dom"

import { StoreLayout } from "@/layout/storefront/store-layout"
import { AccountLayout } from "@/layout/storefront/account-layout"

import { ProtectedRoute } from "@/router/protected-route"
import { PublicOnlyRoute } from "@/router/public-only-route"
import { LegacyAdminRedirect } from "@/router/legacy-admin-redirect"

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
    handle: { area: "storefront" },
    children: [
      {
        path: "/",
        lazy: page(() => import("@/pages/storefront/home/index")),
      },
      {
        path: "/landing",
        lazy: page(() => import("@/pages/public/landing/page")),
      },
      {
        path: "/bai-viet/:slug",
        lazy: page(() => import("@/pages/storefront/articles/detail")),
      },
      {
        path: "/shop",
        lazy: page(() => import("@/pages/storefront/products/index")),
      },
      {
        path: "/shop/:slug",
        lazy: page(() => import("@/pages/storefront/products/detail")),
      },
      {
        path: "/contact",
        lazy: page(() => import("@/pages/storefront/contact/index")),
      },

      {
        element: <PublicOnlyRoute storefront />,
        children: [
          { path: "/thanh-vien", lazy: page(() => import("@/pages/storefront/auth/member")) },
          { path: "/account/login", element: <Navigate to="/thanh-vien?act=login" replace /> },
          { path: "/register", element: <Navigate to="/thanh-vien?act=register" replace /> },
        ],
      },
      // Customer account requires a customer session.
      {
        element: <ProtectedRoute storefront />,
        children: [
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
    ],
  },

  // ==========================================
  // ADMIN / STAFF LOGIN
  // ==========================================
  {
    element: <PublicOnlyRoute />,
    handle: { area: "admin" },
    children: [
      {
        path: "/auth/login",
        lazy: page(() =>
          import("@/pages/auth/sign-in/page")
        ),
      },
      {
        path: "/auth/forgot-password",
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
    element: <Navigate to="/auth/login" replace />,
  })),

  ...[
    "/auth/forgot-password-2",
    "/auth/forgot-password-3",
  ].map((path) => ({
    path,
    element: <Navigate to="/auth/forgot-password" replace />,
  })),

  // ==========================================
  // ADMIN / STAFF PROTECTED ROUTES
  // ==========================================
  {
    element: <ProtectedRoute allowedRoles={["admin", "staff"]} />,
    handle: { area: "admin" },
    children: [
      { path: "/auth/customers", lazy: page(() => import("@/pages/admin/customers/index")) },
      // MAIN DASHBOARD
      {
        path: "/auth/dashboard",
        lazy: page(() =>
          import("@/pages/admin/dashboard/page")
        ),
      },

      // OLD DASHBOARD URL

      {
        path: "/auth/dashboard-2",
        element: <Navigate to="/auth/dashboard" replace />,
      },

      // TEMPLATE PAGES
      {
        path: "/auth/faqs",
        lazy: page(() =>
          import("@/pages/template/faqs/page")
        ),
      },
      {
        path: "/auth/pricing",
        element: <Navigate to="/auth/dashboard" replace />,
      },

      // CATEGORIES
      {
        path: "/auth/categories",
        lazy: page(() =>
          import("@/pages/admin/categories/index")
        ),
      },

      // PRODUCTS
      {
        path: "/auth/products",
        lazy: page(() =>
          import("@/pages/admin/products/index")
        ),
      },
      {
        path: "/auth/products/:id",
        lazy: page(() =>
          import("@/pages/admin/products/detail")
        ),
      },

      { path: "/auth/brands", lazy: page(() => import("@/pages/admin/brands/index")) },
      // ORDERS
      { path: "/auth/orders/new", lazy: page(() => import("@/pages/admin/orders/create")) },
      {
        path: "/auth/orders",
        lazy: page(() =>
          import("@/pages/admin/orders/index")
        ),
      },
      {
        path: "/auth/orders/:id",
        lazy: page(() =>
          import("@/pages/admin/orders/detail")
        ),
      },

      // CHANGE PASSWORD - ADMIN / STAFF
      {
        path: "/auth/change-password",
        lazy: page(() =>
          import("@/pages/auth/change-password")
        ),
      },

      // SETTINGS
      {
        path: "/auth/settings/user",
        lazy: page(() =>
          import("@/pages/admin/settings/user/page")
        ),
      },
      {
        path: "/auth/settings/account",
        element: <Navigate to="/auth/settings/user" replace />,
      },
      {
        path: "/auth/settings/billing",
        element: <Navigate to="/auth/settings/user" replace />,
      },
      {
        path: "/auth/settings/appearance",
        lazy: page(() =>
          import("@/pages/admin/settings/appearance/page")
        ),
      },
      {
        path: "/auth/settings/notifications",
        lazy: page(() =>
          import("@/pages/admin/settings/notifications/page")
        ),
      },
      {
        path: "/auth/settings/connections",
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
            path: "/auth/categories/new",
            lazy: page(() =>
              import("@/pages/admin/categories/create")
            ),
          },

          // BRANDS
          {
            path: "/auth/brands/new",
            lazy: page(() =>
              import("@/pages/admin/brands/create")
            ),
          },

          // CUSTOMERS


          // USERS
          {
            path: "/auth/users",
            lazy: page(() =>
              import("@/pages/admin/users/page")
            ),
          },
          {
            path: "/auth/users/new",
            lazy: page(() =>
              import("@/pages/admin/users/create")
            ),
          },

          // PRODUCTS MANAGEMENT
          {
            path: "/auth/products/new",
            lazy: page(() =>
              import("@/pages/admin/products/create")
            ),
          },
          {
            path: "/auth/products/:id/edit",
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

  // Old bookmarks resolve to the canonical admin URL before any protected page renders.
  ...["dashboard", "dashboard-2", "products", "categories", "brands", "orders", "users", "customers", "settings", "login", "forgot-password", "change-password", "faqs", "pricing"].map(segment => ({ path: `/${segment}/*`, handle: { area: "admin" }, element: <LegacyAdminRedirect /> })),
  { path: "/admin/*", handle: { area: "admin" }, element: <LegacyAdminRedirect /> },
  { path: "/auth", handle: { area: "admin" }, element: <Navigate to="/auth/dashboard" replace /> },
  { path: "/auth/*", handle: { area: "admin" }, lazy: page(() => import("@/pages/errors/not-found/page")) },

  {
    path: "/auth/403",
    handle: { area: "admin" },
    lazy: page(() => import("@/pages/errors/forbidden/page")),
  },

  // Storefront fallback keeps the store shell and route-area metadata.
  {
    element: <StoreLayout />,
    handle: { area: "storefront" },
    children: [
      { path: "/errors/not-found", lazy: page(() => import("@/pages/storefront/not-found")) },
      { path: "*", lazy: page(() => import("@/pages/storefront/not-found")) },
    ],
  },
]
