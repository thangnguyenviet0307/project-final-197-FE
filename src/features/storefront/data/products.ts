import type { StorefrontProduct } from "@/features/storefront/types/storefront"

const images = {
  headphones:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85",
  camera:
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85",
  watch:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85",
  speaker:
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1000&q=85",
  phone:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85",
  laptop:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85",
  headphonesDark:
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=85",
  cameraLens:
    "https://images.unsplash.com/photo-1510127034890-1ee6d7b9f8d3?auto=format&fit=crop&w=1000&q=85",
}

const blackVariant = (image: string) => ({
  name: "Đen",
  color: "#171717",
  image,
  stock: 12,
})

export const storefrontProducts: StorefrontProduct[] = [
  {
    id: "audio-01",
    slug: "tai-nghe-chup-tai-studio",
    name: "Tai nghe chụp tai Studio",
    category: "Âm thanh",
    brand: "Sonic",
    price: 1890000,
    compareAtPrice: 2390000,
    image: images.headphones,
    gallery: [images.headphones, images.headphonesDark],
    badge: "Bán chạy",
    rating: 4.9,
    reviewCount: 128,
    soldCount: 356,
    description:
      "Âm thanh chi tiết, đệm tai êm và thiết kế gọn nhẹ cho những giờ nghe nhạc, học tập hay làm việc tập trung.",
    features: ["Âm thanh cân bằng, rõ nét", "Đệm tai mềm, đeo thoải mái", "Kết nối Bluetooth ổn định"],
    variants: [
      blackVariant(images.headphones),
      { name: "Bạc", color: "#c6c9cd", image: images.headphonesDark, stock: 8 },
    ],
  },
  {
    id: "camera-01",
    slug: "may-anh-mirrorless-compact",
    name: "Máy ảnh Mirrorless Compact",
    category: "Máy ảnh",
    brand: "Lumina",
    price: 12490000,
    compareAtPrice: 13990000,
    image: images.camera,
    gallery: [images.camera, images.cameraLens],
    badge: "Ưu đãi",
    rating: 4.8,
    reviewCount: 74,
    soldCount: 142,
    description:
      "Chiếc máy ảnh nhỏ gọn dành cho những chuyến đi, với khả năng ghi lại màu sắc tự nhiên và khoảnh khắc sống động.",
    features: ["Thiết kế gọn nhẹ", "Lấy nét nhanh và chính xác", "Màn hình xem ảnh sắc nét"],
    variants: [blackVariant(images.camera), { name: "Bạc", color: "#c6c9cd", image: images.cameraLens, stock: 6 }],
  },
  {
    id: "wearable-01",
    slug: "dong-ho-thong-minh-active",
    name: "Đồng hồ thông minh Active",
    category: "Đồng hồ",
    brand: "Tempo",
    price: 2490000,
    compareAtPrice: 2990000,
    image: images.watch,
    gallery: [images.watch, images.phone],
    badge: "Flash sale",
    rating: 4.7,
    reviewCount: 96,
    soldCount: 281,
    description:
      "Theo dõi vận động mỗi ngày, xem nhanh thông báo và phối hợp dễ dàng với phong cách thường nhật.",
    features: ["Theo dõi hoạt động hằng ngày", "Mặt đồng hồ dễ đọc", "Dây đeo êm, điều chỉnh nhanh"],
    variants: [blackVariant(images.watch), { name: "Bạc", color: "#c6c9cd", image: images.phone, stock: 10 }],
  },
  {
    id: "audio-02",
    slug: "loa-bluetooth-portable",
    name: "Loa Bluetooth Portable",
    category: "Âm thanh",
    brand: "Sonic",
    price: 1590000,
    compareAtPrice: 1890000,
    image: images.speaker,
    gallery: [images.speaker, images.headphonesDark],
    rating: 4.8,
    reviewCount: 53,
    soldCount: 197,
    description:
      "Mang âm nhạc theo bạn với chiếc loa không dây nhỏ gọn, âm thanh mạnh mẽ cho những buổi gặp gỡ bạn bè.",
    features: ["Kết nối không dây tiện lợi", "Kích thước nhỏ gọn", "Điều khiển đơn giản"],
    variants: [blackVariant(images.speaker), { name: "Xanh", color: "#417b82", image: images.headphonesDark, stock: 9 }],
  },
  {
    id: "mobile-01",
    slug: "dien-thoai-smartphone-pro",
    name: "Điện thoại Smartphone Pro",
    category: "Điện thoại",
    brand: "Nova",
    price: 8990000,
    image: images.phone,
    gallery: [images.phone, images.laptop],
    badge: "Mới",
    rating: 4.6,
    reviewCount: 41,
    soldCount: 89,
    description:
      "Trải nghiệm hằng ngày mượt mà với màn hình sống động, thiết kế thanh lịch và camera linh hoạt.",
    features: ["Màn hình hiển thị sống động", "Camera đa dụng", "Thiết kế vừa tay"],
    variants: [blackVariant(images.phone), { name: "Xanh", color: "#417b82", image: images.laptop, stock: 7 }],
  },
  {
    id: "computer-01",
    slug: "laptop-mong-nhe-everyday",
    name: "Laptop mỏng nhẹ Everyday",
    category: "Máy tính",
    brand: "Nova",
    price: 16990000,
    compareAtPrice: 18490000,
    image: images.laptop,
    gallery: [images.laptop, images.camera],
    rating: 4.8,
    reviewCount: 62,
    soldCount: 104,
    description:
      "Người bạn đồng hành gọn nhẹ cho công việc và học tập, với không gian màn hình thoải mái.",
    features: ["Thiết kế mỏng nhẹ", "Bàn phím gõ thoải mái", "Phù hợp học tập và làm việc"],
    variants: [blackVariant(images.laptop), { name: "Bạc", color: "#c6c9cd", image: images.camera, stock: 5 }],
  },
  {
    id: "audio-03",
    slug: "tai-nghe-khong-day-comfort",
    name: "Tai nghe không dây Comfort",
    category: "Âm thanh",
    brand: "Sonic",
    price: 1290000,
    compareAtPrice: 1590000,
    image: images.headphonesDark,
    gallery: [images.headphonesDark, images.headphones],
    rating: 4.7,
    reviewCount: 37,
    soldCount: 166,
    description:
      "Thiết kế không dây tiện dụng, phù hợp nghe nhạc trên đường đi làm hoặc trong giờ nghỉ.",
    features: ["Thiết kế ôm tai", "Kết nối nhanh chóng", "Điều khiển ngay trên tai nghe"],
    variants: [blackVariant(images.headphonesDark), { name: "Trắng", color: "#f2f2f2", image: images.headphones, stock: 11 }],
  },
  {
    id: "camera-02",
    slug: "ong-kinh-zoom-da-dung",
    name: "Ống kính Zoom đa dụng",
    category: "Máy ảnh",
    brand: "Lumina",
    price: 6790000,
    image: images.cameraLens,
    gallery: [images.cameraLens, images.camera],
    rating: 4.5,
    reviewCount: 22,
    soldCount: 54,
    description:
      "Ống kính linh hoạt cho nhiều khung hình, từ chân dung gần gũi đến những khung cảnh rộng.",
    features: ["Dải tiêu cự linh hoạt", "Lấy nét êm", "Phù hợp nhiều bối cảnh"],
    variants: [blackVariant(images.cameraLens)],
  },
]

export const storefrontCategories = [
  { name: "Âm thanh", image: images.headphones, caption: "Nghe trọn từng giai điệu" },
  { name: "Máy ảnh", image: images.camera, caption: "Lưu giữ khoảnh khắc" },
  { name: "Đồng hồ", image: images.watch, caption: "Công nghệ trên cổ tay" },
  { name: "Điện thoại", image: images.phone, caption: "Kết nối theo cách của bạn" },
]
