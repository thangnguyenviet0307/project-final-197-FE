import type { ComponentType } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/router/protected-route";

function page(load: () => Promise<{ default: ComponentType }>) {
  return async () => ({ Component: (await load()).default });
}

export const routes: RouteObject[] = [
  { path: "/", element: <Navigate to="/admin/dashboard" replace /> },
  { path: "/landing", lazy: page(() => import("@/pages/public/landing/page")) },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", lazy: page(() => import("@/pages/auth/sign-in/page")) },
      {
        path: "/forgot-password",
        lazy: page(() => import("@/pages/auth/forgot-password/page")),
      },
    ],
  },
  // Existing template links remain usable; no public registration is exposed.
  ...[
    "/auth/sign-in",
    "/auth/sign-in-2",
    "/auth/sign-in-3",
    "/sign-in",
    "/auth/sign-up",
    "/auth/sign-up-2",
    "/auth/sign-up-3",
    "/register",
  ].map((path) => ({ path, element: <Navigate to="/login" replace /> })),
  ...[
    "/auth/forgot-password",
    "/auth/forgot-password-2",
    "/auth/forgot-password-3",
  ].map((path) => ({
    path,
    element: <Navigate to="/forgot-password" replace />,
  })),
  {
    element: <ProtectedRoute allowedRoles={["admin", "staff"]} />,
    children: [
      {
        path: "/admin/dashboard",
        lazy: page(() => import("@/pages/admin/dashboard/page")),
      },
      {
        path: "/dashboard",
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "/dashboard-2",
        lazy: page(() => import("@/pages/admin/dashboard-2/page")),
      },
      { path: "/mail", lazy: page(() => import("@/pages/template/mail/page")) },
      { path: "/tasks", lazy: page(() => import("@/pages/template/tasks/page")) },
      { path: "/chat", lazy: page(() => import("@/pages/template/chat/page")) },
      { path: "/calendar", lazy: page(() => import("@/pages/template/calendar/page")) },
      { path: "/faqs", lazy: page(() => import("@/pages/template/faqs/page")) },
      { path: "/pricing", element: <Navigate to="/admin/dashboard" replace /> },
      {
        path: "/categories",
        lazy: page(() => import("@/pages/admin/categories/index")),
      },
      { path: "/products", lazy: page(() => import("@/pages/admin/products/index")) },
      { path: "/orders", lazy: page(() => import("@/pages/admin/orders/index")) },
      { path: "/orders/:id", lazy: page(() => import("@/pages/admin/orders/detail")) },
      {
        path: "/products/:id",
        lazy: page(() => import("@/pages/admin/products/detail")),
      },
      {
        path: "/admin/categories",
        element: <Navigate to="/categories" replace />,
      },
      {
        path: "/change-password",
        lazy: page(() => import("@/pages/auth/change-password")),
      },
      {
        path: "/settings/user",
        lazy: page(() => import("@/pages/admin/settings/user/page")),
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
        lazy: page(() => import("@/pages/admin/settings/appearance/page")),
      },
      {
        path: "/settings/notifications",
        lazy: page(() => import("@/pages/admin/settings/notifications/page")),
      },
      {
        path: "/settings/connections",
        lazy: page(() => import("@/pages/admin/settings/connections/page")),
      },
      {
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
          { path: "/categories/new", lazy: page(() => import("@/pages/admin/categories/create")) },
          { path: "/brands/new", lazy: page(() => import("@/pages/admin/brands/create")) },
          { path: "/users/new", lazy: page(() => import("@/pages/admin/users/create")) },
          {
            path: "/products/new",
            lazy: page(() => import("@/pages/admin/products/create")),
          },
          {
            path: "/products/:id/edit",
            lazy: page(() => import("@/pages/admin/products/edit")),
          },
          { path: "/users", lazy: page(() => import("@/pages/admin/users/page")) },
          { path: "/brands", lazy: page(() => import("@/pages/admin/brands/index")) },
          { path: "/customers", lazy: page(() => import("@/pages/admin/customers/index")) },
          { path: "/admin/users", element: <Navigate to="/users" replace /> },
        ],
      },
    ],
  },
  { path: "/403", lazy: page(() => import("@/pages/errors/forbidden/page")) },
  { path: "/errors/forbidden", element: <Navigate to="/403" replace /> },
  {
    path: "/errors/unauthorized",
    lazy: page(() => import("@/pages/errors/unauthorized/page")),
  },
  {
    path: "/errors/not-found",
    lazy: page(() => import("@/pages/errors/not-found/page")),
  },
  {
    path: "/errors/internal-server-error",
    lazy: page(() => import("@/pages/errors/internal-server-error/page")),
  },
  {
    path: "/errors/under-maintenance",
    lazy: page(() => import("@/pages/errors/under-maintenance/page")),
  },
  { path: "*", lazy: page(() => import("@/pages/errors/not-found/page")) },
];
