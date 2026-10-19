import type { ComponentType } from "react"
import { Navigate, type RouteObject } from "react-router-dom"
import { ProtectedRoute, PublicOnlyRoute } from "@/components/router/protected-route"

function page(load: () => Promise<{ default: ComponentType }>) {
  return async () => ({ Component: (await load()).default })
}

export const routes: RouteObject[] = [
  { path: "/", element: <Navigate to="/admin/dashboard" replace /> },
  { path: "/landing", lazy: page(() => import("@/app/landing/page")) },
  { element: <PublicOnlyRoute />, children: [
    { path: "/login", lazy: page(() => import("@/app/auth/sign-in/page")) },
    { path: "/forgot-password", lazy: page(() => import("@/app/auth/forgot-password/page")) },
  ] },
  // Existing template links remain usable; no public registration is exposed.
  ...["/auth/sign-in", "/auth/sign-in-2", "/auth/sign-in-3", "/sign-in", "/auth/sign-up", "/auth/sign-up-2", "/auth/sign-up-3", "/register"].map((path) => ({ path, element: <Navigate to="/login" replace /> })),
  ...["/auth/forgot-password", "/auth/forgot-password-2", "/auth/forgot-password-3"].map((path) => ({ path, element: <Navigate to="/forgot-password" replace /> })),
  { element: <ProtectedRoute allowedRoles={["admin", "staff"]} />, children: [
    { path: "/admin/dashboard", lazy: page(() => import("@/app/dashboard/page")) },
    { path: "/dashboard", element: <Navigate to="/admin/dashboard" replace /> },
    { path: "/dashboard-2", lazy: page(() => import("@/app/dashboard-2/page")) },
    { path: "/mail", lazy: page(() => import("@/app/mail/page")) },
    { path: "/tasks", lazy: page(() => import("@/app/tasks/page")) },
    { path: "/chat", lazy: page(() => import("@/app/chat/page")) },
    { path: "/calendar", lazy: page(() => import("@/app/calendar/page")) },
    { path: "/faqs", lazy: page(() => import("@/app/faqs/page")) },
    { path: "/pricing", element: <Navigate to="/admin/dashboard" replace /> },
    { path: "/categories", lazy: page(() => import("@/pages/admin-categories")) },
    { path: "/admin/categories", element: <Navigate to="/categories" replace /> },
    { path: "/change-password", lazy: page(() => import("@/pages/change-password")) },
    { path: "/settings/user", lazy: page(() => import("@/app/settings/user/page")) },
    { path: "/settings/account", element: <Navigate to="/settings/user" replace /> },
    { path: "/settings/billing", element: <Navigate to="/settings/user" replace /> },
    { path: "/settings/appearance", lazy: page(() => import("@/app/settings/appearance/page")) },
    { path: "/settings/notifications", lazy: page(() => import("@/app/settings/notifications/page")) },
    { path: "/settings/connections", lazy: page(() => import("@/app/settings/connections/page")) },
    { element: <ProtectedRoute allowedRoles={["admin"]} />, children: [
    { path: "/users", lazy: page(() => import("@/app/users/page")) },
    { path: "/admin/users", element: <Navigate to="/users" replace /> },
    { path: "/brands", lazy: page(() => import("@/app/brands/page")) },
    ] },

  ] },
  { path: "/403", lazy: page(() => import("@/app/errors/forbidden/page")) },
  { path: "/errors/forbidden", element: <Navigate to="/403" replace /> },
  { path: "/errors/unauthorized", lazy: page(() => import("@/app/errors/unauthorized/page")) },
  { path: "/errors/not-found", lazy: page(() => import("@/app/errors/not-found/page")) },
  { path: "/errors/internal-server-error", lazy: page(() => import("@/app/errors/internal-server-error/page")) },
  { path: "/errors/under-maintenance", lazy: page(() => import("@/app/errors/under-maintenance/page")) },
  { path: "*", lazy: page(() => import("@/app/errors/not-found/page")) },
]
