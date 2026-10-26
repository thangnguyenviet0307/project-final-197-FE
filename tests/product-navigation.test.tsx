import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { ProductForm } from "@/features/products/components/product-form";
import type { Product } from "@/features/products/types/products";
import ProductDetailPage from "@/pages/admin/products/detail";
import ProductCreatePage from "@/pages/admin/products/create";

const id = "a".repeat(24);
vi.mock("@/features/products/hooks/use-create-product", () => ({
  useCreateProduct: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("@/features/products/components/product-description-editor", () => ({
  ProductDescriptionEditor: ({
    value,
    onChange,
    disabled,
  }: {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
  }) => (
    <textarea
      id="description"
      aria-label="Mô tả"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));
vi.mock("@/features/categories/hooks/use-categories", () => ({
  useCategories: () => ({
    data: [{ _id: "a".repeat(24), name: "Cases", isActive: true }],
    isPending: false,
  }),
}));
vi.mock("@/features/brands/hooks/use-brands", () => ({
  useBrands: () => ({
    data: [{ _id: "a".repeat(24), name: "Thương hiệu", isActive: true }],
    isPending: false,
  }),
}));
vi.mock("@/features/products/hooks/use-product", () => ({
  useProduct: () => ({
    data: {
      _id: "a".repeat(24),
      product_name: "Phone case",
      category: null,
      brand: null,
      model_year: 2026,
    },
  }),
}));
vi.mock("@/layout/admin/base-layout", () => ({
  BaseLayout: ({ children }: { children: import("react").ReactNode }) => (
    <main>{children}</main>
  ),
}));
const product: Product = {
  _id: id,
  product_name: "Phone case",
  model_year: 2026,
  category: id,
  brand: id,
  stock: 1,
};
function setup(save = vi.fn().mockResolvedValue(undefined)) {
  const router = createMemoryRouter(
    [
      {
        path: "/products/:id/edit",
        element: <ProductForm product={product} save={save} pending={false} />,
      },
      { path: "/products/:id", element: <p>Chi tiết sản phẩm</p> },
      { path: "/products", element: <p>Product list</p> },
    ],
    {
      initialEntries: [
        {
          pathname: `/products/${id}/edit`,
          state: { returnTo: "/products?page=3&limit=20&color=blue" },
        },
      ],
    },
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { router, save };
}
it("blocks Cancel, keeps the draft, and leaves only after discard confirmation", async () => {
  setup();
  fireEvent.change(screen.getByLabelText("Mô tả"), {
    target: { value: "Draft" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
  expect(await screen.findByRole("dialog")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Tiếp tục chỉnh sửa" }));
  expect((screen.getByLabelText("Mô tả") as HTMLTextAreaElement).value).toBe(
    "Draft",
  );
  fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
  fireEvent.click(await screen.findByRole("button", { name: "Bỏ thay đổi" }));
  expect(await screen.findByText("Chi tiết sản phẩm")).toBeTruthy();
});
it("blocks other route navigation and protects closing or reloading a dirty tab", async () => {
  const { router } = setup();
  fireEvent.change(screen.getByLabelText("Mô tả"), {
    target: { value: "Draft" },
  });
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
  await act(async () => {
    await router.navigate("/products?page=3&color=blue");
  });
  expect(await screen.findByRole("dialog")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Bỏ thay đổi" }));
  expect(await screen.findByText("Product list")).toBeTruthy();
});
it("does not block clean forms or navigation after a successful save", async () => {
  const { router, save } = setup();
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  fireEvent.change(screen.getByLabelText("Mô tả"), {
    target: { value: "Saved description" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  expect(await screen.findByText("Chi tiết sản phẩm")).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(save).toHaveBeenCalledWith(
    { description: "Saved description" },
    product,
  );
  expect(router.state.location.state).toEqual({
    returnTo: "/products?page=3&limit=20&color=blue",
  });
});
it("allows navigation after the user reverts edits", async () => {
  setup();
  fireEvent.change(screen.getByLabelText("Mô tả"), {
    target: { value: "Draft" },
  });
  fireEvent.change(screen.getByLabelText("Mô tả"), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
  expect(await screen.findByText("Chi tiết sản phẩm")).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
});
it("retains the draft and guard after a save fails", async () => {
  setup(vi.fn().mockRejectedValue(new Error("Save failed")));
  fireEvent.change(screen.getByLabelText("Mô tả"), {
    target: { value: "Draft" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  await screen.findByText("Save failed");
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Hủy" }).hasAttribute("disabled"),
    ).toBe(false),
  );
  fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
  expect(await screen.findByRole("dialog")).toBeTruthy();
});
it("returns from detail to the exact list URL", async () => {
  const returnTo = "/products?page=3&limit=20&color=blue";
  const router = createMemoryRouter(
    [
      { path: "/products/:id", element: <ProductDetailPage /> },
      { path: "/products", element: <p>Restored list</p> },
    ],
    { initialEntries: [{ pathname: `/products/${id}`, state: { returnTo } }] },
  );
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={router} /></QueryClientProvider>);
  fireEvent.click(screen.getByRole("link", { name: "Quay lại" }));
  expect(await screen.findByText("Restored list")).toBeTruthy();
  expect(router.state.location.pathname + router.state.location.search).toBe(
    returnTo,
  );
});
it("guards a new product draft and preserves its list URL on cancellation", async () => {
  const returnTo = "/products?page=2&size=XL";
  const router = createMemoryRouter(
    [
      { path: "/products/new", element: <ProductCreatePage /> },
      { path: "/products", element: <p>Restored list</p> },
    ],
    { initialEntries: [{ pathname: "/products/new", state: { returnTo } }] },
  );
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={router} /></QueryClientProvider>);
  fireEvent.change(screen.getByLabelText("Tên sản phẩm"), {
    target: { value: "New case" },
  });
  fireEvent.click(screen.getByRole("link", { name: "Về danh sách sản phẩm" }));
  fireEvent.click(await screen.findByRole("button", { name: "Bỏ thay đổi" }));
  expect(await screen.findByText("Restored list")).toBeTruthy();
  expect(router.state.location.pathname + router.state.location.search).toBe(
    returnTo,
  );
});
