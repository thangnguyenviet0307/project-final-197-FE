import type { StorefrontProduct } from "@/features/storefront/types/storefront"
import { sourceProductListings } from "@/features/storefront/data/source-product-listings"
import { sourceProductDetails } from "@/features/storefront/data/source-product-details"

const categoryDetails = {
  "Dây cáp sạc": {
    caption: "Cáp kết nối và sạc cho nhiều chuẩn thiết bị.",
    description: "Khám phá cáp sạc với nhiều kiểu đầu nối và lựa chọn phù hợp với thiết bị bạn đang dùng.",
  },
  "Tai nghe": {
    caption: "Tai nghe có dây, Bluetooth và phụ kiện tai nghe.",
    description: "Khám phá tai nghe và phụ kiện theo kiểu kết nối, thiết kế và thói quen sử dụng.",
  },
  "Pin sạc dự phòng": {
    caption: "Nguồn điện di động cho những ngày bận rộn.",
    description: "Tìm pin sạc dự phòng theo nhu cầu di chuyển, thiết bị cần sạc và kiểu kết nối.",
  },
  "Phụ kiện máy tính": {
    caption: "Chuột, bàn phím và phụ kiện cho góc làm việc.",
    description: "Bổ sung tiện ích cho góc làm việc với các phụ kiện máy tính theo nhu cầu sử dụng.",
  },
  "Loa Bluetooth": {
    caption: "Loa không dây với nhiều kiểu dáng và công suất.",
    description: "Khám phá loa Bluetooth theo kiểu dáng và không gian nghe nhạc bạn yêu thích.",
  },
  "Kính cường lực": {
    caption: "Kính bảo vệ màn hình cho nhiều dòng điện thoại.",
    description: "Tìm kính bảo vệ màn hình phù hợp với dòng điện thoại bạn đang sử dụng.",
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
    description: `${listing.name}. Xem hình ảnh và thông tin sản phẩm để lựa chọn phụ kiện phù hợp với thiết bị của bạn.`,
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
