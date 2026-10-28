import { expect, it } from "vitest"
import { resolveApiBaseUrl } from "@/services/api-base-url"

it("keeps loopback refresh cookies same-site when the frontend uses another local alias", () => {
  expect(resolveApiBaseUrl("http://localhost:5000/api/v1/", "http://127.0.0.1:5173")).toBe("http://127.0.0.1:5000/api/v1")
  expect(resolveApiBaseUrl("http://127.0.0.1:5000/api/v1", "http://localhost:5173")).toBe("http://localhost:5000/api/v1")
})
it("preserves production hosts, protocols, relative paths and server-side configuration", () => {
  expect(resolveApiBaseUrl("https://api.example.test/api/v1", "https://shop.example.test")).toBe("https://api.example.test/api/v1")
  expect(resolveApiBaseUrl("https://localhost:5000/api/v1", "http://localhost:5173")).toBe("https://localhost:5000/api/v1")
  expect(resolveApiBaseUrl("/api/v1/", "http://localhost:5173")).toBe("/api/v1")
  expect(resolveApiBaseUrl("http://localhost:5000/api/v1/")).toBe("http://localhost:5000/api/v1")
})
