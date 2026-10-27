import { storefrontCategories } from "@/features/storefront/data/products"

const newsItems = [
  {
    category: "Dây cáp sạc",
    label: "CẨM NANG CHỌN MUA",
    title: "Chọn cáp sạc phù hợp: bắt đầu từ cổng kết nối",
    description:
      "Xác định cổng kết nối trên thiết bị và củ sạc trước khi chọn cáp. Đừng quên kiểm tra chiều dài mong muốn và thông tin sản phẩm cụ thể.",
  },
  {
    category: "Tai nghe",
    label: "GỢI Ý SỬ DỤNG",
    title: "Tai nghe có dây hay Bluetooth: đâu là lựa chọn của bạn?",
    description:
      "Thường xuyên di chuyển hay chủ yếu nghe tại bàn làm việc? Xác định thói quen sử dụng sẽ giúp bạn cân nhắc kiểu kết nối và thiết kế phù hợp.",
  },
  {
    category: "Kính cường lực",
    label: "MẸO MUA SẮM",
    title: "Ba điều cần kiểm tra trước khi mua kính cường lực",
    description:
      "Đối chiếu đúng tên dòng máy, kích thước màn hình và phần camera trước khi đặt mua để chọn loại kính tương thích với thiết bị.",
  },
]

export const storefrontArticles = newsItems.map((item) => {
  const category = storefrontCategories.find(
    (storefrontCategory) => storefrontCategory.name === item.category,
  )

  if (!category) {
    throw new Error(`Missing storefront category for news article "${item.title}"`)
  }

  return { ...item, image: category.image }
})
