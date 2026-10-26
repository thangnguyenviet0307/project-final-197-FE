import { expect, it } from "vitest"
import { pageNumbers } from "@/utils/pagination"

it.each([
  { page: 1, total: 6, expected: [1, 2, "end-gap", 6] },
  { page: 3, total: 6, expected: [1, 2, 3, 4, "end-gap", 6] },
  { page: 5, total: 10, expected: [1, "start-gap", 4, 5, 6, "end-gap", 10] },
  { page: 6, total: 6, expected: [1, "start-gap", 5, 6] },
  { page: 1, total: 1, expected: [1] },
  { page: 1, total: 2, expected: [1, 2] },
  { page: 2, total: 3, expected: [1, 2, 3] },
  { page: 1, total: 0, expected: [] },
])("shows boundaries and current-page neighbors for $page/$total", ({ page, total, expected }) => {
  expect(pageNumbers(page, total)).toEqual(expected)
})
