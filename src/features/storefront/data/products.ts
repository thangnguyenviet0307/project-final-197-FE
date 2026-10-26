import type { StorefrontProduct } from "@/features/storefront/types/storefront"
import { sourceProductListings } from "@/features/storefront/data/source-product-listings"
import { sourceProductDetails } from "@/features/storefront/data/source-product-details"

const categoryDetails = {
  "Dây cáp sạc": {
    caption: "Cáp kết nối và sạc cho nhiều chuẩn thiết bị.",
    description: "So sánh đầu nối, chiều dài và mức công suất được công bố trên từng trang sản phẩm trước khi chọn cáp.",
  },
  "Tai nghe": {
    caption: "Tai nghe có dây, Bluetooth và phụ kiện tai nghe.",
    description: "Khám phá các lựa chọn tai nghe và phụ kiện; mở trang nguồn để xem chi tiết kết nối và tương thích.",
  },
  "Pin sạc dự phòng": {
    caption: "Nguồn điện di động cho những ngày bận rộn.",
    description: "Xem dung lượng, cổng vào/ra và công suất cụ thể trên trang sản phẩm nguồn để chọn pin phù hợp.",
  },
  "Phụ kiện máy tính": {
    caption: "Chuột, bàn phím và phụ kiện cho góc làm việc.",
    description: "Tìm phụ kiện theo cách kết nối và nhu cầu sử dụng; thông tin kỹ thuật được dẫn tới trang sản phẩm nguồn.",
  },
  "Loa Bluetooth": {
    caption: "Loa không dây với nhiều kiểu dáng và công suất.",
    description: "Khám phá loa theo kích thước và nhu cầu nghe; kiểm tra thời lượng pin và tính năng tại trang nguồn.",
  },
  "Kính cường lực": {
    caption: "Kính bảo vệ màn hình cho nhiều dòng điện thoại.",
    description: "Đối chiếu chính xác dòng máy tương thích và kiểu kính trước khi chọn sản phẩm.",
  },
} as const

function inferBrand(name: string) {
  const brands = ["Hoco", "Baseus", "Wekome", "Kingkong", "MaxiTech", "AP"]
  return brands.find((brand) => name.toLocaleLowerCase("vi").includes(brand.toLocaleLowerCase("vi"))) ?? "Phụ kiện"
}

function mapListingToProduct(listing: (typeof sourceProductListings)[number]): StorefrontProduct {
  const details = sourceProductDetails.find((product) => product.sourceUrl === listing.sourceUrl)
  if (details) {
    return {
      ...details,
      image: listing.image,
      gallery: [listing.image],
      price: listing.price,
      cashPrice: listing.cashPrice,
      variants: [{ name: "Mẫu tiêu chuẩn", color: "#6b7280", image: listing.image }],
    }
  }

  return {
    id: `source-${listing.slug}`,
    slug: listing.slug,
    name: listing.name,
    category: listing.category,
    brand: inferBrand(listing.name),
    price: listing.price,
    cashPrice: listing.cashPrice,
    image: listing.image,
    gallery: [listing.image],
    description: `${listing.name}. Giá tham khảo từ website Phụ Kiện Giá Xưởng. Mở liên kết nguồn để xem quy cách, khả năng tương thích và thông tin cập nhật.`,
    features: [],
    variants: [{ name: "Mẫu tiêu chuẩn", color: "#6b7280", image: listing.image }],
    sourceUrl: listing.sourceUrl,
  }
}

const listedSourceUrls = new Set(sourceProductListings.map((product) => product.sourceUrl))
const additionalDetailedProducts = sourceProductDetails.filter((product) => !listedSourceUrls.has(product.sourceUrl))

export const storefrontProducts: StorefrontProduct[] = [
  ...sourceProductListings.map(mapListingToProduct),
  ...additionalDetailedProducts,
]

export const storefrontCategories = Object.entries(categoryDetails).map(([name, details]) => {
  const sourceImage = sourceProductListings.find((product) => product.category === name)?.image
  if (!sourceImage) {
    throw new Error(`Missing source image for storefront category "${name}"`)
  }

  return { name, image: sourceImage, ...details }
})
