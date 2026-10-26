import type {
  SidebarVariant,
  SidebarCollapsibleOption,
  SidebarSideOption,
  RadiusOption,
  BrandColor,
} from "@/types/theme-customizer"

// Radius options
export const radiusOptions: RadiusOption[] = [
  { name: "0", value: "0rem" },
  { name: "0.3", value: "0.3rem" },
  { name: "0.5", value: "0.5rem" },
  { name: "0.75", value: "0.75rem" },
  { name: "1.0", value: "1rem" },
]

// Sidebar variant options
export const sidebarVariants: SidebarVariant[] = [
  { name: "Mặc định", value: "sidebar", description: "Bố cục thanh bên tiêu chuẩn" },
  {
    name: "Nổi",
    value: "floating",
    description: "Thanh bên nổi có đường viền",
  },
  {
    name: "Lồng trong",
    value: "inset",
    description: "Thanh bên lồng trong có góc bo tròn",
  },
]

// Sidebar collapsible options
export const sidebarCollapsibleOptions: SidebarCollapsibleOption[] = [
  { name: "Ẩn ra ngoài", value: "offcanvas", description: "Trượt ra ngoài màn hình" },
  { name: "Biểu tượng", value: "icon", description: "Thu gọn chỉ còn biểu tượng" },
  { name: "Không", value: "none", description: "Luôn hiển thị" },
]

// Sidebar side options
export const sidebarSideOptions: SidebarSideOption[] = [
  { name: "Trái", value: "left" },
  { name: "Phải", value: "right" },
]

// Define brand colors for custom color inputs
export const baseColors: BrandColor[] = [
  { name: "Primary", cssVar: "--primary" },
  { name: "Primary Foreground", cssVar: "--primary-foreground" },
  { name: "Secondary", cssVar: "--secondary" },
  { name: "Secondary Foreground", cssVar: "--secondary-foreground" },
  { name: "Accent", cssVar: "--accent" },
  { name: "Accent Foreground", cssVar: "--accent-foreground" },
  { name: "Muted", cssVar: "--muted" },
  { name: "Muted Foreground", cssVar: "--muted-foreground" },
]
