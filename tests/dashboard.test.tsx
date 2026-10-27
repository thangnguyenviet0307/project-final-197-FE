import type { ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AxiosError, AxiosHeaders } from "axios";
import Dashboard from "@/pages/admin/dashboard/page";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("@/layout/admin/base-layout", () => ({
  BaseLayout: ({ children }: { children: ReactNode }) => (
    <main>{children}</main>
  ),
}));
const adapter = api.defaults.adapter;
const clients: QueryClient[] = [];
afterEach(() => {
  api.defaults.adapter = adapter;
  clients.splice(0).forEach((client) => client.clear());
  useAuthStore.getState().clearSession();
});

function setup({
  role = "admin",
  empty = false,
}: { role?: "admin" | "staff"; empty?: boolean } = {}) {
  useAuthStore
    .getState()
    .setSession(
      {
        id: "a".repeat(24),
        name: "Test",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        role,
        mustChangePassword: false,
      },
      { accessToken: "test-token" },
    );
  const state = { total: 42, failStatistics: false };
  const requests: { url?: string; params: unknown }[] = [];
  api.defaults.adapter = async (config) => {
    requests.push({ url: config.url, params: config.params });
    if (config.url === "/products/statistics" && state.failStatistics)
      throw new AxiosError("Network Error", "ERR_NETWORK", config);
    const data =
      config.url === "/orders/personal-sales"
        ? { data: { completedOrders: 0, revenue: 0 } }
        : config.url === "/products/statistics"
          ? {
              data: {
                total: empty ? 0 : state.total,
                active: 30,
                outOfStock: 2,
                stockUnits: 120,
              },
            }
          : config.url === "/products"
            ? {
                data: empty
                  ? []
                  : [
                      {
                        _id: "b".repeat(24),
                        product_name: "Phone case",
                        stock: 3,
                      },
                    ],
                pagination: { total: empty ? 0 : 8, totalPages: 2 },
              }
            : {
                data:
                  empty || config.params.orderStatus
                    ? []
                    : [
                        {
                          _id: "c".repeat(24),
                          orderCode: "ORD-ABC234",
                          customerSnapshot: {
                            firstName: "Jane",
                            lastName: "Smith",
                          },
                          orderStatus: 1,
                          orderDate: "2026-10-20T08:00:00Z",
                          totalAmount: 250000,
                        },
                      ],
                pagination: {
                  total: empty
                    ? 0
                    : config.params.orderStatus
                      ? ({ 1: 7, 2: 3, 3: 2, 4: 10 } as Record<number, number>)[
                          config.params.orderStatus
                        ]
                      : 22,
                },
              };
    return {
      config,
      headers: new AxiosHeaders(),
      status: 200,
      statusText: "OK",
      data,
    };
  };
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
  });
  clients.push(client);
  const view = () =>
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  return { state, client, requests, view };
}

it("uses server-wide counts and bounded recent/low-stock lists instead of demo data", async () => {
  const { view, requests } = setup();
  view();
  expect(
    await screen.findByRole("link", { name: "ORD-ABC234" }),
  ).toHaveProperty(
    "href",
    expect.stringContaining(`/orders/${"c".repeat(24)}`),
  );
  expect(screen.getByText("Jane Smith")).toBeTruthy();
  expect(
    within(screen.getByRole("region", { name: "Thống kê đơn hàng" })).getByText(
      "22",
    ),
  ).toBeTruthy();
  expect(
    within(screen.getByRole("region", { name: "Thống kê sản phẩm" })).getByText(
      "42",
    ),
  ).toBeTruthy();
  expect(screen.getByRole("link", { name: "Phone case" })).toBeTruthy();
  expect(requests).toContainEqual({
    url: "/orders",
    params: { page: 1, limit: 5 },
  });
  expect(requests).toContainEqual({
    url: "/products",
    params: { page: 1, limit: 5, stockStatus: "low_stock" },
  });
  expect(screen.queryByText(/Demo dashboard/)).toBeNull();
  expect(screen.queryByText("Total Revenue")).toBeNull();
});

it("explains the staff order scope and shows real empty states", async () => {
  const { view } = setup({ role: "staff", empty: true });
  view();
  expect(await screen.findByText("Chưa có đơn hàng.")).toBeTruthy();
  expect(
    await screen.findByText("Không có sản phẩm sắp hết hàng."),
  ).toBeTruthy();
  expect(
    screen.getByText(
      /xem toàn bộ lịch sử đơn hàng và quản lý đơn được giao/,
    ),
  ).toBeTruthy();
  expect(
    within(
      screen.getByRole("region", { name: "Thống kê đơn hàng" }),
    ).getAllByText("0"),
  ).toHaveLength(5);
});

it("does not represent failed product statistics as zero and permits retry", async () => {
  const { view, state } = setup();
  state.failStatistics = true;
  view();
  await screen.findByRole("button", { name: "Tải lại thống kê sản phẩm" });
  const section = screen.getByRole("region", { name: "Thống kê sản phẩm" });
  expect(within(section).getAllByText("—")).toHaveLength(4);
  state.failStatistics = false;
  fireEvent.click(
    screen.getByRole("button", { name: "Tải lại thống kê sản phẩm" }),
  );
  expect(await within(section).findByText("42")).toBeTruthy();
});

it("refreshes the live query data on demand", async () => {
  const { view, state } = setup();
  view();
  const section = screen.getByRole("region", { name: "Thống kê sản phẩm" });
  await within(section).findByText("42");
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Làm mới" }).hasAttribute("disabled"),
    ).toBe(false),
  );
  state.total = 43;
  fireEvent.click(screen.getByRole("button", { name: "Làm mới" }));
  expect(await within(section).findByText("43")).toBeTruthy();
});
